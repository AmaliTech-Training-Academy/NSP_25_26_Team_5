import { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import type { FilterCategory } from "../../components/shared/FilterBar";
import FilterBar from "../../components/shared/FilterBar";
import Paginations from "../../components/shared/Paginations";
import SearchBar from "../../components/shared/SearchBar";
import Button from "../../components/ui/Button/Button";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { postAPI } from "../../features/post/api/api.post";
import CreatePostModal from "../../features/post/components/CreatePostModal";
import type { CreatePostFormValues } from "../../features/post/components/CreatePostModal";
import PostFeed from "../../features/post/components/PostFeed/PostFeed";
import type { PostCardData } from "../../features/post/components/PostCard/PostCard.types";
import { usePaginatedPosts } from "../../hooks";
import styles from "./Home.module.css";
import { mapPostToCardData } from "./Home.utils";
import { findCreatePostErrorMessage } from "../../features/post/utils/post.utils";

const PAGE_SIZE = 10;


// Renders the home feed with search and category controls for mobile and desktop.
export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
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
        content: values.body,
        categoryId: values.categoryId,
      });

      const createdPost = mapPostToCardData(response.data);
      const nextPost: PostCardData = {
        ...createdPost,
        badgeLabel: values.categoryLabel,
        badgeType: values.category,
      };

      setHomePosts((previousPosts) => [nextPost, ...previousPosts]);
      navigate(`/posts/${response.data.id}`);
    } catch (error) {
      throw new Error(findCreatePostErrorMessage(error));
    }
  }

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

        <FilterBar
          className={styles.filterBar}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
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

      {!isLoadingPosts && !postsErrorMessage && <PostFeed posts={filteredPosts} />}

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
    </main>
  );
}
