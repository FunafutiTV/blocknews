'use client'

// Wagmi
import { readContract } from '@wagmi/core';

// CSS
import "./styles/styles.css"

// React
import { useState, useEffect } from 'react';

// Contracts informations
import { abi, contractAddress } from '../constants';

// NextJS
import Link from 'next/link';
import Image from 'next/image';

// Chakra UI
import { Box, Spinner, Text } from "@chakra-ui/react";

// Component
import Profile from "./Profile";

export default function FollowingsList({ handle }) {
    
    // States
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState({});
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [noSecondCall, setNoSecondCall] = useState(false);

    // Smart contract call to getUser function (to retrieve the main user)
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
            console.error(err.message);
        }
    }

    // Smart contract call to getUser function (to retrieve the main user's followings)
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
                console.error(err.message);
            }
        }
    }

    // First useEffect
    useEffect(() => {
        async function call() { await retrieveUser() };
        call();
    }, [])

    // Second useEffect
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
    
    return(
        <Box className='page' ml={5}>
            {isLoading ? <>
                <Link href={`/profile/${handle}`}><Image src="/arrow.png" alt="return" width={30} height={33}/></Link>
                <Box mx="auto" maxW="xl" w="full" textAlign="center">
                    <Spinner/>
                </Box>
            </> : <>
                <Link href={`/profile/${handle}`}><Image src="/arrow.png" alt="return" width={30} height={33}/></Link>
                <Box>
                    <Box fontWeight="bold" mb={4}>{(user.followingsList.number.toString() == 0 || user.followingsList.number.toString() == 1) ? <Text textAlign="center">{user.followingsList.number.toString()} following</Text> : <Text textAlign="center">{user.followingsList.number.toString()} followings</Text>}</Box>
                    <Box>{displayedUsers}</Box>
                </Box>
            </>}
        </Box>
    )
}