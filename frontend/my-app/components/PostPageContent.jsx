'use client'
import Post from "./Post";
import Comment from "./Comment";

import { Box, Text, Spinner } from "@chakra-ui/react";

import { readContract } from '@wagmi/core';

// Contracts informations
import { abi, contractAddress } from '../constants';

import { useState, useEffect } from 'react';

export default function PostPageContent({ id }) {

    const [isLoading, setIsLoading] = useState(true);

    const [publication, setPublication] = useState({});

    const [parent, setParent] = useState({});

    const [displayedComments, setDisplayedComments] = useState([]);

    const [noSecondCall, setNoSecondCall] = useState(false);

    const [newComment, setNewComment] = useState(0);

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
    }, [newComment])

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
    
    return(
        <Box maxW="xl" mx="auto" p={4}>
            {isLoading ? <Spinner/> : <>
                {parent.exists && (<Box maxW="80%" borderBottom="1px solid #ddd" p={4} ml={-10} mb={4}>
                    <Text fontWeight="bold" mb={2}>Parent post</Text>
                    <Post publication={parent} />
                </Box>)}

                <Box width="150%">
                    <Post publication={publication} />
                </Box>

                <Box borderBottom="1px solid #ddd">
                    <Comment id={publication.id} setNewComment={setNewComment} mb={4} />
                </Box>

                {displayedComments.length > 0 && (<Box p={4} maxW="80%" ml={10}>
                    <Text fontWeight="bold" mb={2}>Comments</Text>
                    {displayedComments}
                </Box>)}
            </>}
        </Box>
    )
    
}