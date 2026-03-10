import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { postAPI } from "../features/post/api/api.post";
import type { Post } from "../features/post/types/post.type";

interface UsePaginatedPostsParams<T> {
  currentPage: number;
  pageSize: number;
  mapPost: (post: Post) => T;
}

interface UsePaginatedPostsResult<T> {
  posts: T[];
  setPosts: Dispatch<SetStateAction<T[]>>;
  isLoadingPosts: boolean;
  postsErrorMessage: string | null;
  totalPages: number;
}

// Fetches one posts page and exposes loading/error/total-page state.
export function usePaginatedPosts<T>({
  currentPage,
  pageSize,
  mapPost,
}: UsePaginatedPostsParams<T>): UsePaginatedPostsResult<T> {
  const [posts, setPosts] = useState<T[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsErrorMessage, setPostsErrorMessage] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isUnmounted = false;

    async function loadPosts() {
      setIsLoadingPosts(true);
      setPostsErrorMessage(null);

      try {
        const response = await postAPI.getAll(currentPage - 1, pageSize);

        if (isUnmounted) {
          return;
        }

        setPosts(response.data.content.map(mapPost));
        setTotalPages(Math.max(response.data.totalPages, 1));
      } catch {
        if (isUnmounted) {
          return;
        }

        setPosts([]);
        setTotalPages(1);
        setPostsErrorMessage("Unable to load posts right now. Please try again.");
      } finally {
        if (!isUnmounted) {
          setIsLoadingPosts(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isUnmounted = true;
    };
  }, [currentPage, mapPost, pageSize]);

  return {
    posts,
    setPosts,
    isLoadingPosts,
    postsErrorMessage,
    totalPages,
  };
}
