'use client'
import { usePublication, usePublications, LimitType, PublicationType, publicationId } from '@lens-protocol/react-web';
import Post from "../../../components/Post";

export default function PostPage({params : { id }}) {

    const { data, error, loading } = usePublication({
        forId: id,
    });

    const { data: comments, error: commentsError, loading: commentsLoading } = usePublications({
        limit: LimitType.TwentyFive,
        where: {
            commentOn: {
                id: id,
        }},
    })

    if (error || commentsError) {
        console.log(error)
        console.log(commentsError)
        return(<>Error</>)
    }

    if (loading || commentsLoading) {
        return(<>Spinner</>)
    }
    
    return(
        <>
            <Post publication={data}/>
            <> 
                {comments?.map((publication, index) => {
                    return (
                    <Post publication={publication} key={index}/>
                )})}
                    </>
        </>
    )
    
}