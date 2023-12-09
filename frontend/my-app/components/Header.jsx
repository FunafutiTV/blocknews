'use client'
// RainbowKit
import { ConnectButton } from "@rainbow-me/rainbowkit";

import Link from 'next/link';

// ChakraUI
import { Flex, Button, useToast } from "@chakra-ui/react";

// Nextjs
import Image from "next/image";

import { useState, useEffect, useContext } from 'react';

import { abi, contractAddress } from '@/constants';

import { readContract, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
import { useSignMessage, useAccount } from 'wagmi'

import { StateContext } from "../app/layout"

export default function Header() {
    const { address } = useAccount();
    const { data, error, isLoading, signMessage } = useSignMessage()
    const { isConnected, setIsConnected } = useContext(StateContext);
    const [hasMounted, setHasMounted] = useState(false);
    const [isOwner, setIsOwner] = useState(false);

    const toast = useToast();

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

    useEffect(() => {
        setTimeout(() => setHasMounted(true), 100);
    }, [])

    useEffect(() => {
        if (hasMounted && address) {
            setIsConnected(false);
            setTimeout(() => signMessage({message:"Sign in to the Block News app."}), 1000);
        }
        const call = async() => {await checkIsOwner()};
        call();
    }, [address]);

    useEffect(() => {
        if (data) {
            setIsConnected(true);
        }
    }, [data])

    useEffect(() => {
        if (error) {
            console.log(error);
            setIsConnected(false);
        }
    }, [error])

    return (
        <Flex p="2rem" justifyContent="space-between" alignContent="center">
            <Link href={"/"}>
                <Image src="/logoBlockNews.jpg" alt="Logo" width={228} height={60}/>
            </Link>
            {isConnected ? <Link href={`/profile/${address}`}>My profile</Link> : <></>}
            {isConnected ? isOwner ? <Button onClick={rewardTopusers}>Reward top users</Button> : <></> : <></>}
            <ConnectButton />
        </Flex>
    )
};

