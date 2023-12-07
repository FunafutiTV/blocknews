'use client'
import Post from "./Post";
import Comment from "./Comment";

import { readContract } from '@wagmi/core';

// Contracts informations
import { abi, contractAddress } from '@/constants';

import { useState, useEffect } from 'react';

export default function PostPageContent({ id }) {

    const [isLoading, setIsLoading] = useState(true);

    const [publication, setPublication] = useState({});

    const [parent, setParent] = useState({});

    const [displayedComments, setDisplayedComments] = useState([]);

    const [noSecondCall, setNoSecondCall] = useState(false);

    async function retrievePost() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getPublication",
                args: [id],
            });
            setPublication(data);
            setIsLoading(false);
        } 
        catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    }

    async function retrieveParent(_id) {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getPublication",
                args: [_id],
            });
            setParent(data);
            setIsLoading(false);
        } 
        catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    }

    async function retrieveComment(id) {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getPublication",
                args: [id],
            });
            setDisplayedComments((comments) => [...comments, <Post publication={data} key={id}/>]);
        } 
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        async function call() { await retrievePost() };
        call();
    }, [])

    useEffect(() => {
        async function call() { await retrieveParent(publication.isCommentOfID) };
        if (publication.isCommentOfID) {
            call();
        }
        if (publication.commentsIDs && !noSecondCall) {
            setNoSecondCall(true);
            setInterval(() => {setNoSecondCall(false)}, 100)
            const fetchPost = async(id) => {await retrieveComment(id)};
            setDisplayedComments([]);
            publication.commentsIDs.map((id) => {
                fetchPost(id)
            });
            setIsLoading(false);
        }
    }, [publication])

    if (isLoading) return <>Loading</>
    
    return(
        <>
            {parent.exists ? <Post publication={parent}/> : <></>}
            <Post publication={publication}/>
            <Comment id={publication.id}/>
            {displayedComments}
        </>
    )
    
}