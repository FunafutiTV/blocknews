'use client'

// Component
import Post from "./Post";

// Wagmi
import { readContract } from '@wagmi/core';

// Chakra UI
import { Box, Spinner, Button, Text } from "@chakra-ui/react";

// React
import { useState, useEffect } from 'react';

// Contracts informations
import { abi, contractAddress } from '../constants';

export default function ExploreFeed({ newPost, seeMoreNumber }) {

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [lastPostID, setLastPostID] = useState(0);
    const [allPostsDisplayed, setAllPostsDisplayed] = useState(false);
    const [seeMore, setSeeMore] = useState(false);

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
                setDisplayedPosts((posts) => [...posts, <Post publication={data} key={id}/>]);
            }
        } 
        catch (err) {
            console.error(err.message);
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
            console.error(err.message);
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
        if (lastPostID) {
            const fetchPost = async(id) => {await retrievePost(id)};
            setDisplayedPosts([]);
            for(let i = lastPostID - 40 * seeMoreNumber; i > lastPostID - 40 * (seeMoreNumber + 1); i--) {
                if (i <= 0) {
                    setAllPostsDisplayed(true);
                    break;
                }
            fetchPost(i);
            }
        }
        setIsLoading(false);
    }, [lastPostID]);

    return(
        <Box maxW="xl" w="full" mx="auto">
            {isLoading ? <Spinner/> :
                <>{displayedPosts.length == 0 ? <Text fontWeight="bold" textAlign="center">No recent post found.</Text> :
                    <>
                        {displayedPosts.map((post, index) => (<Box key={index} mb={6}>{post}</Box>))}
                        {allPostsDisplayed ? <></> : <>{seeMore ? <ExploreFeed newPost={newPost} seeMoreNumber={seeMoreNumber + 1}/> : <Button onClick={() => {setSeeMore(true)}}>See more</Button>}</>}
                    </>
                }</>
            }
        </Box>
    )
}