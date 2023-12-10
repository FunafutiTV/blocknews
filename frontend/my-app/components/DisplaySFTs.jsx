'use client'

import { useState, useEffect } from 'react';

import { readContract } from '@wagmi/core';

import { abi, contractAddress } from '../constants';

import { Box, Image, Flex, Spinner } from '@chakra-ui/react'; 

export default function DisplaySFTs({ user }) {

    const [uri, setURI] = useState("");

    const [displayedSFTs, setDisplayedSFTs] = useState([])

    const [isLoading, setIsLoading] = useState(true);

    async function getURI() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getSFTURI",
            });
            setURI(data);
            setIsLoading(false);
        } 
        catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const call = async() => {await getURI()};
        call();
    }, [])

    useEffect(() => {
        if (uri) {
            user.SFTIDs.forEach((sft, i) => {
                const currentURI = uri.replace("{id}", sft);
                fetch(currentURI)
                    .then(res => res.json()).then(data => {
                        setDisplayedSFTs((sfts) => [...sfts, 
                            <Box key={i} textAlign="center" maxW="200px">
                                <Box position="relative" mb={2}>
                                    <Image src={data.image} height="auto" width="100%" maxH="120px" objectFit="contain" mb={2}/>
                                    <Box position="absolute" bottom="-34px" left="0" right="0" bg="white" fontSize="8px" fontWeight="bold" py={1}>{data.name}</Box>
                                </Box>
                            </Box>
                        ]);
                    })
                    .catch(err => console.error(err));
            })
        }
    }, [uri])

    return(
        <Flex flexWrap="wrap" justify="center" gap={4}>
            {isLoading ? <Spinner/> : <>{displayedSFTs}</>}
        </Flex>
    )
}