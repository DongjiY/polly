import { getSessionSsr } from "../../../lib/redis-auth/wrappers";
import { runner } from "../../../lib/database/dbusers";
import { destroyResetCode } from "../../../lib/redis-auth/sessions";
const bcrypt = require('bcrypt');
const saltRounds = 10

export default async function handler(req,res){
    if(req.method === "POST"){
        const user = await getSessionSsr(req)
        const { uid, newPass } = await req.body

        if(!user || user.uid !== uid) {
            res.status(401).end();
            console.log("> passwordreset.js: ERROR: User not logged in!")
            return
        }

        try{
            await bcrypt.hash(newPass,saltRounds, async (err,hash) => {
                if(err){
                    res.status(500).json({message:err})
                }
                const resdb = await runner('editPassword',[ uid,hash ])
                console.log('> passwordreset.js: Result:', resdb)
    
                if(!resdb.success){
                    res.status(500).json({message:resdb.error})
                }

                await destroyResetCode(uid)
                res.json(resdb)
            })  
        }catch(err){
            console.log('> passwordreset.js:', err)
            res.status(500).json({
                success: false,
                msg: err,
            })
        }
    }else{
        res.status(405).json({ message: "POST Requests Only. Reference Docs at Pollyapp.io/documentation"})
    }
}