'use client'

import ChangeName from './ChangeName';
import Post from './Post';
import DisplaySFTs from './DisplaySFTs';

import { useState, useEffect } from 'react';

import { readContract, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
import { useAccount, usePublicClient } from 'wagmi';

import { abi, contractAddress } from '../constants';
import { Button, Spinner, Box, Flex, Grid, GridItem, Text, Link as ChakraLink } from '@chakra-ui/react';

import Link from 'next/link'

export default function ProfilePageContent({ handle }) {

    const address = useAccount();

    const [user, setUser] = useState({})

    const [isLoading, setIsLoading] = useState(true);

    const [isUser, setIsUser] = useState(false);

    const [isFollowing, setIsFollowing] = useState(false);

    const [displayedPosts, setDisplayedPosts] = useState([]);

    const [noSecondCall, setNoSecondCall] = useState(false);

    const [nameChange, setNameChange] = useState(0);

    async function follow() {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'follow',
                args: [handle],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setIsFollowing(true);
        }
        catch(err) {
            console.log(err.message)
        }  
    };

    async function unfollow() {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'unfollow',
                args: [handle],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setIsFollowing(false);
        }
        catch(err) {
            console.log(err.message)
        }  
    };


    async function doesFollow() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "doesFollow",
                args: [address.address, handle],
            });
            setIsFollowing(data);
        } 
        catch (err) {
            console.log(err);
        }
    }

    async function retrieveUser() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getUser",
                args: [handle],
            });
            setUser(data);
            setIsLoading(false);
        } 
        catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    }

    async function retrievePost(id) {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getPublication",
                args: [id],
            });
            if (!data.isCommentOfID) {
                setDisplayedPosts((posts) => [...posts, <Post publication={data} key={id}/>]);
            }
        } 
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (address.address === handle) {
            setIsUser(true);
        } else {
            setIsUser(false);
        }
    }, [address])

    useEffect(() => {
        async function call() { await retrieveUser() };
        async function call2() { await doesFollow() };
        call();
        call2();
    }, [nameChange]);

    useEffect(() => {
        if (user.postsIDs && !noSecondCall) {
            setNoSecondCall(true);
            setInterval(() => {setNoSecondCall(false)}, 100)
            const fetchPost = async(id) => {await retrievePost(id)};
            setDisplayedPosts([]);
            for(let i = user.postsIDs.length - 1; i >= 0; i--) {
                fetchPost(user.postsIDs[i]);
            };
        }
    }, [user])

    return(
        <Grid templateColumns="repeat(2, 1fr)" columnGap={4} p={4}>
            {isLoading ? <Spinner/> : <>
                <GridItem colSpan={1}>
                    <Box>
                        <Text fontWeight="bold" fontSize="xl" mb={2}>{user.name}</Text>
                        <Text color="gray.600" mb={2}>{handle}</Text>
                        <Text mb={4}>Score: {user.score.toString()}</Text>
                        <ChakraLink color="red.700" mr={30}><Link href={`/profile/${handle}/followers`} mt={2} display="block">{(user.followersList.number.toString() == "0" || user.followersList.number.toString() == "1") ? <>{user.followersList.number.toString()} Follower</> : <>{user.followersList.number.toString()} Followers</>}</Link></ChakraLink>
                        <ChakraLink color="red.700" mr={30}><Link href={`/profile/${handle}/followings`} mt={2} display="block">{(user.followingsList.number.toString() == "0" || user.followingsList.number.toString() == "1") ? <>{user.followingsList.number.toString()} Following</> : <>{user.followingsList.number.toString()} Followings</>}</Link></ChakraLink>
                        {isUser ? <Box mt={4}><ChangeName setNameChange={setNameChange} /></Box> : null}
                        {!isUser && (isFollowing ? <Button onClick={unfollow}>Unfollow</Button> : <Button onClick={follow}>Follow</Button>)}
                        <Box maxW="xl" w="full" mx="auto" mt={10}>
                            {displayedPosts}
                        </Box>
                    </Box>
                </GridItem>

                <GridItem colSpan={1}>
                    <Flex justifyContent="center" alignItems="top" h="100%">
                    {user.SFTIDs.length > 0 && <DisplaySFTs user={user} />}
                    </Flex>
                </GridItem>
            </>}
        </Grid>
    )
}