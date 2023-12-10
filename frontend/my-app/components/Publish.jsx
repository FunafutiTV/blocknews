'use client'
// ChakraUI
import { Flex, Box, Text, Button, useToast, Textarea } from '@chakra-ui/react';

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
        <Box w="full" p={4} pr={100} borderRadius="md">
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} resize="vertical" minHeight="100px" maxLength={300} placeholder="Tell us something new" fontSize="md" border="1px solid #ccc" _focus={{outline: 'none', border: '1px solid #3182CE',}}/>
            <Flex justify="space-between" align="center" mt={2}>
                <Text color={value ? (value.length >= 250 ? (value.length >= 300 ? 'red.500' : 'orange.500') : 'gray.500') : 'gray.500'}>{value ? value.length : 0}/300</Text>
                <Button colorScheme="blue" onClick={(e) => {
                    e.preventDefault();
                    post(value);
                    setValue('');}}>
                    Publish
                </Button>
            </Flex>
        </Box>
    )
}