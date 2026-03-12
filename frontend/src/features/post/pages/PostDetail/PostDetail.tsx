import { isAxiosError } from "axios";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ClockIcon from "../../../../assets/Icons/ClockIcon";
import HouseIcon from "../../../../assets/Icons/HouseIcon";
import ImageIcon from "../../../../assets/Icons/ImageIcon";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs/Breadcrumbs";
import Button from "../../../../components/ui/Button/Button";
import { invalidateSuspenseResource, readSuspenseResource } from "../../../../lib/react/suspenseResource";
import CommentsSection from "../../../comment/components/CommentsSection";
import { postAPI } from "../../api/api.post";
import PostDetailSkeleton from "../../components/PostDetailSkeleton/PostDetailSkeleton";
import PostImageModal from "../../components/PostImageModal";
import PostNotFound from "../PostNotFound/PostNotFound";
import type { Post } from "../../types/post.type";
import {
  findCategoryData,
  findPostRequestErrorMessage,
  formatRelativeTime,
} from "../../utils/post.utils";
import styles from "./PostDetail.module.css";

type PostDetailLoadResult =
  | {
      status: "success";
      post: Post;
    }
  | {
      status: "missing";
    }
  | {
      status: "error";
      errorMessage: string;
    };

interface PostDetailContentProps {
  cacheKey: string;
  postId: number;
  onNavigateHome: () => void;
  onRetry: () => void;
}

function PostDetailContent({
  cacheKey,
  postId,
  onNavigateHome,
  onRetry,
}: PostDetailContentProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const result = readSuspenseResource<PostDetailLoadResult>(cacheKey, async () => {
    try {
      const response = await postAPI.getById(postId);

      return {
        status: "success",
        post: response.data,
      };
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return {
          status: "missing",
        };
      }

      return {
        status: "error",
        errorMessage: findPostRequestErrorMessage(
          error,
          "Unable to load this post right now.",
        ),
      };
    }
  });

  useEffect(() => {
    return () => {
      invalidateSuspenseResource(cacheKey);
    };
  }, [cacheKey]);

  if (result.status === "missing") {
    return <PostNotFound />;
  }

  if (result.status === "error") {
    return (
      <div className={styles.retryState}>
        <p className={styles.errorMessage} role="alert">
          {result.errorMessage}
        </p>
        <Button
          variant="secondary"
          className={styles.retryButton}
          onClick={onRetry}
        >
          Retry loading post
        </Button>
      </div>
    );
  }

  const { post } = result;
  const categoryData = findCategoryData(post.categoryName ?? null);
  const resolvedImageUrl = post.imageUrl ?? null;
  const breadcrumbItems = [
    {
      id: "home",
      label: "Home",
      icon: <HouseIcon />,
      onClick: onNavigateHome,
    },
    {
      id: "post-details",
      label: "Post Details",
    },
  ];

  return (
    <>
      <Breadcrumbs className={styles.breadcrumbs} items={breadcrumbItems} />

      <article className={styles.detailLayout}>
        <section className={styles.postSection}>
          <header className={styles.postHeader}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{post.title}</h1>

              <div className={styles.titleMeta}>
                <Button
                  variant="badge"
                  badgeType={categoryData.badgeType}
                  className={styles.badge}
                  disabled
                >
                  {categoryData.badgeLabel}
                </Button>

                {resolvedImageUrl && (
                  <button
                    type="button"
                    className={styles.imageButton}
                    aria-label={`View image for ${post.title}`}
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <ImageIcon className={styles.imageIcon} />
                  </button>
                )}
              </div>
            </div>

            <p className={styles.body}>{post.body}</p>

            <div className={styles.metaRow}>
              <p className={styles.author}>{post.authorName}</p>
              <div className={styles.timeGroup}>
                <ClockIcon className={styles.clockIcon} />
                <p className={styles.time}>{formatRelativeTime(post.createdAt)}</p>
              </div>
            </div>
          </header>

          <div className={styles.divider} aria-hidden="true" />
        </section>

        <CommentsSection postId={post.id} />

        <PostImageModal
          authorName={post.authorName}
          description={post.body}
          imageUrl={resolvedImageUrl}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          time={formatRelativeTime(post.createdAt)}
          title={post.title}
        />
      </article>
    </>
  );
}

// Renders a post detail view fetched by id from the API.
export default function PostDetail() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [postReloadKey, setPostReloadKey] = useState(0);
  const parsedPostId = Number(postId);
  const cacheKey = `post-detail:${parsedPostId}`;

  if (!postId || Number.isNaN(parsedPostId) || parsedPostId <= 0) {
    return <PostNotFound />;
  }

  return (
    <main className={styles.postDetailPage}>
      <section className={styles.content}>
        <Suspense fallback={<PostDetailSkeleton />}>
          <PostDetailContent
            key={`${parsedPostId}:${postReloadKey}`}
            cacheKey={cacheKey}
            postId={parsedPostId}
            onNavigateHome={() => navigate("/")}
            onRetry={() => {
              invalidateSuspenseResource(cacheKey);
              setPostReloadKey((currentKey) => currentKey + 1);
            }}
          />
        </Suspense>
      </section>
    </main>
  );
}
