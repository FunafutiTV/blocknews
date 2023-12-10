'use client'

// ChakraUI
import { Input, Button, useToast, Box } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction, readContract } from '@wagmi/core';

// Contracts informations
import { abi, contractAddress } from '../constants';

// React
import { useState } from 'react';

export default function ChangeName({ setNameChange }) {
    
    // State
    const [value, setValue] = useState("");

    // Chakra toast
    const toast = useToast();

    // Smart contract call to changeName function
    async function changeName(name) {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'changeName',
                args: [name],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setNameChange(i => i + 1); // Will trigger a useEffect in ProfilePageContent to update the name in real time
            toast({
                title: 'Congratulations',
                description: "Succesfully changed name.",
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
            changeName(value)
            setValue("")}}>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} maxLength={24} mr={2} placeholder="Enter new name"/>
                <Button type="submit" variant="solid" colorScheme="blue">Change name</Button>
            </Box>
        </form>
    )
}