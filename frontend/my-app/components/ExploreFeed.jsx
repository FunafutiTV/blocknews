'use client'

// Component
import Post from "./Post";

// Wagmi
import { readContract } from '@wagmi/core';

// Chakra UI
import { Box, Spinner } from "@chakra-ui/react";

// React
import { useState, useEffect } from 'react';

// Contracts informations
import { abi, contractAddress } from '../constants';

export default function ExploreFeed({ newPost }) {

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [lastPostID, setLastPostID] = useState(0);

    // Smart contract call to getPublication function
    async function retrievePost(id) {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getPublication",
                args: [id],
            });
            if (!data.isCommentOfID) {
                setDisplayedPosts((posts) => [...posts, <Post publication={data} key={id}/>]);
            }
        } 
        catch (err) {
            console.log(err);
        }
    }

    // Smart contract call to nextUnusedPublicationID public variable
    async function retrieveLastPostID() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "nextUnusedPublicationID",
            });
            setLastPostID(data.toString() - 1);
        } 
        catch (err) {
            console.log(err);
        }
    }

    // First useEffect
    useEffect(() => {
        setIsLoading(true);
        const call = async () => {await retrieveLastPostID()};
        call();
    }, [newPost]);

    // Second useEffect
    useEffect(() => {
        const fetchPost = async(id) => {await retrievePost(id)};
        setDisplayedPosts([]);
        for(let i = lastPostID; i > lastPostID - 25; i--) {
            if (i <= 0) {
                break;
            }
            fetchPost(i);
        }
        setIsLoading(false);
    }, [lastPostID]);

    return(
        <Box maxW="xl" w="full" mx="auto">
            {isLoading ? <Spinner/> :
                <>{displayedPosts.map((post, index) => (<Box key={index} mb={6}>{post}</Box>))}</>
            }
        </Box>
    )
}