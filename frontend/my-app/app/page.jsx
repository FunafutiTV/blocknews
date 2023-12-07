'use client'
// Components
import Header from "@/components/Header"
import MainPageContent from "@/components/MainPageContent"
import { Box } from "@chakra-ui/react"
import { useContext } from 'react'

import { StateContext } from "./layout"

export default function Home() {

  const { isConnected, setIsConnected } = useContext(StateContext);

  return (
    <Box minHeight="100vh" bgGradient="linear(to-br, rgba(255,255,255,1), rgba(255,255,255,1) 20%, rgba(236,227,241,1))">
      <Header />
      {isConnected ? <MainPageContent/> : <>Please sign in</>}
    </Box>
  )
}