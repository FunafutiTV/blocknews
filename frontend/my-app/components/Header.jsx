'use client'

// RainbowKit
import { ConnectButton } from "@rainbow-me/rainbowkit";

// ChakraUI
import { Flex, Button, useToast, Text } from "@chakra-ui/react";

// Nextjs
import Image from "next/image";
import Link from 'next/link';

// React & context
import { useState, useEffect, useContext } from 'react';
import { StateContext } from "../app/layout"

// Contracts informations
import { abi, contractAddress } from '../constants';

// Wagmi
import { readContract, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
import { useSignMessage, useAccount } from 'wagmi'

export default function Header() {

    // Account & Sign message from Wagmi
    const { address } = useAccount();
    const { data, error, isLoading, signMessage } = useSignMessage()

    // Retrieve context
    const { isConnected, setIsConnected } = useContext(StateContext);

    // States
    const [hasMounted, setHasMounted] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    // Chakra toast
    const toast = useToast();

    // Smart contract call to owner function (from Ownable)
    async function checkIsOwner() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "owner",
            });
            setIsOwner(data === address);
        } 
        catch (err) {
            console.log(err);
        }
    }

    // Smart contract call to rewardTopUsers function
    async function rewardTopusers() {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'rewardTopUsers',
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            toast({
                title: 'Congratulations',
                description: "Succesfully rewarded top users.",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        }
        catch(err) {
            console.log(err.message)
            toast({
                title: 'Error',
                description: "An error occured.",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }  
    };

    // First useEffect
    useEffect(() => {
        setTimeout(() => setHasMounted(true), 100);
    }, [])

    // Second useEffect
    useEffect(() => {
        if (hasMounted && address) {
            setIsConnected(false);
            setTimeout(() => signMessage({message:"Sign in to the Block News app."}), 1000);
        }
        const call = async() => {await checkIsOwner()};
        call();
    }, [address]);

    // Third useEffect
    useEffect(() => {
        if (data) {
            setIsConnected(true);
        }
    }, [data])

    // useEffect in case of error with signing
    useEffect(() => {
        if (error) {
            console.log(error);
            setIsConnected(false);
        }
    }, [error])

    return (
        <Flex p="2rem" justifyContent="space-between" align="center" borderBottom="1px solid #ddd">
            <Link href={"/"}>
                <Image src="/logoBlockNews.jpg" alt="Logo" width={228} height={60} />
            </Link>
            <Flex align="center">
                {isConnected && (<Link href={`/profile/${address}`}><Text mr="1rem" fontSize="lg" color="blue.600" fontWeight="bold" textDecoration="none" _hover={{ textDecoration: 'underline' }}>My Profile</Text></Link>)}
                {isConnected && isOwner && (<Button onClick={rewardTopusers} variant="solid" colorScheme="teal" mr="1rem" fontSize="md" fontWeight="bold" _hover={{ bg: 'teal.600' }}>Reward Top Users</Button>)}
                <ConnectButton />
            </Flex>
        </Flex>
    )
};

