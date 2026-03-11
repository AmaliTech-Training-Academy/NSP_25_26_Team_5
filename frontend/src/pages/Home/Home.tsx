import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { FilterCategory } from "../../components/shared/FilterBar";
import FilterBar from "../../components/shared/FilterBar";
import Paginations from "../../components/shared/Paginations";
import SearchBar from "../../components/shared/SearchBar";
import Button from "../../components/ui/Button/Button";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { commentAPI } from "../../features/comment/api/comment.api";
import { postAPI } from "../../features/post/api/api.post";
import CreatePostModal from "../../features/post/components/CreatePostModal";
import type { CreatePostFormValues } from "../../features/post/components/CreatePostModal";
import DeletePostModal from "../../features/post/components/DeletePostModal";
import EditPostModal from "../../features/post/components/EditPostModal";
import type { EditPostFormValues } from "../../features/post/components/EditPostModal";
import PostFeed from "../../features/post/components/PostFeed/PostFeed";
import type { PostCardData } from "../../features/post/components/PostCard/PostCard.types";
import { usePaginatedPosts } from "../../hooks";
import styles from "./Home.module.css";
import { mapPostToCardData } from "./Home.utils";
import {
  findCreatePostErrorMessage,
  findPostRequestErrorMessage,
} from "../../features/post/utils/post.utils";

const PAGE_SIZE = 10;
type PostFeedScope = "ALL_POSTS" | "MY_POSTS";


// Renders the home feed with search and category controls for mobile and desktop.
export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [postBeingEdited, setPostBeingEdited] = useState<PostCardData | null>(null);
  const [postBeingDeleted, setPostBeingDeleted] = useState<PostCardData | null>(null);
  const [postFeedScope, setPostFeedScope] = useState<PostFeedScope>("ALL_POSTS");
  const [postActionErrorMessage, setPostActionErrorMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Resolves the posts endpoint based on the active feed scope.
  const fetchPosts = useCallback(
    (page: number, size: number) =>
      postFeedScope === "MY_POSTS"
        ? postAPI.getMine(page, size)
        : postAPI.getAll(page, size),
    [postFeedScope],
  );

  const {
    posts: homePosts,
    setPosts: setHomePosts,
    isLoadingPosts,
    postsErrorMessage,
    totalPages,
  } = usePaginatedPosts({
    currentPage,
    pageSize: PAGE_SIZE,
    mapPost: mapPostToCardData,
    fetchPosts,
  });

  // Applies search and category filters on the currently loaded posts page.
  const filteredPosts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return homePosts.filter((post) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        post.title.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        activeCategory === "ALL" || post.badgeType === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, homePosts, searchQuery]);

  // Keeps query state in sync with the search input field.
  function handleSearchValueChange(nextValue: string) {
    setSearchInput(nextValue);

    if (nextValue.trim().length === 0) {
      setSearchQuery("");
    }
  }

  // Triggers a search using the submitted input value.
  function handleSearch(query: string) {
    setSearchQuery(query.trim());
  }

  // Toggles between all posts and authenticated-user posts.
  function handleToggleYourPosts() {
    setCurrentPage(1);
    setPostActionErrorMessage(null);
    setPostFeedScope((previousScope) =>
      previousScope === "MY_POSTS" ? "ALL_POSTS" : "MY_POSTS",
    );
  }

  // Opens the create-post modal from the top action button.
  function handleOpenCreatePostModal() {
    setIsCreatePostOpen(true);
  }

  // Closes the create-post modal and keeps the current feed state.
  function handleCloseCreatePostModal() {
    setIsCreatePostOpen(false);
  }

  // Adds a newly created post to the top of the feed.
  async function handleCreatePost(values: CreatePostFormValues): Promise<void> {
    try {
      const response = await postAPI.create({
        title: values.title,
        body: values.body,
        category: values.category,
      });

      const createdPost = mapPostToCardData(response.data);
      setHomePosts((previousPosts) => [createdPost, ...previousPosts]);
      navigate(`/posts/${response.data.id}`);
    } catch (error) {
      throw new Error(findCreatePostErrorMessage(error));
    }
  }

  // Opens the edit modal for the selected post card.
  function handleEditPost(postId: string) {
    const targetPost = homePosts.find((post) => post.id === postId);

    if (!targetPost) {
      return;
    }

    setPostActionErrorMessage(null);
    setPostBeingEdited(targetPost);
    setIsEditPostOpen(true);
  }

  // Closes edit modal and clears selected post state.
  function handleCloseEditPostModal() {
    setIsEditPostOpen(false);
    setPostBeingEdited(null);
  }

  // Submits post update payload and refreshes the edited card in the feed.
  async function handleEditPostSubmit(values: EditPostFormValues): Promise<void> {
    try {
      const response = await postAPI.update(Number(values.postId), {
        title: values.title,
        body: values.body,
        category: values.category,
      });

      const updatedPost = mapPostToCardData(response.data);
      setHomePosts((previousPosts) =>
        previousPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
      );
      setPostActionErrorMessage(null);
    } catch {
      throw new Error("Unable to update this post right now. Please try again.");
    }
  }

  // Opens the delete confirmation popup for the selected post.
  function handleDeletePost(postId: string) {
    const targetPost = homePosts.find((post) => post.id === postId);

    if (!targetPost) {
      return;
    }

    setPostActionErrorMessage(null);
    setPostBeingDeleted(targetPost);
  }

  // Closes the delete modal when there is no in-flight delete request.
  function handleCloseDeletePostModal() {
    if (isDeletingPost) {
      return;
    }

    setPostBeingDeleted(null);
  }

  // Confirms deletion and removes the post from the currently loaded page.
  async function handleDeletePostConfirm() {
    if (!postBeingDeleted) {
      return;
    }

    const parsedPostId = Number(postBeingDeleted.id);

    if (Number.isNaN(parsedPostId)) {
      setPostBeingDeleted(null);
      return;
    }

    setPostActionErrorMessage(null);
    setIsDeletingPost(true);

    try {
      const commentsResponse = await commentAPI.getByPostId(parsedPostId);

      for (const comment of commentsResponse.data) {
        await commentAPI.delete(parsedPostId, comment.id);
      }

      await postAPI.delete(parsedPostId);
      setHomePosts((previousPosts) =>
        previousPosts.filter((post) => post.id !== postBeingDeleted.id),
      );
      setPostBeingDeleted(null);
    } catch (error) {
      setPostActionErrorMessage(
        findPostRequestErrorMessage(
          error,
          "Unable to delete this post while it still has comments. Remove the comments first or use an admin account.",
          "You are not authorized to delete this post or one of its comments.",
          "This post could not be found anymore.",
        ),
      );
    } finally {
      setIsDeletingPost(false);
    }
  }

  const normalizedRole = user?.role?.toUpperCase();
  const isAdminUser =
    normalizedRole === "ADMIN" || normalizedRole === "ROLE_ADMIN";
  const isYourPostsActive = postFeedScope === "MY_POSTS";
  const canManageVisiblePosts = isAdminUser || isYourPostsActive;
  const shouldCenterEmptyFeed = filteredPosts.length === 0;

  return (
    <main className={styles.homePage}>
      <section className={styles.controlsSection} aria-label="Post controls">
        <div className={styles.searchActionsRow}>
          <SearchBar
            className={styles.searchBar}
            value={searchInput}
            onValueChange={handleSearchValueChange}
            onSearch={handleSearch}
          />

          {isAuthenticated && (
            <Button
              variant="primary"
              className={styles.createPostButton}
              aria-label="Create post"
              onClick={handleOpenCreatePostModal}
            >
              <span className={styles.createPostIcon} aria-hidden="true">
                +
              </span>
              <span>Create post</span>
            </Button>
          )}
        </div>

        <div className={styles.filterActionsRow}>
          <FilterBar
            className={styles.filterBar}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {isAuthenticated && (
            <Button
              variant="badge"
              className={styles.yourPostsButton}
              aria-pressed={isYourPostsActive}
              onClick={handleToggleYourPosts}
            >
              Your Posts
            </Button>
          )}
        </div>
      </section>

      {isLoadingPosts && (
        <p className={styles.statusMessage} role="status" aria-live="polite">
          Loading posts...
        </p>
      )}

      {!isLoadingPosts && postsErrorMessage && (
        <p className={styles.errorMessage} role="alert">
          {postsErrorMessage}
        </p>
      )}

      {!isLoadingPosts && !postsErrorMessage && postActionErrorMessage && (
        <p className={styles.errorMessage} role="alert">
          {postActionErrorMessage}
        </p>
      )}

      {!isLoadingPosts && !postsErrorMessage && (
        <div className={shouldCenterEmptyFeed ? styles.emptyFeed : undefined}>
          <PostFeed
            posts={filteredPosts}
            showPostActions={canManageVisiblePosts}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
          />
        </div>
      )}

      {!isLoadingPosts && !postsErrorMessage && totalPages > 1 && (
        <Paginations
          className={styles.pagination}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {isAuthenticated && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={handleCloseCreatePostModal}
          onCreatePost={handleCreatePost}
        />
      )}

      {isAuthenticated && (
        <EditPostModal
          isOpen={isEditPostOpen}
          post={postBeingEdited}
          onClose={handleCloseEditPostModal}
          onEditPost={handleEditPostSubmit}
        />
      )}

      {isAuthenticated && (
        <DeletePostModal
          isOpen={postBeingDeleted !== null}
          isDeleting={isDeletingPost}
          onClose={handleCloseDeletePostModal}
          onConfirm={handleDeletePostConfirm}
        />
      )}
    </main>
  );
}
