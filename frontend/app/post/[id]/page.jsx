'use client'

// Components
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PostPageContent from "../../../components/PostPageContent";
import NotFound from "../../../components/404";

// Chakra UI
import { Box, Text, Flex, Spinner } from "@chakra-ui/react"

// Wagmi
import { readContract } from '@wagmi/core';

// Contracts informations
import { abi, contractAddress } from '../../../constants';

// React & context
import { useState, useEffect, useContext } from 'react'
import { StateContext } from "../../layout"

export default function Home({params : { id }}) {

    // Retrieve context
    const { isConnected, setIsConnected } = useContext(StateContext);

    // States
    const [currentID, setCurrentID] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [throw404, setThrow404] = useState(false);

    // Smart contract call to get the ID of the most recent publication (to verify if the post exists)
    async function retrieveNextPostID() {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: abi,
                functionName: "nextUnusedPublicationID",
            });
            setCurrentID(Number(data));
        } 
        catch (err) {
            console.error(err.message);
        }
    }

    // On mount, verify if the post with given ID exists
    useEffect(() => {
        const call = async () => {await retrieveNextPostID()};
        call();
        if (currentID) {
            if (id >= currentID || id == 0) {
                setThrow404(true);
            } else {
                setIsLoading(false);
            }
        }
    }, [currentID]);

    // Stop loading if 404
    useEffect(() => {
        if (throw404) {
            setIsLoading(false);
        }
    }, [throw404]);

    return(
        <Box className={isConnected ? "connected" : "notConnected"} minHeight="100vh">
            <Header />
            {isConnected ? 
                <>
                    {isLoading ? <Spinner/> :
                        <>
                            {throw404 ? <NotFound/> :
                                <PostPageContent id={id}/>
                            }
                        </>
                    }
                </>
            : 
                <Flex pt={40} minHeight="100%" alignItems="center" justifyContent="center" flexDirection="column">
                    <Text p="5vw" mr="10vw" ml="10vw" bgColor="rgba(0, 0, 100, 0.8)" borderRadius="20px" fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
                        Welcome ! <br/> Please sign in with a wallet to use the app.
                    </Text>
                </Flex>
            }
            <Footer />
        </Box>
    )
    
}