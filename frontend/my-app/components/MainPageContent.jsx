'use client'
// ChakraUI
import { Flex, Alert, AlertIcon, Heading, Input, Button, useToast, Spinner } from '@chakra-ui/react';

import Publish from "./Publish";
import ExploreFeed from "./ExploreFeed";
import HomeFeed from "./HomeFeed";

import { useState, useEffect } from 'react';

export default function MainPageContent() {

    const toast = useToast();

    const [newPost, setNewPost] = useState(0);

    const [isHome, setIsHome] = useState(true);

    return(
    <>
        <Button onClick={() => setIsHome(true)}>Home</Button>
        <Button onClick={() => setIsHome(false)}>Explore</Button>
        <Publish setNewPost={setNewPost}/>
        {isHome ? <HomeFeed newPost={newPost}/> : <ExploreFeed newPost={newPost}/>}
    </>
    )
}