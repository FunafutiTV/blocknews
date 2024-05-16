'use client'

// Components
import Header from "../components/Header"
import Footer from "../components/Footer"
import MainPageContent from "../components/MainPageContent"

// Chakra UI
import { Box, Text, Flex } from "@chakra-ui/react"

// React & context
import { useContext } from 'react'
import { StateContext } from "./layout"

export default function Home() {

  // Retrieve context
  const { isConnected, setIsConnected } = useContext(StateContext);

  return (
    <Box className={isConnected ? "connected" : "notConnected"} minHeight="100vh">
      <Header />
      {isConnected ? <MainPageContent/> : 
        <Flex minHeight="100%" pt={40} alignItems="center" justifyContent="center" flexDirection="column">
          <Text p="5vw" mr="10vw" ml="10vw" bgColor="rgba(0, 0, 100, 0.8)" borderRadius="20px" fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
            Welcome ! <br/> Please sign in with a wallet to use the app.
          </Text>
        </Flex>
      }
      <Footer />
    </Box>
  )
}