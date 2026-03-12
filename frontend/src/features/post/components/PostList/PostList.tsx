import type { MouseEvent as ReactMouseEvent } from "react";
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

  function handlePostLinkClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("[data-prevent-post-navigation='true']")) {
      event.preventDefault();
    }
  }

  return (
    <ul className={postListClassName} aria-label="Posts">
      {posts.map((post) => (
        <li key={post.id} className={styles.postListItem}>
          <Link
            to={`/posts/${post.id}`}
            className={styles.postLink}
            onClick={handlePostLinkClick}
          >
            <PostCard
              post={post}
              canManage={showPostActions || Boolean(post.canManage)}
              onEdit={onEditPost}
              onDelete={onDeletePost}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
