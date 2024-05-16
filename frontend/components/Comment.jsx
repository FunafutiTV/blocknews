'use client'

// ChakraUI
import { Flex, Box, Textarea, Button, useToast, Text, Input } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';

// Contracts informations
import { abi, contractAddress } from '../constants';

// React
import { useState } from 'react';

export default function Comment({ id, setNewComment }) {

    // State
    const [value, setValue] = useState("");
    const [link, setLink] = useState("");

    // Chakra toast
    const toast = useToast();

    // Smart contract call to post function
    async function comment(content, _link) {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'post',
                args: [content, _link, 0, id],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setNewComment(i => i + 1); // Will trigger a useEffect in PostPageContent to display the new comment in real time
            toast({
                title: "Succesfully published comment.",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        }
        catch(err) {
            console.error(err.message);
            toast({
                title: 'An error occured while performing the action.',
                description: "Please try again later.",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }  
    };

    return(
        <Box w="full" p={4} borderRadius="md">
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} resize="vertical" minHeight="100px" maxLength={300} placeholder="Post your reply" fontSize="md" border="1px solid #ccc" _focus={{outline: 'none', border: '1px solid #3182CE',}}/>
            <Flex justify="space-between" align="center" mt={2}>
                <Text color={value ? (value.length >= 250 ? (value.length >= 300 ? 'red.500' : 'orange.500') : 'gray.500') : 'gray.500'}>{value ? value.length : 0}/300</Text>
                <Input type="url" mr={2} ml={2} value={link} onChange={(e) => setLink(e.target.value)} resize="vertical" maxLength={300} placeholder="Optional link" fontSize="md" border="1px solid #ccc" _focus={{outline: 'none', border: '1px solid #3182CE',}}/>
                <Button colorScheme="blue" visibility={(value && !link) || (value && link.toLowerCase().startsWith("https://") && link.length > 10) ? "visible" : "hidden"} opacity={(value && !link) || (value && link.toLowerCase().startsWith("https://") && link.length > 10) ? 1 : 0} onClick={(e) => {
                    e.preventDefault();
                    comment(value, link);
                    setValue('');
                    setLink('');}}>
                    Comment
                </Button>
            </Flex>
        </Box>
    )
}