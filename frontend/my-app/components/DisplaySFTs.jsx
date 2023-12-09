'use client'

import { useState, useEffect } from 'react';

import { readContract } from '@wagmi/core';

import { abi, contractAddress } from '../constants';

import { Box, Image } from '@chakra-ui/react'; 

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
                            <Box key={i}>
                                {data.name}
                                <Image src={data.image}/>
                            </Box>
                        ]);
                    })
                    .catch(err => console.error(err));
            })
        }
    }, [uri])

    if (isLoading) return <>Spinner</>

    return(
        <>{displayedSFTs}</>
    )
}