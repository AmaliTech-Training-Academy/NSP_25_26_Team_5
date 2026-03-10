import { useEffect, useId, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import HouseIcon from "../../../../assets/Icons/HouseIcon";
import ClockIcon from "../../../../assets/Icons/ClockIcon";
import EmptyPostsIcon from "../../../../assets/Icons/EmptyPostsIcon";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs/Breadcrumbs";
import Button from "../../../../components/ui/Button/Button";
import { postAPI } from "../../api/api.post";
import type { Post, PostComment } from "../../types/post.type";
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
  const commentInputId = useId();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [postErrorMessage, setPostErrorMessage] = useState<string | null>(null);
  const [commentsErrorMessage, setCommentsErrorMessage] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentNotice, setCommentNotice] = useState<string | null>(null);

  useEffect(() => {
    let isUnmounted = false;
    const parsedPostId = Number(postId);

    setCommentDraft("");
    setCommentNotice(null);

    if (!postId || Number.isNaN(parsedPostId) || parsedPostId <= 0) {
      setPost(null);
      setComments([]);
      setPostErrorMessage("Post not found.");
      setCommentsErrorMessage(null);
      setIsLoadingPost(false);
      setIsLoadingComments(false);
      return;
    }

    async function loadPostDetails() {
      setIsLoadingPost(true);
      setIsLoadingComments(true);
      setPostErrorMessage(null);
      setCommentsErrorMessage(null);

      const [postResult, commentsResult] = await Promise.allSettled([
        postAPI.getById(parsedPostId),
        postAPI.getComments(parsedPostId),
      ]);

      if (isUnmounted) {
        return;
      }

      if (postResult.status === "fulfilled") {
        setPost(postResult.value.data);
      } else {
        setPost(null);
        setPostErrorMessage(
          findPostRequestErrorMessage(
            postResult.reason,
            "Unable to load this post right now.",
          ),
        );
      }

      if (commentsResult.status === "fulfilled") {
        setComments(commentsResult.value.data);
      } else {
        setComments([]);
        setCommentsErrorMessage(
          findPostRequestErrorMessage(
            commentsResult.reason,
            "Unable to load comments right now.",
          ),
        );
      }

      setIsLoadingPost(false);
      setIsLoadingComments(false);
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
  const commentsCount = !isLoadingComments ? comments.length : post?.commentCount ?? 0;
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

  // Keeps the comment composer in sync and clears temporary notice text.
  function handleCommentDraftChange(nextValue: string) {
    setCommentDraft(nextValue);
    setCommentNotice(null);
  }

  // Preserves the designed comment composer while POST comments are unavailable.
  function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (commentDraft.trim().length === 0) {
      return;
    }

    setCommentNotice("Comment posting is not available yet.");
  }

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

                <p className={styles.body}>{post.content}</p>

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

            <section className={styles.commentsLayout} aria-label="Comments">
              <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
                <label htmlFor={commentInputId} className={styles.srOnly}>
                  Share your thoughts
                </label>
                <textarea
                  id={commentInputId}
                  className={styles.commentTextarea}
                  placeholder="Share your thoughts..."
                  value={commentDraft}
                  onChange={(event) => handleCommentDraftChange(event.target.value)}
                />
                <Button type="submit" variant="primary" className={styles.commentButton}>
                  Add comment
                </Button>
                {commentNotice && (
                  <p className={styles.commentNotice} role="status" aria-live="polite">
                    {commentNotice}
                  </p>
                )}
              </form>

              <section className={styles.commentsSection}>
                <h2 className={styles.commentsHeading}>Comments ({commentsCount})</h2>

                {isLoadingComments && (
                  <p className={styles.statusMessage} role="status" aria-live="polite">
                    Loading comments...
                  </p>
                )}

                {!isLoadingComments && commentsErrorMessage && (
                  <p className={styles.errorMessage} role="alert">
                    {commentsErrorMessage}
                  </p>
                )}

                {!isLoadingComments && !commentsErrorMessage && comments.length === 0 && (
                  <div className={styles.emptyComments}>
                    <EmptyPostsIcon className={styles.emptyCommentsIcon} />
                    <p className={styles.emptyCommentsLabel}>No Comments yet</p>
                  </div>
                )}

                {!isLoadingComments && !commentsErrorMessage && comments.length > 0 && (
                  <ul className={styles.commentsList}>
                    {comments.map((comment) => (
                      <li key={comment.id} className={styles.commentItem}>
                        <div className={styles.commentMetaRow}>
                          <p className={styles.commentAuthor}>{comment.authorName}</p>
                          <div className={styles.commentTimeGroup}>
                            <ClockIcon className={styles.commentClockIcon} />
                            <p className={styles.commentTime}>
                              {formatRelativeTime(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className={styles.commentBody}>{comment.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </section>
          </article>
        )}
      </section>
    </main>
  );
}
