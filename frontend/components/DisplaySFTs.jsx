'use client'

// React
import { useState, useEffect } from 'react';

// Wagmi
import { readContract } from '@wagmi/core';

// Contract informations
import { abi, contractAddress } from '../constants';

// Chakra UI
import { Box, Image, Flex, Spinner } from '@chakra-ui/react'; 

export default function DisplaySFTs({ user }) {

    // States
    const [uri, setURI] = useState("");
    const [displayedSFTs, setDisplayedSFTs] = useState([])
    const [isLoading, setIsLoading] = useState(true);

    // Smart contract call to getSFTURI function
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
            console.error(err.message);
            setIsLoading(false);
        }
    }

    // First useEffect
    useEffect(() => {
        const call = async() => {await getURI()};
        call();
    }, [])

    // Second useEffect
    useEffect(() => {
        if (uri) {
            user.SFTIDs.forEach((sft, i) => {
                const currentURI = uri.replace("{id}", sft);
                fetch(currentURI)
                    .then(res => res.json()).then(data => {
                        setDisplayedSFTs((sfts) => [...sfts, 
                            <Box key={i} border="1px dotted grey" textAlign="center" width="5em" height="10em">
                                <Box position="relative" height="100%">
                                    <Image src={data.image} height="auto" width="100%" objectFit="contain"/>
                                    <Box className="sftname" fontWeight="bold" py={1}>{data.name}</Box>
                                </Box>
                            </Box>
                        ]);
                    })
                    .catch(err => console.error(err));
            })
        }
    }, [uri])

    return(
        <Flex flexWrap="wrap" justify="center" gap={5}>
            {isLoading ? <Spinner/> : <>{displayedSFTs}</>}
        </Flex>
    )
}