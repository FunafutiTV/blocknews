'use client'

import ChangeName from './ChangeName';
import Post from './Post';
import DisplaySFTs from './DisplaySFTs';

import { useState, useEffect } from 'react';

import { readContract, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

import { abi, contractAddress } from '@/constants';
import { Button } from '@chakra-ui/react';

import Link from 'next/link'

export default function ProfilePageContent({ handle }) {

    const address = useAccount();

    const [user, setUser] = useState({})

    const [isLoading, setIsLoading] = useState(true);

    const [isUser, setIsUser] = useState(false);

    const [isFollowing, setIsFollowing] = useState(false);

    const [displayedPosts, setDisplayedPosts] = useState([]);

    const [noSecondCall, setNoSecondCall] = useState(false);

    const [nameChange, setNameChange] = useState(0);

    async function follow() {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'follow',
                args: [handle],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setIsFollowing(true);
        }
        catch(err) {
            console.log(err.message)
        }  
    };

    async function unfollow() {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'unfollow',
                args: [handle],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setIsFollowing(false);
        }
        catch(err) {
            console.log(err.message)
        }  
    };


    async function doesFollow() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "doesFollow",
                args: [address.address, handle],
            });
            setIsFollowing(data);
        } 
        catch (err) {
            console.log(err);
        }
    }

    async function retrieveUser() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getUser",
                args: [handle],
            });
            setUser(data);
            setIsLoading(false);
        } 
        catch (err) {
            console.log(err);
            setIsLoading(false);
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
                setDisplayedPosts((posts) => [...posts, <Post publication={data} key={id}/>]);
            }
        } 
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (address.address === handle) {
            setIsUser(true);
        } else {
            setIsUser(false);
        }
    }, [address])

    useEffect(() => {
        async function call() { await retrieveUser() };
        async function call2() { await doesFollow() };
        call();
        call2();
    }, [nameChange]);

    useEffect(() => {
        if (user.postsIDs && !noSecondCall) {
            setNoSecondCall(true);
            setInterval(() => {setNoSecondCall(false)}, 100)
            const fetchPost = async(id) => {await retrievePost(id)};
            setDisplayedPosts([]);
            for(let i = user.postsIDs.length - 1; i >= 0; i--) {
                fetchPost(user.postsIDs[i]);
            };
        }
    }, [user])

    if (isLoading) return <>Spinner</>

    return(
        <>
            <>{user.name}</>
            <>{handle}</>
            {user.SFTIDs.length > 0 ? <DisplaySFTs user={user}/> : <></>}
            <>Score : {user.score.toString()}</>
            <Link href={`/profile/${handle}/followers`}>{user.followersList.number.toString()} followers</Link>
            <Link href={`/profile/${handle}/followings`}>{user.followingsList.number.toString()} followings</Link>
            {isUser ? <ChangeName setNameChange={setNameChange}/> : <></>}
            {isUser ? <></> : <>{isFollowing ? <Button onClick={unfollow}>Unfollow</Button> : <Button onClick={follow}>Follow</Button>}</>}
            <>{displayedPosts}</>
        </>
    )
}