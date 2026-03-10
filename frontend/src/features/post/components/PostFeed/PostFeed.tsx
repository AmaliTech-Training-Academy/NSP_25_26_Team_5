import EmptyPosts from "../EmptyPosts/EmptyPosts"
import PostList from "../PostList/PostList"
import { PostFeedProps } from "./PostFeed.types"

export default function PostFeed({ posts }: PostFeedProps) {
  if (posts.length === 0) {
    return <EmptyPosts />
  }

  return <PostList posts={posts} />
}