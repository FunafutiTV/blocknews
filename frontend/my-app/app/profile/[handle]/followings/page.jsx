'use client'
import Header from "../../../../components/Header"
import FollowingsList from "../../../../components/FollowingsList";

import { Box } from "@chakra-ui/react"
import { useContext } from 'react'

import { StateContext } from "../../../layout"

export default function Home({ params: { handle }}) {

  const { isConnected, setIsConnected } = useContext(StateContext);

  return (
    <Box minHeight="100vh" bgGradient="linear(to-br, rgba(255,255,255,1), rgba(255,255,255,1) 20%, rgba(236,227,241,1))">
      <Header />
      {isConnected ? <FollowingsList handle={handle}/> : <>Please sign in</>}
    </Box>
  )
}
