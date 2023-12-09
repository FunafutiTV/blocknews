'use client'

import Post from "./Post";

import { readContract } from '@wagmi/core';

import { useState, useEffect } from 'react';

import { abi, contractAddress } from '../constants';

import { useSignMessage, useAccount } from 'wagmi'

export default function ExploreFeed({ newPost }) {

    const { address } = useAccount(); 

    const [isLoading, setIsLoading] = useState(true);

    const [followingsList, setFollowingsList] = useState([]);

    const [postsList, setPostsList] = useState([]);

    const [displayedPosts, setDisplayedPosts] = useState([]);

    const [allPostsFetched, setAllPostsFetched] = useState(false);

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

            if (i === followingsList.length - 1) {
                setAllPostsFetched(true);
            }
        } 
        catch (err) {
            console.log(err);
        }
    }

    async function retrievePost(id) {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getPublication",
                args: [id],
            });
            if (!data.isCommentOfID) {
                setDisplayedPosts((posts) => [...posts, <Post publication={data} key={id}/>])
            }
        } 
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        setIsLoading(true);
        setAllPostsFetched(false);
        const call = async() => {await retrieveFollowingsList()};
        call();
    }, [newPost]);

    useEffect(() => {
        const call = async(addr, i) => {await retrievePosts(addr, i)}
        if (followingsList.length > 0) {
            followingsList.forEach((user, i) => {
                call(user, i);
            })
        } else {
            call(address, -2);   
        }
    }, [followingsList]);

    useEffect(() => {
        if (allPostsFetched) {
            postsList.sort(function(a, b) {
                return b - a;
            })
            const listWithoutDuplicate = Array.from(new Set(postsList));
            const call = async(id) => {await retrievePost(id)}
            listWithoutDuplicate.map((id) => {
                call(id);
            })
            setIsLoading(false);
        }
    }, [allPostsFetched]);

    if (isLoading) return(<>Spinner</>)

    return(<>{displayedPosts}</>)
}