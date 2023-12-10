'use client'

// Components
import ChangeName from './ChangeName';
import Post from './Post';
import DisplaySFTs from './DisplaySFTs';

// React
import { useState, useEffect } from 'react';

// Wagmi
import { readContract, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
import { useAccount } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '../constants';

// Chakra UI
import { Button, Spinner, Box, Flex, Grid, GridItem, Text, Link as ChakraLink } from '@chakra-ui/react';

// NextJS
import Link from 'next/link'

export default function ProfilePageContent({ handle }) {

    // Account
    const address = useAccount();

    // States
    const [user, setUser] = useState({})
    const [isLoading, setIsLoading] = useState(true);
    const [isUser, setIsUser] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [noSecondCall, setNoSecondCall] = useState(false);
    const [nameChange, setNameChange] = useState(0);

    // Smart contract call to follow function
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

    // Smart contract call to unfollow function
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

    // Smart contract call to doesFollow function
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

    // Smart contract call to getUser function
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

    // Smart contract call to getPublication function
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

    // useEffect to determine if the current user is the user displayed on the page
    useEffect(() => {
        if (address.address === handle) {
            setIsUser(true);
        } else {
            setIsUser(false);
        }
    }, [address])

    // First useEffect
    useEffect(() => {
        async function call() { await retrieveUser() };
        async function call2() { await doesFollow() };
        call();
        call2();
    }, [nameChange]);

    // Second useEffect
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