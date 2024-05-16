'use client'

// NextJS
import Link from 'next/link'

// Chakra UI
import { Box, Text, Image } from "@chakra-ui/react";

export default function Profile({ profile, handle }) {

    return(
            <Link href={`/profile/${handle}`}>
                <Box margin="auto" bg="white" maxW="md" borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="md" p={4} mb={4}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <Image src={`/profilePics/${profile.picture.toString()}.png`} width={"10vh"} height={"10vh"} mr={2}></Image>
                        <Box>
                            <Text fontWeight="bold">{profile.name}</Text>
                            <Text color="gray.500">{`${handle.substring(0, 5)}...${handle.substring(handle.length - 5)}`}</Text>
                        </Box>
                    </Box>
                    <Text marginBottom={2} fontSize="sm">{profile.description.length > 80 ? `${profile.description.substring(0, 79)}...` : profile.description}</Text>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Text fontSize="sm">Score : {profile.score.toString()}</Text>
                        <Text fontSize="sm">{(profile.numberOfFollowers.toString() == 0 || profile.numberOfFollowers.toString() == 1) ? <>{profile.numberOfFollowers.toString()} follower</> : <>{profile.numberOfFollowers.toString()} followers</>}</Text>
                    </Box>
                </Box>
            </Link>
    )
}