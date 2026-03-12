import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { FilterCategory } from "../../components/shared/FilterBar";
import FilterBar from "../../components/shared/FilterBar";
import Paginations from "../../components/shared/Paginations";
import SearchBar from "../../components/shared/SearchBar";
import Button from "../../components/ui/Button/Button";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { useToast } from "../../context/ToastContext/ToastContext";
import { commentAPI } from "../../features/comment/api/comment.api";
import { categoryAPI } from "../../features/post/api/category.api";
import { postAPI } from "../../features/post/api/api.post";
import CreatePostModal from "../../features/post/components/CreatePostModal";
import type { CreatePostFormValues } from "../../features/post/components/CreatePostModal";
import DeletePostModal from "../../features/post/components/DeletePostModal";
import EditPostModal from "../../features/post/components/EditPostModal";
import type { EditPostFormValues } from "../../features/post/components/EditPostModal";
import PostFeed from "../../features/post/components/PostFeed/PostFeed";
import PostFeedSkeleton from "../../features/post/components/PostFeedSkeleton/PostFeedSkeleton";
import type { PostCardData } from "../../features/post/components/PostCard/PostCard.types";
import { invalidateSuspenseResource, readSuspenseResource } from "../../lib/react/suspenseResource";
import styles from "./Home.module.css";
import { mapPostToCardData } from "./Home.utils";
import {
  EXPECTED_POST_CATEGORY_COUNT,
  findCategoryData,
  findCategoryLabelByBadgeType,
  findPostCategoryOptions,
  findCreatePostErrorMessage,
  findPostRequestErrorMessage,
} from "../../features/post/utils/post.utils";
import type {
  Category,
  PagedResponse,
  Post,
} from "../../features/post/types/post.type";

const PAGE_SIZE = 5;
const CLIENT_FILTER_FETCH_LIMIT = 1000;
type PostFeedScope = "ALL_POSTS" | "MY_POSTS";
type PostsFetcher = (
  page: number,
  size: number,
) => Promise<{ data: PagedResponse<Post> }>;

type HomePostsLoadResult =
  | {
      status: "success";
      posts: PostCardData[];
      totalPages: number;
      totalElements: number;
    }
  | {
      status: "error";
      errorMessage: string;
    };

// Builds a client-side paginated view for filtered posts when no dedicated endpoint exists.
function buildClientPaginatedPosts(
  posts: Post[],
  page: number,
  size: number,
): PagedResponse<Post> {
  const boundedSize = Math.max(size, 1);
  const safePage = Math.max(page, 0);
  const startIndex = safePage * boundedSize;
  const pagedPosts = posts.slice(startIndex, startIndex + boundedSize);
  const totalPages = Math.max(Math.ceil(posts.length / boundedSize), 1);

  return {
    content: pagedPosts,
    totalElements: posts.length,
    totalPages,
    size: boundedSize,
    number: safePage,
    first: safePage === 0,
    last: safePage >= totalPages - 1,
    numberOfElements: pagedPosts.length,
    empty: pagedPosts.length === 0,
  };
}

// Compares email addresses in a case-insensitive way.
function isSameUserEmail(leftEmail?: string | null, rightEmail?: string | null): boolean {
  return (
    Boolean(leftEmail && rightEmail) &&
    leftEmail?.trim().toLowerCase() === rightEmail?.trim().toLowerCase()
  );
}

// Applies the active search and category filters to a backend post record.
function doesPostMatchFilters(
  post: Post,
  searchQuery: string,
  activeCategory: FilterCategory,
  authorFilter: string,
): boolean {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizedAuthorFilter = authorFilter.trim().toLowerCase();
  const matchesQuery =
    normalizedQuery.length === 0 ||
    post.title.toLowerCase().includes(normalizedQuery) ||
    post.body.toLowerCase().includes(normalizedQuery);
  const matchesCategory =
    activeCategory === "ALL" ||
    findCategoryData(post.categoryName).badgeType === activeCategory;
  const matchesAuthor =
    normalizedAuthorFilter.length === 0 ||
    post.authorName.toLowerCase().includes(normalizedAuthorFilter) ||
    isSameUserEmail(post.authorEmail, normalizedAuthorFilter);

  return matchesQuery && matchesCategory && matchesAuthor;
}

interface HomePostsContentProps {
  cacheKey: string;
  currentPage: number;
  pageSize: number;
  fetchPosts: PostsFetcher;
  isAdminUser: boolean;
  currentUserEmail?: string | null;
  onEditPost: (post: PostCardData) => void;
  onDeletePost: (post: PostCardData) => void;
  onPageChange: (page: number) => void;
}

function HomePostsContent({
  cacheKey,
  currentPage,
  pageSize,
  fetchPosts,
  isAdminUser,
  currentUserEmail,
  onEditPost,
  onDeletePost,
  onPageChange,
}: HomePostsContentProps) {
  const result = readSuspenseResource<HomePostsLoadResult>(cacheKey, async () => {
    try {
      const response = await fetchPosts(currentPage - 1, pageSize);

      return {
        status: "success",
        posts: response.data.content.map(mapPostToCardData),
        totalPages: Math.max(response.data.totalPages, 1),
        totalElements: response.data.totalElements,
      };
    } catch {
      return {
        status: "error",
        errorMessage: "Unable to load posts right now. Please try again.",
      };
    }
  });

  useEffect(() => {
    return () => {
      invalidateSuspenseResource(cacheKey);
    };
  }, [cacheKey]);

  useEffect(() => {
    if (result.status === "success" && currentPage > result.totalPages) {
      onPageChange(result.totalPages);
    }
  }, [currentPage, onPageChange, result]);

  if (result.status === "error") {
    return (
      <p className={styles.errorMessage} role="alert">
        {result.errorMessage}
      </p>
    );
  }

  if (currentPage > result.totalPages) {
    return null;
  }

  const visiblePosts = result.posts.map((post) => ({
    ...post,
    canManage: isAdminUser || isSameUserEmail(post.authorEmail, currentUserEmail),
  }));
  const shouldCenterEmptyFeed = visiblePosts.length === 0;

  return (
    <>
      <div className={shouldCenterEmptyFeed ? styles.emptyFeed : undefined}>
        <PostFeed
          posts={visiblePosts}
          showPostActions={isAdminUser}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
        />
      </div>

      {result.totalElements > pageSize && (
        <Paginations
          className={styles.pagination}
          currentPage={currentPage}
          totalPages={result.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}


// Renders the home feed with search and category controls for mobile and desktop.
export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [postBeingEdited, setPostBeingEdited] = useState<PostCardData | null>(null);
  const [postBeingDeleted, setPostBeingDeleted] = useState<PostCardData | null>(null);
  const [postFeedScope, setPostFeedScope] = useState<PostFeedScope>("ALL_POSTS");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesErrorMessage, setCategoriesErrorMessage] = useState<string | null>(
    null,
  );
  const [postsReloadKey, setPostsReloadKey] = useState(0);
  const normalizedSearchQuery = searchQuery.trim();
  const authorFilter = searchParams.get("author")?.trim() ?? "";
  const authorFilterLabel =
    searchParams.get("authorName")?.trim() || authorFilter;
  const selectedCategoryLabel =
    activeCategory === "ALL"
      ? undefined
      : findCategoryLabelByBadgeType(activeCategory);

  useEffect(() => {
    if (!isAuthenticated) {
      setCategories([]);
      setIsLoadingCategories(false);
      setCategoriesErrorMessage(null);
      return;
    }

    let isUnmounted = false;

    async function loadCategories() {
      setIsLoadingCategories(true);
      setCategoriesErrorMessage(null);

      try {
        const response = await categoryAPI.getAll();

        if (isUnmounted) {
          return;
        }

        setCategories(response.data);
      } catch {
        if (isUnmounted) {
          return;
        }

        setCategories([]);
        setCategoriesErrorMessage(
          "Unable to load categories right now. Please try again.",
        );
      } finally {
        if (!isUnmounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      isUnmounted = true;
    };
  }, [isAuthenticated]);

  // Resolves the posts endpoint based on the active feed scope.
  const fetchPosts = useCallback(
    async (page: number, size: number) => {
      if (postFeedScope === "MY_POSTS" || authorFilter.length > 0) {
        const response = await postAPI.getAll(0, CLIENT_FILTER_FETCH_LIMIT);
        const filteredPosts = response.data.content.filter(
          (post) =>
            (postFeedScope !== "MY_POSTS" ||
              isSameUserEmail(post.authorEmail, user?.email)) &&
            doesPostMatchFilters(
              post,
              normalizedSearchQuery,
              activeCategory,
              authorFilter,
            ),
        );

        return {
          data: buildClientPaginatedPosts(filteredPosts, page, size),
        };
      }

      if (normalizedSearchQuery.length > 0 || selectedCategoryLabel) {
        return postAPI.search({
          keyword: normalizedSearchQuery || undefined,
          category: selectedCategoryLabel,
          page,
          size,
        });
      }

      return postAPI.getAll(page, size);
    },
    [
      activeCategory,
      authorFilter,
      normalizedSearchQuery,
      postFeedScope,
      selectedCategoryLabel,
      user?.email,
    ],
  );
  const postsQueryKey = JSON.stringify({
    activeCategory,
    authorFilter,
    currentPage,
    pageSize: PAGE_SIZE,
    postFeedScope,
    postsReloadKey,
    searchQuery: normalizedSearchQuery,
    selectedCategoryLabel,
    userEmail: user?.email ?? null,
  });

  const categoryOptions = useMemo(
    () => findPostCategoryOptions(categories),
    [categories],
  );
  const resolvedCategoriesErrorMessage =
    categoriesErrorMessage ??
    (!isLoadingCategories && categoryOptions.length < EXPECTED_POST_CATEGORY_COUNT
      ? "Some post categories are unavailable right now. Please try again."
      : null);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, authorFilter, normalizedSearchQuery]);

  // Keeps query state in sync with the search input field.
  function handleSearchValueChange(nextValue: string) {
    setSearchInput(nextValue);

    if (nextValue.trim().length === 0) {
      setSearchQuery("");
    }
  }

  // Triggers a search using the submitted input value.
  function handleSearch(query: string) {
    setCurrentPage(1);
    setSearchQuery(query.trim());
  }

  // Clears an author filter applied from analytics contributor links.
  function handleClearAuthorFilter() {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("author");
    nextSearchParams.delete("authorName");
    setCurrentPage(1);
    setSearchParams(nextSearchParams, { replace: true });
  }

  // Toggles between all posts and authenticated-user posts.
  function handleToggleYourPosts() {
    setCurrentPage(1);
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
    let createdPost: Post;
    let didImageUploadSucceed = !values.imageFile;

    try {
      const response = await postAPI.create({
        title: values.title,
        body: values.body,
        categoryId: values.categoryId,
      });
      createdPost = response.data;
    } catch (error) {
      const errorMessage = findCreatePostErrorMessage(error);
      showToast({
        variant: "error",
        message: errorMessage,
      });
      throw new Error(errorMessage);
    }

    if (values.imageFile) {
      try {
        const imageResponse = await postAPI.uploadImage(createdPost.id, values.imageFile);
        createdPost = imageResponse.data;
        didImageUploadSucceed = true;
      } catch (error) {
        showToast({
          variant: "error",
          message: findPostRequestErrorMessage(
            error,
            "Post created, but the image could not be uploaded right now. You can retry from Edit Post.",
          ),
        });
      }
    }

    if (didImageUploadSucceed) {
      showToast({
        variant: "success",
        message: "Post created successfully",
      });
    }

    navigate(`/posts/${createdPost.id}`);
  }

  // Opens the edit modal for the selected post card.
  function handleEditPost(post: PostCardData) {
    setPostBeingEdited(post);
    setIsEditPostOpen(true);
  }

  // Closes edit modal and clears selected post state.
  function handleCloseEditPostModal() {
    setIsEditPostOpen(false);
    setPostBeingEdited(null);
  }

  // Submits post update payload and refreshes the edited card in the feed.
  async function handleEditPostSubmit(values: EditPostFormValues): Promise<void> {
    let didImageUploadSucceed = !values.imageFile;

    try {
      await postAPI.update(Number(values.postId), {
        title: values.title,
        body: values.body,
        categoryId: values.categoryId,
      });
    } catch (error) {
      const errorMessage = findPostRequestErrorMessage(
        error,
        "Unable to update this post right now. Please try again.",
        "You are not authorized to update this post.",
        "This post could not be found anymore.",
      );
      showToast({
        variant: "error",
        message: errorMessage,
      });
      throw new Error(errorMessage);
    }

    if (values.imageFile) {
      try {
        await postAPI.uploadImage(Number(values.postId), values.imageFile);
        didImageUploadSucceed = true;
      } catch (error) {
        showToast({
          variant: "error",
          message: findPostRequestErrorMessage(
            error,
            "Post updated, but the image could not be uploaded right now. You can retry from Edit Post.",
          ),
        });
      }
    }

    if (didImageUploadSucceed) {
      showToast({
        variant: "success",
        message: "Post updated successfully",
      });
    }

    invalidateSuspenseResource(postsQueryKey);
    invalidateSuspenseResource(`post-detail:${values.postId}`);
    setPostsReloadKey((previousKey) => previousKey + 1);
  }

  // Opens the delete confirmation popup for the selected post.
  function handleDeletePost(post: PostCardData) {
    setPostBeingDeleted(post);
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

    setIsDeletingPost(true);

    try {
      const commentsResponse = await commentAPI.getByPostId(parsedPostId);

      for (const comment of commentsResponse.data) {
        await commentAPI.delete(parsedPostId, comment.id);
      }

      await postAPI.delete(parsedPostId);
      setPostBeingDeleted(null);
      invalidateSuspenseResource(postsQueryKey);
      invalidateSuspenseResource(`post-detail:${parsedPostId}`);
      setPostsReloadKey((previousKey) => previousKey + 1);
      showToast({
        variant: "success",
        message: "Post deleted successfully",
      });
    } catch (error) {
      const errorMessage = findPostRequestErrorMessage(
        error,
        "Unable to delete this post while it still has comments. Remove the comments first or use an admin account.",
        "You are not authorized to delete this post or one of its comments.",
        "This post could not be found anymore.",
      );
      showToast({
        variant: "error",
        message: errorMessage,
      });
    } finally {
      setIsDeletingPost(false);
    }
  }

  const normalizedRole = user?.role?.toUpperCase();
  const isAdminUser =
    normalizedRole === "ADMIN" || normalizedRole === "ROLE_ADMIN";
  const isYourPostsActive = postFeedScope === "MY_POSTS";

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

        {authorFilterLabel && (
          <div className={styles.authorFilterNotice}>
            <p className={styles.authorFilterText}>
              Showing posts by <span>{authorFilterLabel}</span>.
            </p>

            <button
              type="button"
              className={styles.clearAuthorFilterButton}
              onClick={handleClearAuthorFilter}
            >
              Clear
            </button>
          </div>
        )}
      </section>

      <Suspense fallback={<PostFeedSkeleton />}>
        <HomePostsContent
          key={postsQueryKey}
          cacheKey={postsQueryKey}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          fetchPosts={fetchPosts}
          isAdminUser={isAdminUser}
          currentUserEmail={user?.email}
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
          onPageChange={setCurrentPage}
        />
      </Suspense>

      {isAuthenticated && (
        <CreatePostModal
          categoryOptions={categoryOptions}
          isLoadingCategories={isLoadingCategories}
          categoriesErrorMessage={resolvedCategoriesErrorMessage}
          isOpen={isCreatePostOpen}
          onClose={handleCloseCreatePostModal}
          onCreatePost={handleCreatePost}
        />
      )}

      {isAuthenticated && (
        <EditPostModal
          categoryOptions={categoryOptions}
          isLoadingCategories={isLoadingCategories}
          categoriesErrorMessage={resolvedCategoriesErrorMessage}
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
