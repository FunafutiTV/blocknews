'use client'

// Component
import Post from "./Post";

// Wagmi
import { readContract } from '@wagmi/core';

// Chakra UI
import { Box, Spinner, Text } from "@chakra-ui/react";

// React
import { useState, useEffect } from 'react';

// Contracts informations
import { abi, contractAddress } from '../constants';

export default function CategoryFeed({ newPost, category }) {

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [postsIDs, setPostsIDs] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [noSecondCall, setNoSecondCall] = useState(false);

    // Smart contract call to getLastPostsFromCategory function
    async function retrievePostsFromCategory() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getLastPostsFromCategory",
                args: [category],
            });
            setPostsIDs(data);
        } 
        catch (err) {
            console.error(err.message);
        }
    }

    // Smart contract call to getPublication function
    async function retrievePost(id) {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getPublication",
                args: [id],
            });
            if (!data.isCommentOfID && !data.isRepostOf) { // Don't display post if it's a comment or a repost
                setDisplayedPosts((posts) => [...posts, <Post publication={data} key={id}/>])
            }
        } 
        catch (err) {
            console.error(err.message);
        }
    }

    // First useEffect
    useEffect(() => {
        setIsLoading(true);
        setDisplayedPosts([]);
        const fetchPosts = async() => {await retrievePostsFromCategory()};
        fetchPosts();
    }, [newPost, category]);

    // Second useEffect
    useEffect(() => {
        if (postsIDs.length && !noSecondCall) {
            for(let i = postsIDs.length - 1; i >= 0; i--) {
                postsIDs[i] = postsIDs[i].toString();
            };
            postsIDs.sort(function(a, b) { // Sort array from most recent to oldest
                return b - a;
            })
            setNoSecondCall(true);
            setInterval(() => {setNoSecondCall(false)}, 100)
            const listWithoutDuplicate = Array.from(new Set(postsIDs)); // Delete duplicates in array
            const call = async(id) => {await retrievePost(id)}
            listWithoutDuplicate.map((id) => {
                if (id.toString() !== "0") {
                    call(id);
                }
            })
            setIsLoading(false);
        }
    }, [postsIDs]);

    return(
        <Box maxW="xl" w="full" mx="auto">
            {isLoading ? <Spinner/> :
                <>{displayedPosts.length == 0 ? <Text fontWeight="bold" textAlign="center">No recent post found.</Text> :
                    <>{displayedPosts.map((post, index) => (<Box key={index} mb={6}>{post}</Box>))}</>
                }</>
            }
        </Box>
    )
}