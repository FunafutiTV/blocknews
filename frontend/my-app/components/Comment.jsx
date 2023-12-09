'use client'
// ChakraUI
import { Flex, Alert, AlertIcon, Heading, Input, Button, useToast, Spinner } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction, readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '../constants';

import { useState, useEffect } from 'react';

export default function Comment({ id, setNewComment }) {
    const [value, setValue] = useState("");

    const toast = useToast();

    async function comment(content) {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'post',
                args: [content, id],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setNewComment(i => i + 1);
            toast({
                title: 'Congratulations',
                description: "Succesfully published comment.",
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
            comment(value);
            setValue("")}}>
            <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} maxLength={300}/>
            <button type="submit">Publish</button>
        </form>
    )
}