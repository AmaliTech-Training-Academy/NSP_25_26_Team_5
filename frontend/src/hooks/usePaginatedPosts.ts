import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { postAPI } from "../features/post/api/api.post";
import type { PagedResponse, Post } from "../features/post/types/post.type";

type PostsFetcher = (
  page: number,
  size: number,
) => Promise<{ data: PagedResponse<Post> }>;

interface UsePaginatedPostsParams<T> {
  currentPage: number;
  pageSize: number;
  mapPost: (post: Post) => T;
  fetchPosts?: PostsFetcher;
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
  fetchPosts,
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
        const response = await (fetchPosts ?? postAPI.getAll)(
          currentPage - 1,
          pageSize,
        );

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
  }, [currentPage, fetchPosts, mapPost, pageSize]);

  return {
    posts,
    setPosts,
    isLoadingPosts,
    postsErrorMessage,
    totalPages,
  };
}
