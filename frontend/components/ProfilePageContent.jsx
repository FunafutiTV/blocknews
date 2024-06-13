'use client'

// Components
import EditProfile from './EditProfile';
import Post from './Post';
import DisplaySFTs from './DisplaySFTs';

// CSS
import "./styles/styles.css"

// React
import { useState, useEffect } from 'react';

// Wagmi
import { readContract, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
import { useAccount } from 'wagmi';

// Contracts informations
import { abi, contractAddress } from '../constants';

// Chakra UI
import { Button, Spinner, Box, Flex, Grid, GridItem, useToast, Text, Image } from '@chakra-ui/react';

// NextJS
import Link from 'next/link'

export default function ProfilePageContent({ handle }) {

    // Account
    const address = useAccount();

    // Chakra toast
    const toast = useToast();

    // States
    const [user, setUser] = useState({})
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [isUser, setIsUser] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowedBy, setIsFollowedBy] = useState(false);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [noSecondCall, setNoSecondCall] = useState(false);
    const [profileChange, setProfileChange] = useState(0);

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
            console.error(err.message);
            if (err.message.includes("You can not follow more than 40 users")) {
                toast({
                    title: 'You have reached your limit of followed users.',
                    description: "You can not follow more than 40 accounts.",
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                })
            } else {
                toast({
                    title: 'An error occured while performing the action.',
                    description: "Please try again later.",
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                })
            }
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

    // First smart contract call to doesFollow function (to check if the user if following this profile)
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
            console.error(err.message);
        }
    }

    // Second smart contract call to doesFollow function (to check if the user if followed by this profile)
    async function isFollowed() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "doesFollow",
                args: [handle, address.address],
            });
            setIsFollowedBy(data);
        } 
        catch (err) {
            console.error(err.message);
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
            console.error(err.message);
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
            } else {
                setIsLoadingPosts(false);
            }
        } 
        catch (err) {
            console.error(err.message);
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
        async function call3() {await isFollowed() };
        call();
        call2();
        call3();
    }, [profileChange]);

    // Second useEffect
    useEffect(() => {
        if (user.lastPostsIDs && !noSecondCall) {
            if (user.lastPostsIDs[0].toString() == "0") {
                setIsLoadingPosts(false);
            }
            for(let i = user.lastPostsIDs.length - 1; i >= 0; i--) {
                user.lastPostsIDs[i] = user.lastPostsIDs[i].toString();
            };
            user.lastPostsIDs.sort(function(a, b) { // Sort array from most recent to oldest
                return a - b;
            })
            setNoSecondCall(true);
            setInterval(() => {setNoSecondCall(false)}, 100)
            const fetchPost = async(id) => {await retrievePost(id)};
            setDisplayedPosts([]);
            for(let i = user.lastPostsIDs.length - 1; i >= 0; i--) {
                if (user.lastPostsIDs[i].toString() !== "0") {
                    fetchPost(user.lastPostsIDs[i]);
                }
            };
        }
    }, [user]);

    // Stop loading
    useEffect(() => {
        if (displayedPosts.length > 0) {
            setIsLoadingPosts(false);
        }
    }, [displayedPosts]);

    return(
        <Box className='page'>
            {isLoading ? <Box mx="auto" maxW="xl" w="full" textAlign="center"><Spinner/></Box> : <>
                <Grid id="profile" templateColumns="2fr 1fr" columnGap={4} pl={6} pr={4}>   

                    {/* Left Section: Profile informations */}
                    <GridItem colSpan={1}>
                        <Box>
                            <Flex alignItems="center" mb={4}>
                                <Image src={`/profilePics/${user.picture.toString()}.png`} width={"20vh"} height={"20vh"} mr={4}></Image>
                                <Box>
                                    <Text fontWeight="bold" fontSize="xl" mb={2}>{user.name}</Text>
                                    <Text color="gray.600" mb={2}>{handle}</Text>
                                </Box>
                            </Flex>
                            <Text mb={3} ml={2}>{user.description}</Text>
                            <Text fontWeight="bold" mb={2} ml={2}>Score : {user.score.toString()}</Text>
                            <Flex ml={2}>
                                <Text fontWeight="bold" display="block" mt="0.5em" mb="0.5em" mr={3}>{(user.numberOfFollowers.toString() == "0" || user.numberOfFollowers.toString() == "1") ? <>{user.numberOfFollowers.toString()} Follower</> : <>{user.numberOfFollowers.toString()} Followers</>}</Text>
                                <Link href={`/profile/${handle}/followings`} style={{fontWeight: "bold", marginTop: "0.5em", marginBottom: "0.5em", marginRight: "1.5em"}} display="block">{(user.followingsList.number.toString() == "0" || user.followingsList.number.toString() == "1") ? <Text textDecoration="underline grey" _hover={{ color: 'blue.600', textDecoration: 'none'}}>{user.followingsList.number.toString()} Following</Text> : <Text textDecoration="underline grey" _hover={{ color: 'blue.500', textDecoration: 'none'}}>{user.followingsList.number.toString()} Followings</Text>}</Link>
                                {!isUser && (isFollowing ? <Button p={4} mr={3} onClick={unfollow}>Unfollow</Button> : <Button p={4} mr={3} onClick={follow}>Follow</Button>)}
                                {!isUser && isFollowedBy ? <Text m="0.5em" fontStyle="italic">This user follows you.</Text> : <></>}
                            </Flex>
                            {isUser ? <Box mt={4} ml={6}><EditProfile setProfileChange={setProfileChange} currentDescription={user.description} currentName={user.name} currentPicture={user.picture}/></Box> : null}
                        </Box>
                    </GridItem>

                    {/* Right Section: List of SFTs */}
                    <GridItem id="displaysft" pt={5} colSpan={1}>
                        <Text fontWeight="bold" textAlign="center" pb={5}>{user.SFTIDs.length > 0 ? `This user has earned ${user.SFTIDs.length} NFT !` : "This user has not earned any NFT yet."}</Text>
                        <Flex justifyContent="center" alignItems="top" h="100%">
                            {user.SFTIDs.length > 0 && <DisplaySFTs user={user} />}
                        </Flex>
                    </GridItem>    
                </Grid>

                {/* Bottom Section : Recent posts */}
                <Box maxW="xl" w="full" mx="auto" mt={5}>
                    {isLoadingPosts ? <Spinner/> : <>
                        {displayedPosts.length == 0 ? <Text fontWeight="bold">No recent post found.</Text> : displayedPosts}
                    </>}
                </Box>   
            </>}
        </Box>
    )
}