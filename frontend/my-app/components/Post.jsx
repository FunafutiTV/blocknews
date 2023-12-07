'use client'
import { Box, Text, Image, Button } from '@chakra-ui/react'
import Link from 'next/link'

import { abi, contractAddress } from '@/constants';

import { useState, useEffect } from 'react'

import { prepareWriteContract, writeContract, waitForTransaction, readContract } from '@wagmi/core';

import { useSignMessage, useAccount } from 'wagmi'

export default function Post({ publication }) {
    
    const { address } = useAccount();

    const [vote, setVote] = useState(0);

    const [refreshArrows, setRefreshArrows] = useState(0); 
    // const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC' };
    // const dateObj = new Date(publication.createdAt);

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
            setRefreshArrows((i) => i + 1);
        }
        catch(err) {
            console.log(err.message)
        }  
    };

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
            setRefreshArrows((i) => i + 1);
        }
        catch(err) {
            console.log(err.message)
        }  
    };

    useEffect(() => {
        const call = async() => {await getVote()};
        call();
    }, [refreshArrows])

    if (!publication.exists) {
        return <>Error</>
    }

    return (
        <Box maxW="md" borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md" p={4} mb={4}>
            <Box display="flex" alignItems="center" mb={2}>
                {/* <Image src={publication.by.metadata?.picture?.raw.uri || '/default.png'} boxSize="40px" borderRadius="full" mr={2}/> */}
                <Link href={`/profile/${publication.poster}`} fontWeight="bold">{publication.poster}</Link>
            </Box>
            <Link href={`/post/${publication.id}`}>
                <Text mb={4}>{publication.content}</Text>
                {/* {publication.metadata?.__typename === 'ImageMetadataV3' ? (
                    <Image src={publication.metadata?.asset?.image?.raw.uri || ''} borderRadius="md" mb={4} alt={publication.metadata?.title} />
                ) : ""} */}
            </Link>
                <Box display="flex" alignItems="column">
                    <Button width={5} height={5} padding={0} border="none" background="none"><Image onClick={upvote} src={vote.toString() === "2" ? "/upvotes/upvoted.png" : "/upvotes/notupvoted.png"} alt="upvote" width={5} height={5}/></Button>
                    <Text>{publication.score.toString()}</Text>
                    <Button width={5} height={5} padding={0} border="none" background="none"><Image onClick={() => downvote()} src={vote.toString() === "1" ? "/upvotes/downvoted.png" : "/upvotes/notdownvoted.png"} alt="downvote" width={5} height={5}/></Button>
                    <Text color="gray.500" fontSize="sm">{publication.commentsIDs.length} comments</Text>
                </Box>
          </Box>
    )
}