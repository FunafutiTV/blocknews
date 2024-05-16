'use client'

// Components
import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";
import FollowingsList from "../../../../components/FollowingsList";
import NotFound from "../../../../components/404";

// Chakra UI
import { Box, Text, Flex } from "@chakra-ui/react"

// React & context
import { useContext } from 'react'
import { StateContext } from "../../../layout"

export default function Home({ params: { handle }}) {

  // Retrieve context
  const { isConnected, setIsConnected } = useContext(StateContext);

  // Regex to verify if handle is a valid Ethereum address
  let regex = new RegExp(/^(0x)?[0-9a-fA-F]{40}$/);

  return (
    <Box className={isConnected ? "connected" : "notConnected"} minHeight="100vh">
      <Header />
      {isConnected ? 
        <>
          {regex.test(handle) && handle !== "0x0000000000000000000000000000000000000000" ?
            <FollowingsList handle={handle}/> : <NotFound/>
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
