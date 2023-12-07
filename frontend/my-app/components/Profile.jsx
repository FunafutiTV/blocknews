'use client'

import Link from 'next/link'

export default function Profile({ profile, handle }) {

    return(
        <Link href={`/profile/${handle}`}>
            <>{profile.name}</>
            <>{handle}</>
            <>Score : {profile.score.toString()}</>
            <>{profile.followersList.number.toString()} followers</>
        </Link>
    )
}