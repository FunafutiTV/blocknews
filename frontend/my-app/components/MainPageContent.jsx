'use client'
// ChakraUI
import { Flex, Alert, AlertIcon, Heading, Input, Button, useToast, Spinner } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction, readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '@/constants';

import Post from "./Post";
import Publish from "./Publish";

import { useState, useEffect } from 'react';

export default function MainPageContent() {

    const toast = useToast();

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
    }, []);

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
    }, [lastPostID])

    if (isLoading) {
        return <>spinner</>
    }

    return(
    <>
        <Publish/>
        {displayedPosts}
    </>
    )
}