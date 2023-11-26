'use client'
import { useProfile, usePublications, LimitType, PublicationType } from '@lens-protocol/react-web';
import Post from "../../../components/Post";

export default function ProfilePage({ params: { handle }}) {
  const namespace = handle.split('.')[1]
  handle = handle.split('.')[0]
  let { data: profile, loading } = useProfile({
    forHandle: `${namespace}/${handle}`
  })
  if (loading) return <p className="p-14">Loading ...</p>

  return (
    <div>
      <div className="p-14">
        {
          profile?.metadata?.picture?.__typename === 'ImageSet' && (
            <img
              width="200"
              height="200"
              alt={profile.handle?.fullHandle}
              className='rounded-xl'
              src={profile.metadata.picture.optimized?.uri}
            />
          )
        }
        <h1 className="text-3xl my-3">{profile?.handle?.localName}.{profile?.handle?.namespace}</h1>
        <h3 className="text-xl mb-4">{profile?.metadata?.bio}</h3>
       { profile && <Publications profile={profile} />}
      </div>
    </div>
  )
}

function Publications({ profile }) {
  let { data, loading, error } = usePublications({
    where: {
      publicationTypes: [PublicationType.Post],
      from: [profile.id],
    },
    limit: LimitType.TwentyFive
  })

  if (error) {
    console.log(error)
    return(<>Error</>)
  }

  return (
    <>
        {data?.map((publication, index) => (
            <Post publication={publication} key={index}/>
        ))}
    </>
  )
}