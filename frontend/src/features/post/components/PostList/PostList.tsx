
import type { PostListProps } from "./PostList.types";
import styles from "./PostList.module.css";
import { joinPostListClassName } from "./PostList.utils";
import { Link } from "react-router";
import PostCard from "../PostCard/PostCard";

export default function PostList({
  posts,
  className,
  showPostActions = false,
  onEditPost,
  onDeletePost,
}: PostListProps) {
  const postListClassName = joinPostListClassName(styles.postList, className);

  return (
    <ul className={postListClassName} aria-label="Posts">
      {posts.map((post) => (
        <Link to={`/posts/${post.id}`} key={post.id} className={styles.postLink}>
          <PostCard
            post={post}
            className={styles.postListItem}
            canManage={showPostActions || Boolean(post.canManage)}
            onEdit={onEditPost}
            onDelete={onDeletePost}
          />
        </Link>
      ))}
    </ul>
  );
}
