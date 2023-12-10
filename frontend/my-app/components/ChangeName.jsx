'use client'
// ChakraUI
import { Input, Button, useToast, Box } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction, readContract } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '../constants';

import { useState, useEffect } from 'react';

export default function ChangeName({ setNameChange }) {
    const [value, setValue] = useState("");

    const toast = useToast();

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
            setNameChange(i => i + 1);
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
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={24}
          mr={2}
          placeholder="Enter new name"
        />
        <Button type="submit" variant="solid" colorScheme="blue">
          Change name
        </Button>
      </Box>
        </form>
    )
}