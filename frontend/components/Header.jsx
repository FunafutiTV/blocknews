'use client'

// RainbowKit
import { ConnectButton } from "@rainbow-me/rainbowkit";

// CSS
import './styles/styles.css'

// ChakraUI
import { Flex, Button, useToast, Text, Box } from "@chakra-ui/react";

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
            console.error(err.message);
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
                title: 'Successfully rewarded top users.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        }
        catch(err) {
            console.error(err.message)
            toast({
                title: 'An error occured while performing the action.',
                description: "Please try again later.",
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
            <Box id="header" position="fixed" w="100%">
                <Flex p="2vw" justifyContent="space-between" align="center" h="8em" borderBottom="1px solid #ddd">
                    <Link href={"/"}>
                        <Box id="logo"/>
                    </Link>
                    <Flex align="center">
                        {isConnected && (<Link href={`/profile/${address}`}><Text mr="1rem" textAlign="center" fontSize="lg" color="blue.600" fontWeight="bold" textDecoration="none" _hover={{ textDecoration: 'underline' }}>My Profile</Text></Link>)}
                        {isConnected && isOwner && (<Button onClick={rewardTopusers} variant="solid" colorScheme="teal" mr="1rem" fontSize="md" fontWeight="bold" _hover={{ bg: 'teal.600' }}>Reward Top Users</Button>)}
                        <ConnectButton />
                    </Flex>
                </Flex>
            </Box>
    )
};

