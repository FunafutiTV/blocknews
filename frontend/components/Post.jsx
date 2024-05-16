'use client'

// Chakra UI
import { Box, Text, Image, Button, useToast, Spinner } from '@chakra-ui/react'

// NextJS
import Link from 'next/link'

// Contracts informations
import { abi, contractAddress } from '../constants';

// React
import { useState, useEffect } from 'react'

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction, readContract } from '@wagmi/core';
import { useAccount } from 'wagmi'

export default function Post({ publication, postPage }) {
    
    // Account
    const { address } = useAccount();

    // Chakra toast
    const toast = useToast();

    // States
    const [vote, setVote] = useState(0);
    const [refreshArrows, setRefreshArrows] = useState(0); 
    const [poster, setPoster] = useState({});
    const [reposted, setReposted] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Logic to display the publication time of the post
    const dateDiff = Math.floor(new Date().getTime() / 1000) - Number(publication.date);
    let displayTime = ""; 
    if (dateDiff < BigInt(0)) {
        console.error("Publication time is in the future");
    } else if (dateDiff < 2) {
        displayTime = dateDiff.toString() + " second ago";
    } else if (dateDiff < 60) {
        displayTime = dateDiff.toString() + " seconds ago";
    } else if (dateDiff < 120) {
        displayTime = "1 minute ago";
    } else if (dateDiff < 3600) {
        displayTime = (Math.floor(dateDiff / 60)).toString() + " minutes ago";
    } else if (dateDiff < 7200) {
        displayTime = "1 hour ago";
    } else if (dateDiff < 86400) {
        displayTime = (Math.floor(dateDiff / 3600)).toString() + " hours ago";
    } else { // If the post is older than a day, the date is displayed directly
        const publicationDate = new Date(Number(publication.date) * 1000);
        const day = publicationDate.getDate().toString();
        switch (publicationDate.getMonth()) {
            case 0:
                displayTime = "Jan. " + day;
                break;
            case 1:
                displayTime = "Feb. " + day;
                break;
            case 2:
                displayTime = "Mar. " + day;
                break;
            case 3:
                displayTime = "Apr. " + day;
                break;
            case 4:
                displayTime = "May " + day;
                break;
            case 5:
                displayTime = "Jun. " + day;
                break;
            case 6:
                displayTime = "Jul. " + day;
                break;
            case 7:
                displayTime = "Aug. " + day;
                break;
            case 8:
                displayTime = "Sep. " + day;
                break;
            case 9:
                displayTime = "Oct. " + day;
                break;
            case 10:
                displayTime = "Nov. " + day;
                break;
            case 11:
                displayTime = "Dec. " + day;
                break;
        }
        if (dateDiff > 28000000) { // If the post is old enough, the year will be displayed too
            displayTime += " " + publicationDate.getFullYear().toString();
        }
    }

    // Get the post's category from the number given by the smart contract
    let category = "";

    switch (publication.category.toString()) {
        case "0":
            category = "";
            break;
        case "1":
            category = "Technology";
            break;
        case "2":
            category = "Politics";
            break;
        case "3":
            category = "Sports";
            break;
        case "4":
            category = "Misc.";
            break;
    }

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
            console.error(err.message);
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
            setPoster(data);
        } 
        catch (err) {
            console.error(err.message);
        }
    }

    // Smart contract call to retrieve the reposted publication if it is a repost
    async function retrieveReposted() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getPublication",
                args: [publication.isRepostOf],
            });
            setReposted(data);
            setIsLoading(false);
        } 
        catch (err) {
            console.error(err.message);
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
            setRefreshArrows((i) => i + 1); // Triggers a useEffect to color the vote arrows in real time
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
            setRefreshArrows((i) => i + 1); // Triggers a useEffect to color the vote arrows in real time
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

    // Smart contract call to repost function
    async function repost() {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'repost',
                args: [publication.id],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            toast({
                title: "Succesfully reposted publication.",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
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

    // useEffect to get the current user's vote
    useEffect(() => {
        if (publication.isRepostOf.toString() == "0") {
            const call = async() => {await getVote()};
            call();
        }
    }, [refreshArrows])

    // useEffect to get the poster's name
    useEffect(() => {
        const call = async() => {await getUsername()};
        call();
    }, []);

    // If the publication is a repost, get the original post
    useEffect(() => {
        if (publication.isRepostOf.toString() !== "0") {
            const call = async() => {await retrieveReposted()};
            call();
        }
    }, [])

    if (!publication.exists) {
        return <b>This publication does not exist.</b>
    }

    return (
        <>
      {publication.isRepostOf.toString() === "0" ? (
        <Box bg="white" className="post" minW="25vw" textAlign="start" borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md" p={4} margin="auto" mb={4} display="flex" flexDirection="column">
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Link href={`/profile/${publication.poster}`} fontWeight="bold" style={{ display: "flex", alignItems: "center" }}> 
              {Object.keys(poster).length !== 0 && <Image src={`/profilePics/${poster.picture.toString()}.png`} width={"10vh"} height={"10vh"} mr={2} />}
              <Box>
              {Object.keys(poster).length !== 0 && <Text fontSize="lg" color="blue.500">{poster.name}</Text>}
                <Text fontSize="sm" color="gray.500">{`${publication.poster.substring(0, 5)}...${publication.poster.substring(publication.poster.length - 5)}`}</Text>
              </Box>
            </Link>
            <Box display="flex" alignItems="center">
              {category && <Text mr={5}>{category}</Text>}
              <Text textAlign="center" mr={2}>{displayTime}</Text>
            </Box>
          </Box>
          { postPage ? 
            <Text mb={4}>{publication.content}</Text> : 
            <Link href={`/post/${publication.id}`} textDecoration="none" _hover={{ textDecoration: "underline" }}>
                <Text mb={4}>{publication.content}</Text>
            </Link>
          }
          {publication.link && <Text fontSize="sm" mb={4}><b>Learn more :</b> <Text as="span" color="blue.500"><Link href={publication.link} target="_blank">{publication.link.length > 30 ? publication.link.substring(0, 30) + "..." : publication.link}</Link></Text></Text>}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Button width={5} height={5} padding={0} border="none" background="none" onClick={upvote}>
                <Image src={vote.toString() === "2" ? "/upvotes/upvoted.png" : "/upvotes/notupvoted.png"} alt="upvote" width={5} height={5} />
              </Button>
              <Text userSelect="none">{publication.score.toString()}</Text>
              <Button width={5} height={5} padding={0} border="none" background="none" onClick={downvote} mr={2}>
                <Image src={vote.toString() === "1" ? "/upvotes/downvoted.png" : "/upvotes/notdownvoted.png"} alt="downvote" width={5} height={5} />
              </Button>
              <Button width={5} height={5} padding={0} border="none" background="none" onClick={repost} mr={2}>
                <Image src="/repost.png" alt="repost" width={5} height={5} />
              </Button>
            </Box>
            <Text color="gray.500" fontSize="sm">{publication.commentsIDs.length === 0 || publication.commentsIDs.length === 1 ? `${publication.commentsIDs.length} comment` : `${publication.commentsIDs.length} comments`}</Text>
          </Box>
        </Box>
      ) : (
        <>
            <Box className="post" margin="auto" textAlign="left" mb={1}>
                <Text as="span" fontSize="sm" color="gray.500">This post has been shared by </Text>
                <Link href={`/profile/${publication.poster}`} fontWeight="bold">
                    <Text as="span" color="blue.500">{ Object.keys(poster).length !== 0 && poster.name ? poster.name : `${publication.poster.substring(0, 5)}...${publication.poster.substring(publication.poster.length - 5)}`}</Text>
                </Link>
            </Box>
          {isLoading ? <Spinner /> : <Post publication={reposted} />}
        </>
      )}
    </>
      );
} 