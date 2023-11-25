'use client'
import { useExplorePublications, ExplorePublicationsOrderByType, LimitType, ExplorePublicationType } from '@lens-protocol/react-web'
import Post from "../components/Post"
import { Heading } from '@chakra-ui/react' 

export default function Home() {
  const { data, error, loading } = useExplorePublications({
    limit: LimitType.TwentyFive,
    orderBy: ExplorePublicationsOrderByType.Latest,
    where: {
      "publicationTypes": ExplorePublicationType["POST"],
      "metadata": {
        // "publishedOn": [AppId]
      }
    }
  })
  console.log('data: ', data)

  if (loading) {
    return(<>spinner</>)
  }

  if (error) {
    return(<>Error : {error}</>)
  }
  
  return (
    <div>
      <Heading>My Lens App</Heading>
      {
        data?.map((publication, index) => (
          <Post loading={loading} publication={publication} key={index}/>
        ))
      }
    </div>
  )
}