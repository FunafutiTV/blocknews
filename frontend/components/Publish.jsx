'use client'

// ChakraUI
import { Flex, Box, Text, Button, useToast, Textarea, Input, Select } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction, readContract } from '@wagmi/core';

// Contracts informations
import { abi, contractAddress } from '../constants';

// React
import { useState } from 'react';

export default function Publish({ setNewPost }) {
    
    // State
    const [value, setValue] = useState("");
    const [link, setLink] = useState("");
    const [category, setCategory] = useState(0);

    // Chakra toast
    const toast = useToast();

    // Smart contract call to post function
    async function post(content, _link) {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'post',
                args: [content, _link, category, 0],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setNewPost(i => i + 1); // Will trigger a useEffect in feed components to display the new post in real time
            toast({
                title: "Succesfully published post.",
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
        <Box w="full" borderRadius="md" mb={5}>
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} resize="vertical" minHeight="100px" maxLength={300} placeholder="Tell us something new" fontSize="md" border="1px solid #ccc" mb={2} _focus={{outline: 'none', border: '1px solid #3182CE',}}/>
            <Input type="url" value={link} onChange={(e) => setLink(e.target.value)} resize="vertical" maxLength={300} placeholder="Link your source here" fontSize="md" border="1px solid #ccc" _focus={{outline: 'none', border: '1px solid #3182CE',}}/>
            <Flex justify="space-between" align="center" mt={2}>
                <Text color={value ? (value.length >= 250 ? (value.length >= 300 ? 'red.500' : 'orange.500') : 'gray.500') : 'gray.500'}>{value ? value.length : 0}/300</Text>
                <Select maxW="10em" onChange={(e) => setCategory(Number(e.target.value))}>
                    <option value="0">No category</option>
                    <option value="1">Technology</option>
                    <option value="2">Politics</option>
                    <option value="3">Sports</option>
                    <option value="4">Miscellaneous</option>
                </Select>
                <Button colorScheme="blue" visibility={value && link.toLowerCase().startsWith("https://") && link.length > 10 ? "visible" : "hidden"} opacity={value && link.toLowerCase().startsWith("https://") && link.length > 10 ? 1 : 0} onClick={(e) => {
                    e.preventDefault();
                    post(value, link);
                    setValue('');
                    setLink('');}}>
                    Publish
                </Button>
            </Flex>
        </Box>
    )
}