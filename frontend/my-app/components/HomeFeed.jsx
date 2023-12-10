'use client'

// Component
import Post from "./Post";

// Chakra UI
import { Box, Spinner } from "@chakra-ui/react"

// Wagmi
import { readContract } from '@wagmi/core';
import { useAccount } from 'wagmi'

// React
import { useState, useEffect } from 'react';

// Contracts informations
import { abi, contractAddress } from '../constants';

export default function ExploreFeed({ newPost }) {

    // Account
    const { address } = useAccount(); 

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [followingsList, setFollowingsList] = useState([]);
    const [postsList, setPostsList] = useState([]);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [allPostsFetched, setAllPostsFetched] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    // Smart contract call to getUser function (to retrieve current user's followings list)
    async function retrieveFollowingsList() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getUser",
                args: [address],
            });
                setFollowingsList(data.followingsList.followList);
        } 
        catch (err) {
            console.log(err);
        }
    }

    // Smart contract call to getUser function (to retrieve each of current user's followings)
    async function retrievePosts(_addr, i) {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getUser",
                args: [_addr],
            });
            data.postsIDs.map((id) => {
                setPostsList((postsList) => [...postsList, id.toString()]);
            })
            if (i === -2) { 
                setAllPostsFetched(true);
            }
        } 
        catch (err) {
            console.log(err);
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
            if (!data.isCommentOfID) { // Don't display post if it's a comment
                setDisplayedPosts((posts) => [...posts, <Post publication={data} key={id}/>])
            }
        } 
        catch (err) {
            console.log(err);
        }
    }

    // First useEffect
    useEffect(() => {
        setTimeout(() => setHasMounted(true), 10);
    }, []);

    // Second useEffect
    useEffect(() => {
        setIsLoading(true);
        setDisplayedPosts([]);
        setAllPostsFetched(false);
        const call = async() => {await retrieveFollowingsList()};
        call();
    }, [newPost]);

    // Third useEffect
    useEffect(() => {
        const call = async(addr, i) => {await retrievePosts(addr, i)}
        if (hasMounted) {
            if (followingsList.length > 0) {
                followingsList.forEach((user, i) => {
                    call(user, i);
                })
                call(address, -2); // After retrieving posts from all followings, retrieve post from user himself
            } else {
                call(address, -2); // If no followings, retrieve post from the user himself only
            }
        }
    }, [followingsList]);

    // Fourth useEffect
    useEffect(() => {
        if (allPostsFetched) {
            postsList.sort(function(a, b) { // Sort array from most recent to oldest
                return b - a;
            })
            const listWithoutDuplicate = Array.from(new Set(postsList)); // Delete duplicates in array
            const call = async(id) => {await retrievePost(id)}
            listWithoutDuplicate.map((id) => {
                call(id);
            })
            setIsLoading(false);
        }
    }, [allPostsFetched]);

    return(
        <Box maxW="xl" w="full" mx="auto">
            {isLoading ? <Spinner/> :
                <>{displayedPosts.map((post, index) => (<Box key={index} mb={6}>{post}</Box>))}</>
            }
        </Box>
    )
}