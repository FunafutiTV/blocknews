'use client'

// ChakraUI
import { Flex, Box, Textarea, Button, useToast, Text } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';

// Contracts informations
import { abi, contractAddress } from '../constants';

// React
import { useState } from 'react';

export default function Comment({ id, setNewComment }) {

    // State
    const [value, setValue] = useState("");

    // Chakra toast
    const toast = useToast();

    // Smart contract call to post function
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
            setNewComment(i => i + 1); // Will trigger a useEffect in PostPageContent to display the new comment in real time
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
        <Box w="full" p={4} pr={100} borderRadius="md">
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} resize="vertical" minHeight="100px" maxLength={300} placeholder="Post your reply" fontSize="md" border="1px solid #ccc" _focus={{outline: 'none', border: '1px solid #3182CE',}}/>
            <Flex justify="space-between" align="center" mt={2}>
                <Text color={value ? (value.length >= 250 ? (value.length >= 300 ? 'red.500' : 'orange.500') : 'gray.500') : 'gray.500'}>{value ? value.length : 0}/300</Text>
                <Button colorScheme="blue" onClick={(e) => {
                    e.preventDefault();
                    comment(value);
                    setValue('');}}>
                    Comment
                </Button>
            </Flex>
        </Box>
    )
}