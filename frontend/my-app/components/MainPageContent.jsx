'use client'

// ChakraUI
import { Flex, VStack, Button, useToast } from '@chakra-ui/react';

// Components
import Publish from "./Publish";
import ExploreFeed from "./ExploreFeed";
import HomeFeed from "./HomeFeed";

// React
import { useState } from 'react';

export default function MainPageContent() {

    // Chakra toast
    const toast = useToast();

    // States
    const [newPost, setNewPost] = useState(0);
    const [isHome, setIsHome] = useState(true);

    return(
        <Flex  pt={4} pl={4}>
            {/* Left Section: Home and Explore Buttons */}
            <VStack spacing={4} align="stretch" mr={8}>
                <Button onClick={() => setIsHome(true)} colorScheme={isHome ? 'blue' : 'gray'} w="full">
                    Home
                </Button>
                <Button onClick={() => setIsHome(false)} colorScheme={!isHome ? 'blue' : 'gray'} w="full">
                    Explore
                </Button>
            </VStack>

            {/* Right Section: Publish Component and Feeds */}
            <VStack align="flex-start" w="full">
                <Publish setNewPost={setNewPost} />
                {isHome ? <HomeFeed newPost={newPost} /> : <ExploreFeed newPost={newPost} />}
            </VStack>
        </Flex>
    )
}