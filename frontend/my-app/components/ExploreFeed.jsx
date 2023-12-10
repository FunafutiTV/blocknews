'use client'

import Post from "./Post";

import { readContract } from '@wagmi/core';

import { Box, Spinner } from "@chakra-ui/react";

import { useState, useEffect } from 'react';

import { abi, contractAddress } from '../constants';

export default function ExploreFeed({ newPost }) {

    const [isLoading, setIsLoading] = useState(true);

    const [displayedPosts, setDisplayedPosts] = useState([]);

    const [lastPostID, setLastPostID] = useState(0);

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

    useEffect(() => {
        setIsLoading(true);
        const call = async () => {await retrieveLastPostID()};
        call();
    }, [newPost]);

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