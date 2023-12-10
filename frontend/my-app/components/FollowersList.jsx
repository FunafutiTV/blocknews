'use client'

// Wagmi
import { readContract } from '@wagmi/core';

// React
import { useState, useEffect } from 'react';

// Contracts informations
import { abi, contractAddress } from '../constants';

// NextJS
import Link from 'next/link';
import Image from 'next/image';

// Chakra UI
import { Link as ChakraLink, Box, Spinner } from "@chakra-ui/react";

// Component
import Profile from "./Profile";

export default function FollowersList({ handle }) {
    
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
            console.log(err);
        }
    }

    // Smart contract call to getUser function (to retrieve the main user's followers)
    async function retrieveFollower(address) {
        if (address !== "0x0000000000000000000000000000000000000000") { // Exclude address 0 (not a real user)
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

    // First useEffect
    useEffect(() => {
        async function call() { await retrieveUser() };
        call();
    }, [])

    // Second useEffect
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
    
    return(
        <Box>
            {isLoading ? <Spinner/> : <>
                <ChakraLink mb={4} mt={4} ml={4} display="block"><Link href={`/profile/${handle}`}><Image src="/arrow.png" alt="return" width={30} height={33}/></Link></ChakraLink>
                <Box mb={4} ml={4} mr={4}>
                    <Box fontWeight="bold" mb={6}>{(user.followersList.number.toString() == 0 || user.followersList.number.toString() == 1) ? <>{user.followersList.number.toString()} follower</> : <>{user.followersList.number.toString()} followers</>}</Box>
                    <Box>{displayedUsers}</Box>
                </Box>
            </>}
        </Box>
    )
}