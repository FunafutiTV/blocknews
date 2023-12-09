'use client'
// ChakraUI
import { Flex, Alert, AlertIcon, Heading, Input, Button, useToast, Spinner } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction, readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '../constants';

import { useState, useEffect } from 'react';

export default function Publish({ setNewPost }) {
    const [value, setValue] = useState("");

    const toast = useToast();

    async function post(content) {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'post',
                args: [content, 0],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setNewPost(i => i + 1);
            toast({
                title: 'Congratulations',
                description: "Succesfully published post.",
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

    return(
        <form onSubmit={(e) => {
            e.preventDefault(); 
            post(value);
            setValue("")}}>
            <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} maxLength={300}/>
            <button type="submit">Publish</button>
        </form>
    )
}