'use client'

// Chakra UI
import { Box, Text, Image, Button } from '@chakra-ui/react'

// NextJS
import Link from 'next/link'

// Contracts informations
import { abi, contractAddress } from '../constants';

// React
import { useState, useEffect } from 'react'

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction, readContract } from '@wagmi/core';
import { useAccount } from 'wagmi'

export default function Post({ publication }) {
    
    // Account
    const { address } = useAccount();

    // States
    const [vote, setVote] = useState(0);
    const [refreshArrows, setRefreshArrows] = useState(0); 
    const [posterName, setPosterName] = useState("");

    // Smart contract call to upvoteOrDownvote function
    async function getVote() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "upvoteOrDownvote",
                args: [address, publication.id],
            });
            setVote(data);
        } 
        catch (err) {
            console.log(err);
        }
    }

    // Smart contract call to getUser function
    async function getUsername() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getUser",
                args: [publication.poster],
            });
            setPosterName(data.name);
        } 
        catch (err) {
            console.log(err);
        }
    }

    // Smart contract call to upvote function
    async function upvote() {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'upvote',
                args: [publication.id],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            console.log("Upvoted successfully")
            setRefreshArrows((i) => i + 1); // Triggers a useEffect to color the vote arrows in real time
        }
        catch(err) {
            console.log(err.message)
        }  
    };

    // Smart contract call to downvote function
    async function downvote() {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'downvote',
                args: [publication.id],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            console.log("Downvoted successfully")
            setRefreshArrows((i) => i + 1); // Triggers a useEffect to color the vote arrows in real time
        }
        catch(err) {
            console.log(err.message)
        }  
    };

    // useEffect to get the current user's vote
    useEffect(() => {
        const call = async() => {await getVote()};
        call();
    }, [refreshArrows])

    // useEffect to get the poster's name
    useEffect(() => {
        const call = async() => {await getUsername()};
        call();
    }, [])

    if (!publication.exists) {
        return <>Error</>
    }

    return (
        <Box maxW="md" borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md" p={4} mb={4}>
            <Box display="flex" alignItems="center" mb={2}>
                <Link href={`/profile/${publication.poster}`} fontWeight="bold">
                    { posterName ? <Text fontSize="lg" color="blue.500">{posterName}</Text> : <></>}
                    <Text fontSize="sm" color="gray.500">{`${publication.poster.substring(0, 5)}...${publication.poster.substring(publication.poster.length - 5)}`}</Text>
                </Link>
            </Box>
            <Link href={`/post/${publication.id}`}>
                <Text mb={4}>{publication.content}</Text>
            </Link>
                <Box display="flex" alignItems="column">
                    <Button width={5} height={5} padding={0} border="none" background="none"><Image onClick={upvote} src={vote.toString() === "2" ? "/upvotes/upvoted.png" : "/upvotes/notupvoted.png"} alt="upvote" width={5} height={5}/></Button>
                    <Text>{publication.score.toString()}</Text>
                    <Button width={5} height={5} padding={0} border="none" background="none"><Image onClick={() => downvote()} src={vote.toString() === "1" ? "/upvotes/downvoted.png" : "/upvotes/notdownvoted.png"} alt="downvote" width={5} height={5}/></Button>
                    <Text color="gray.500" fontSize="sm">{publication.commentsIDs.length === 0 || publication.commentsIDs.length === 1? `${publication.commentsIDs.length} comment` : `${publication.commentsIDs.length} comments`}</Text>
                </Box>
          </Box>
    )
}