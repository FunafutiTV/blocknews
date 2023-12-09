'use client'

import { readContract } from '@wagmi/core';

import { useState, useEffect } from 'react';

import { abi, contractAddress } from '../constants';

import Link from 'next/link';

import Profile from "./Profile";

export default function FollowingsList({ handle }) {
    
    const [isLoading, setIsLoading] = useState(true);

    const [user, setUser] = useState({});

    const [displayedUsers, setDisplayedUsers] = useState([]);

    const [noSecondCall, setNoSecondCall] = useState(false);

    async function retrieveUser() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getUser",
                args: [handle],
            });
            setUser(data);
        } 
        catch (err) {
            console.log(err);
        }
    }

    async function retrieveFollowing(address) {
        if (address !== "0x0000000000000000000000000000000000000000") {
            try {
                const data = await readContract({
                    address: contractAddress,
                    abi: abi,
                    functionName: "getUser",
                    args: [address],
                });
                setDisplayedUsers((users) => [...users, <Profile profile={data} handle={address} key={address}/>]);
            } 
            catch (err) {
                console.log(err);
            }
        }
    }

    useEffect(() => {
        async function call() { await retrieveUser() };
        call();
    }, [])

    useEffect(() => {
        const fetchFollowing = async(address) => {retrieveFollowing(address)}
        if (user.followingsList && !noSecondCall) {
            setNoSecondCall(true);
            setInterval(() => {setNoSecondCall(false)}, 100);
            user.followingsList.followList.map((address) => {
                fetchFollowing(address);
            });
            setIsLoading(false);
        }
    }, [user])

    if (isLoading) return <>Spinner</>
    
    return(
        <>
            <Link href={`/profile/${handle}`}>Return</Link>
            <>{user.followingsList.number.toString()} followings</>
            <>{displayedUsers}</>
        </>
    )
}