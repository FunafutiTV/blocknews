'use client'

// ChakraUI
import { Input, Button, useToast, Box, Textarea, Text, Image, Grid, GridItem, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverCloseButton } from '@chakra-ui/react';

// Wagmi
import { prepareWriteContract, writeContract, waitForTransaction, readContract } from '@wagmi/core';

// Contracts informations
import { abi, contractAddress } from '../constants';

// React
import { useState } from 'react';

export default function EditProfile({ setProfileChange, currentDescription, currentName, currentPicture }) {
    
    // States
    const [nameValue, setNameValue] = useState(currentName);
    const [descriptionValue, setDescriptionValue] = useState(currentDescription);
    const [picValue, setPicValue] = useState(currentPicture);
    const [isOpen, setIsOpen] = useState(false);

    // Chakra toast
    const toast = useToast();

    // Pictures array
    let pictures = [];
    for (let i = 1; i <= 20; i++) {
        pictures.push(<Button key={i} class="choosePicture" width={"6vw"} height={"6vw"} padding={0} border="none" background={Number(picValue) == i ? "blue.500" : "none"}><Image onClick={() => changePicture(i)} src={`/profilePics/${i}.png`} width={"6vw"} height={"6vw"}></Image></Button>)
    }

    // Smart contract call to changeName function
    async function changeName(name) {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'changeName',
                args: [name],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setProfileChange(i => i + 1); // Will trigger a useEffect in ProfilePageContent to update the profile in real time
            toast({
                title: "Succesfully changed name.",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        }
        catch(err) {
            console.error(err.message);
            toast({
                title: 'An error occured while performing the action.',
                description: "Please try again later.",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }  
    };

    // Smart contract call to changeDescription function
    async function changeDescription(description) {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'changeDescription',
                args: [description],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setProfileChange(i => i + 1); // Will trigger a useEffect in ProfilePageContent to update the profile in real time
            toast({
                title: "Succesfully edited description.",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        }
        catch(err) {
            console.error(err.message);
            toast({
                title: 'An error occured while performing the action.',
                description: "Please try again later.",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }  
    };

    // Smart contract call to changePicture function
    async function changePicture(picture) {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: abi,
                functionName: 'changePicture',
                args: [picture],
            });
            const { hash } = await writeContract(request);
            const data = await waitForTransaction({
                hash: hash,
            })
            setProfileChange(i => i + 1); // Will trigger a useEffect in ProfilePageContent to update the profile in real time
            setPicValue(picture);
            toast({
                title: "Succesfully changed profile picture.",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        }
        catch(err) {
            console.error(err.message);
            toast({
                title: 'An error occured while performing the action.',
                description: "Please try again later.",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }  
    };

    return (
        <Popover onOpen={() => {setIsOpen(true)}} onClose={() => {setIsOpen(false)}}>
            <PopoverTrigger>
                <Button display={isOpen ? "none" : "initial"}>Edit profile</Button>
            </PopoverTrigger>
            <PopoverContent p={1} width="80vw" mr="10vw" ml="10vw" mt="4em" color='white' bg='blue.700' borderColor='blue.800'>
                <PopoverHeader pt={4} fontWeight='bold' border='0'>Profile edition</PopoverHeader>
                <PopoverCloseButton />
                <PopoverBody>   
                    <Grid id="profileEdit" templateColumns="1fr 1fr">
                        <GridItem>
                            <Button key={0} width={"2vw"} height={"2vw"} padding={0} border="none" background={Number(picValue) == 0 ? "blue.500" : "none"}><Image onClick={() => changePicture(0)} src={`/profilePics/none.png`} width={"2vw"} height={"2vw"}></Image></Button>
                            <Box>
                                {pictures}
                            </Box>
                        </GridItem>
                        <GridItem>
                            <form onSubmit={(e) => {
                                        e.preventDefault();
                                        changeName(nameValue);
                                        }}>
                                <Box mb={4} mt={6} display="flex" alignItems="center" justifyContent="center">
                                    <Input type="text" value={nameValue} onChange={(e) => setNameValue(e.target.value)} maxLength={24} mr={2} placeholder="Enter new name"/>
                                    <Button type="submit" pr="3em" pl="3em" ptype="submit" variant="solid" colorScheme="blue">Change name</Button>
                                </Box>
                            </form>
                            <form onSubmit={(e) => {
                                        e.preventDefault();
                                        changeDescription(descriptionValue);
                                        }}>
                                
                                <Textarea mb={2} value={descriptionValue} onChange={(e) => setDescriptionValue(e.target.value)} maxLength={300} mr={2} placeholder="Enter new description"/>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Text color={descriptionValue ? (descriptionValue.length >= 250 ? (descriptionValue.length >= 300 ? 'red.500' : 'orange.500') : 'gray.500') : 'gray.500'}>{descriptionValue ? descriptionValue.length : 0}/300</Text>
                                    <Button type="submit" variant="solid" colorScheme="blue">Change description</Button>
                                </Box>
                            </form>
                        </GridItem>
                    </Grid> 
                </PopoverBody>
            </PopoverContent>
        </Popover>
  )
}