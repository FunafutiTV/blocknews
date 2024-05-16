'use client'

// Wagmi
import { readContract } from '@wagmi/core';

// React
import { useState, useEffect } from 'react';

// Contracts informations
import { abi, contractAddress } from '../constants';

// Chakra UI
import { Box, Spinner, Text } from "@chakra-ui/react";

// Component
import Profile from "./Profile";

export default function TopUsersList() {
    
    // States
    const [isLoading, setIsLoading] = useState(true);
    const [topUsers, setTopUsers] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    const [noSecondCall, setNoSecondCall] = useState(false);

    // Smart contract call to getTopUsers function
    async function retrieveTopUsers() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getTopUsers",
            });
            const newState = {array: data};
            setTopUsers(newState);
        } 
        catch (err) {
            console.error(err.message);
        }
    }

    // Smart contract call to getUser function (to retrieve the main user's followings)
    async function retrieveUser(address) {
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
        async function call() { await retrieveTopUsers() };
        call();
    }, [])

    // Second useEffect
    useEffect(() => {
        const fetchUser = async(address) => {retrieveUser(address)}
        if (topUsers.array && !noSecondCall) {
            setNoSecondCall(true);
            setInterval(() => {setNoSecondCall(false)}, 100);
            topUsers.array.map((address) => {
                fetchUser(address);
            });
            setIsLoading(false);
        }
    }, [topUsers])
    
    return(
        <Box>
            {isLoading ? <Spinner/> : <>
                <Box>
                    {displayedUsers.length == 0 ? <></> :
                        <>
                            <Text fontWeight="bold" fontSize="110%" textAlign="center" mb={5}>Current top users</Text>
                            <Box>{displayedUsers}</Box>
                        </>
                    }
                </Box>
            </>}
        </Box>
    )
}