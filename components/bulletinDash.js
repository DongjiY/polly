import BulletinRow from '../components/bulletinRow'
import { getCurrentUnix, unixToReg } from '../lib/timestamp'
import React, { useState, useRef, useEffect } from 'react'
import Router from 'next/router'

export default function BulletinDash(props){

    const user = {
        uid: props.uid,
        username: props.username,
        cityID: props.cityid,
        isLoggedIn: props.login,
    }

    const [opened,setOpened] = useState(new Map())
    const [test,setTest] = useState(false)

    const handleOpen = (postid,value) => {
        setOpened(opened.set(postid,value))
        console.log('opened is changed!',opened)
    }

    const { bulletins } = props.bulletins


    const searchForBulletin = (targetID, bulletinArr) => {
        //binary search through comments array
        //wont work atm bc ids are strings and also not ints
        console.log(targetID, bulletinArr)
        var lp = 0
        var rp = bulletinArr.length-1
        while(lp <= rp){
            var mid = Math.floor((lp+rp)/2)
            if(parseInt(bulletinArr[mid]._id,16)/10000000000 == targetID){
                return mid
            }else if(targetID < parseInt(bulletinArr[mid]._id,16)/10000000000){
                lp = mid+1
            }else{
                rp = mid-1
            }
        }
        return -1
    }

    const handleCommentSubmit = async (body) => {
        if(body.comment.trim() === '') return false

        const response = await fetch('/api/posts/addcomment', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        }).then((res) => res.json()).catch((err) => console.error('> bulletinDash.js',err))

        console.log(response)
        if(response.success){
            //add the new comment to the shit
            let index = searchForBulletin(parseInt(body.bulletinpostID,16)/10000000000, bulletins) // returns the index of the post where we need to inject our comment
            body._id = response.commentID
            bulletins[index].comments.unshift(body)
            console.log(bulletins[index].comments)
            setTest(!test)
            return true
        }
        return false
    }
    
    // const { bulletins } = useBulletin(user)

    return (
        <>
            {bulletins !== undefined && (
                <>
                    <div className="flex items-center relative w-full">
                        <h1 className="text-slate-700 text-center w-full text-4xl font-bold mt-3 mb-5">Community Bulletin</h1>
                        <button onClick={() => Router.push("/create")} className="absolute p-5 rounded-full bg-emerald-300 shadow text-white right-4 hover:bg-emerald-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>    
                        </button>
                    </div>

                    {/* <p>{JSON.stringify(bulletins)}</p> */}
                
                    <div className="w-full">
                        {JSON.stringify(bulletins)==='[]' ? (
                            <div className="flex flex-col justify-center items-center mx-auto p-5 text-slate-600 font-dongji">
                                <h1>It's lonely in here <span className="text-2xl">😔</span></h1>
                                <h2>Add a post for your community to see</h2>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center items-center mx-auto p-5 font-dongji">
                                {bulletins.map((thisBulletin) => (
                                    <React.Fragment key={[thisBulletin._id,thisBulletin.upvotes,thisBulletin.downvotes]}>
                                        <BulletinRow
                                            key = {[thisBulletin._id, thisBulletin.comments.length]}
                                            width={'wide'}
                                            up={thisBulletin.upvotes}
                                            down={thisBulletin.downvotes}
                                            statement={thisBulletin.statement}
                                            body={thisBulletin.body}
                                            comments={thisBulletin.comments}
                                            mapEnabled={thisBulletin.map}
                                            postid={thisBulletin._id}
                                            timestamp={unixToReg(thisBulletin.timestamp)}
                                            action={[thisBulletin?.useractions[0]?.action?.upvote||null, thisBulletin?.useractions[0]?.action?.downvote||null]}
                                            uid={user.uid}
                                            username={user.username}
                                            handleOpen={(a,b) => handleOpen(a,b)}
                                            open={opened.has(thisBulletin._id)?opened.get(thisBulletin._id):false}
                                            isAuthor={thisBulletin.author.authorID == user.uid}
                                            authorName={thisBulletin.author.authorName}
                                            handleCommentSubmit={(a) => handleCommentSubmit(a)}
                                        >
                                            <iframe name="map" width="450" height="300" className="hidden mt-2 rounded border-2 border-violet-300" loading="lazy" allowFullScreen src={thisBulletin.mapLink} key={thisBulletin.mapLink}></iframe> 
                                        </BulletinRow>
                                    </React.Fragment>
                                ))}
                            </div>    
                        )}       
                    </div>
                    {/* <p>{console.log('opened is reset!',opened)}</p> */}
                </>
            )}

        </>
    )
}