'use client'

import { readContract } from '@wagmi/core';

import { useState, useEffect } from 'react';

import { abi, contractAddress } from '../constants';

import Link from 'next/link';

import Profile from "./Profile";

export default function FollowersList({ handle }) {
    
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

    async function retrieveFollower(address) {
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
        const fetchFollower = async(address) => {retrieveFollower(address)}
        if (user.followersList && !noSecondCall) {
            setNoSecondCall(true);
            setInterval(() => {setNoSecondCall(false)}, 100);
            user.followersList.followList.map((address) => {
                fetchFollower(address);
            });
            setIsLoading(false);
        }
    }, [user])

    if (isLoading) return <>Spinner</>
    
    return(
        <>
            <Link href={`/profile/${handle}`}>Return</Link>
            <>{user.followersList.number.toString()} followers</>
            <>{displayedUsers}</>
        </>
    )
}