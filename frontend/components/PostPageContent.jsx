'use client'

// Components
import Post from "./Post";
import Comment from "./Comment";

// CSS
import "./styles/styles.css"

// Chakra UI
import { Box, Text, Spinner } from "@chakra-ui/react";

// Wagmi
import { readContract } from '@wagmi/core';

// Contracts informations
import { abi, contractAddress } from '../constants';

// React
import { useState, useEffect } from 'react';

export default function PostPageContent({ id }) {

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [publication, setPublication] = useState({});
    const [parent, setParent] = useState({});
    const [displayedComments, setDisplayedComments] = useState([]);
    const [noSecondCall, setNoSecondCall] = useState(false);
    const [newComment, setNewComment] = useState(0);

    // Smart contract call to getPublication function (to retrieve the main post)
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
            console.error(err.message);
            setIsLoading(false);
        }
    }

    // Smart contract call to getPublication function (to retrieve the parent post, if it exists)
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
            console.error(err.message);
            setIsLoading(false);
        }
    }

    // Smart contract call to getPublication (to retrieve the main post's comments)
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
            console.error(err.message);
        }
    }

    // First useEffect
    useEffect(() => {
        async function call() { await retrievePost() };
        call();
    }, [newComment])

    // Second useEffect
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
        <Box className="page" maxW="xl" mx="auto" pl={4} pr={4} textAlign="center">
            {isLoading ? <Spinner/> : <>
                {parent.exists && (<Box maxW="80%" borderBottom="1px solid #ddd" p={4} margin="auto" mb={4}>
                    <Text fontWeight="bold" mb={2} textAlign="center">Parent post</Text>
                    <Post publication={parent} />
                </Box>)}

                <Box>
                    <Post publication={publication} postPage />
                </Box>

                {publication.commentsIDs.length < 40 ?
                    <Box borderBottom="1px solid #ddd">
                        <Comment id={publication.id} setNewComment={setNewComment} mb={4} />
                    </Box> 
                : <></>}

                {displayedComments.length > 0 && (<Box p={4} textAlign="center" maxW="80%" margin="auto">
                    <Text fontWeight="bold" mb={2} textAlign="center">Comments</Text>
                    {displayedComments}
                </Box>)}
            </>}
        </Box>
    )
    
}