import { Box, Text, Image } from '@chakra-ui/react'
import Link from 'next/link'

export default function Post({ publication }) {
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC' };
    const dateObj = new Date(publication.createdAt);

    return (
        <Box maxW="md"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        p={4}
        mb={4}>
            <Box display="flex" alignItems="center" mb={2}>
                <Image src={publication.by.metadata?.picture?.raw.uri || '/default.png'} boxSize="40px" borderRadius="full" mr={2}/>
                <Link href="/" fontWeight="bold">{publication.by.metadata?.displayName || publication.by.handle.fullHandle}</Link>
            </Box>
            <Text mb={4}>{publication.metadata?.content}</Text>
            {publication.metadata?.__typename === 'ImageMetadataV3' ? (
                <Image src={publication.metadata?.asset?.image?.raw.uri || ''} borderRadius="md" mb={4} alt={publication.metadata?.title} />
                ) : ""}
            <Text color="gray.500" fontSize="sm">{dateObj.toLocaleDateString('en-US', options)}</Text>
          </Box>
    )
}