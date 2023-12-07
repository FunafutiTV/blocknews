'use client'
// RainbowKit
import { ConnectButton } from "@rainbow-me/rainbowkit";

import Link from 'next/link';

// ChakraUI
import { Flex } from "@chakra-ui/react";

// Nextjs
import Image from "next/image";

import { useState, useEffect, useContext } from 'react';

import { useSignMessage, useAccount } from 'wagmi'

import { StateContext } from "../app/layout"

export default function Header() {
    const { address } = useAccount();
    const { data, error, isLoading, signMessage } = useSignMessage()
    const { isConnected, setIsConnected } = useContext(StateContext);
    const [hasMounted, setHasMounted] = useState(false);


    useEffect(() => {
        setTimeout(() => setHasMounted(true), 100);
    }, [])

    useEffect(() => {
        if (hasMounted && address) {
            setIsConnected(false);
            setTimeout(() => signMessage({message:"Sign in to the Block News app."}), 1000);
        }
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
            <ConnectButton />
        </Flex>
    )
};

