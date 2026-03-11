import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ClockIcon from "../../../../assets/Icons/ClockIcon";
import HouseIcon from "../../../../assets/Icons/HouseIcon";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs/Breadcrumbs";
import Button from "../../../../components/ui/Button/Button";
import CommentsSection from "../../../comment/components/CommentsSection";
import { postAPI } from "../../api/api.post";
import type { Post } from "../../types/post.type";
import {
  findCategoryData,
  findPostRequestErrorMessage,
  formatRelativeTime,
} from "../../utils/post.utils";
import styles from "./PostDetail.module.css";

// Renders a post detail view fetched by id from the API.
export default function PostDetail() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [postErrorMessage, setPostErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isUnmounted = false;
    const parsedPostId = Number(postId);

    if (!postId || Number.isNaN(parsedPostId) || parsedPostId <= 0) {
      setPost(null);
      setPostErrorMessage("Post not found.");
      setIsLoadingPost(false);
      return;
    }

    // Loads the selected post details without the comment-side concerns.
    async function loadPostDetails() {
      setIsLoadingPost(true);
      setPostErrorMessage(null);

      try {
        const response = await postAPI.getById(parsedPostId);

        if (isUnmounted) {
          return;
        }

        setPost(response.data);
      } catch (error) {
        if (isUnmounted) {
          return;
        }

        setPost(null);
        setPostErrorMessage(
          findPostRequestErrorMessage(
            error,
            "Unable to load this post right now.",
          ),
        );
      } finally {
        if (!isUnmounted) {
          setIsLoadingPost(false);
        }
      }
    }

    void loadPostDetails();

    return () => {
      isUnmounted = true;
    };
  }, [postId]);

  const categoryData = useMemo(
    () => findCategoryData(post?.categoryName ?? null),
    [post?.categoryName],
  );
  const breadcrumbItems = [
    {
      id: "home",
      label: "Home",
      icon: <HouseIcon />,
      onClick: () => navigate("/"),
    },
    {
      id: "post-details",
      label: "Post Details",
    },
  ];

  return (
    <main className={styles.postDetailPage}>
      <section className={styles.content}>
        <Breadcrumbs className={styles.breadcrumbs} items={breadcrumbItems} />

        {isLoadingPost && (
          <p className={styles.statusMessage} role="status" aria-live="polite">
            Loading post...
          </p>
        )}

        {!isLoadingPost && postErrorMessage && (
          <p className={styles.errorMessage} role="alert">
            {postErrorMessage}
          </p>
        )}

        {!isLoadingPost && !postErrorMessage && post && (
          <article className={styles.detailLayout}>
            <section className={styles.postSection}>
              <header className={styles.postHeader}>
                <div className={styles.titleRow}>
                  <h1 className={styles.title}>{post.title}</h1>
                  <Button
                    variant="badge"
                    badgeType={categoryData.badgeType}
                    className={styles.badge}
                    disabled
                  >
                    {categoryData.badgeLabel}
                  </Button>
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
          </article>
        )}
      </section>
    </main>
  );
}
