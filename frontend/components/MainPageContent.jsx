'use client'

// ChakraUI
import { VStack, Stack, Box, Button, Text, Grid, GridItem } from '@chakra-ui/react';

// CSS
import './styles/styles.css'

// Components
import Publish from "./Publish";
import ExploreFeed from "./ExploreFeed";
import HomeFeed from "./HomeFeed";
import CategoryFeed from './CategoryFeed';
import NotFound from './404';
import TopUsersList from './TopUsersList';

// React
import { useState } from 'react';

export default function MainPageContent() {

    // States
    const [newPost, setNewPost] = useState(0);
    const [feed, setFeed] = useState(1);

    return(
        <>
            {/* Left Section: Choice of feed */}
            <Box id="feeds" w="100%" position="fixed" width="13vw">
                <Stack align="stretch">
                    <Button className="feed" onClick={() => setFeed(1)} colorScheme={feed == 1 ? 'blue' : 'gray'}>
                        Home
                    </Button>
                    <Button className="feed" onClick={() => setFeed(2)} colorScheme={feed == 2 ? 'blue' : 'gray'}>
                        Explore
                    </Button>
                    <Text id="categories" fontWeight="bold">Categories</Text>
                    <Button className="feed" onClick={() => setFeed(3)} colorScheme={feed == 3 ? 'blue' : 'gray'}>
                        Technology
                    </Button>
                    <Button className="feed" onClick={() => setFeed(4)} colorScheme={feed == 4 ? 'blue' : 'gray'}>
                        Politics
                    </Button>
                    <Button className="feed" onClick={() => setFeed(5)} colorScheme={feed == 5 ? 'blue' : 'gray'}>
                        Sports
                    </Button>
                    <Button className="feed" onClick={() => setFeed(6)} colorScheme={feed == 6 ? 'blue' : 'gray'}>
                        Miscellaneous
                    </Button>
                </Stack>
            </Box>

            <Grid className="page" id="mainpage" templateColumns='4fr 2fr' gap='3vw' pl='2vw' pr='2vw'>

                {/* Middle Section: Publish Component and Feeds */}
                <GridItem w="100%">
                    <VStack align="flex-start" w="full">
                        <Publish setNewPost={setNewPost}/>
                        {feed == 1 ? <HomeFeed newPost={newPost} seeMoreNumber={0}/> 
                        : feed == 2 ? <ExploreFeed newPost={newPost} seeMoreNumber={0}/>
                        : feed == 3 ? <CategoryFeed newPost={newPost} category={1}/>
                        : feed == 4 ? <CategoryFeed newPost={newPost} category={2}/>
                        : feed == 5 ? <CategoryFeed newPost={newPost} category={3}/>
                        : feed == 6 ? <CategoryFeed newPost={newPost} category={4}/>
                        : <NotFound/>}
                    </VStack>
                </GridItem>

                {/* Right Secion: Top Users list */}
                <GridItem w="100%" id="topuserslist">
                    <TopUsersList/>
                </GridItem>
            </Grid>
        </>
    )
}