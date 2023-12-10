'use client'

// NextJS
import Link from 'next/link'

// Chakra UI
import { Link as ChakraLink, Box, Text } from "@chakra-ui/react";

export default function Profile({ profile, handle }) {

    return(
        <ChakraLink>
            <Link href={`/profile/${handle}`}>
                <Box border="1px" borderColor="gray.200" py={2} mb={4} ml={8} pl={3}>
                    <Text fontWeight="bold">{profile.name}</Text>
                    <Text color="gray.500">{handle}</Text>
                    <Text fontSize="sm">Score : {profile.score.toString()}</Text>
                    <Text fontSize="sm">{(profile.followersList.number.toString() == 0 || profile.followersList.number.toString() == 1) ? <>{profile.followersList.number.toString()} follower</> : <>{profile.followersList.number.toString()} followers</>}</Text>
                </Box>
            </Link>
        </ChakraLink>
    )
}