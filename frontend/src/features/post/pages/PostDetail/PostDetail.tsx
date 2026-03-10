import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import HouseIcon from "../../../../assets/Icons/HouseIcon";
import ClockIcon from "../../../../assets/Icons/ClockIcon";
import EmptyPostsIcon from "../../../../assets/Icons/EmptyPostsIcon";
import Trash2Icon from "../../../../assets/Icons/Trash2Icon";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs/Breadcrumbs";
import { useAuth } from "../../../../context/AuthContext/AuthContext";
import Button from "../../../../components/ui/Button/Button";
import { postAPI } from "../../api/api.post";
import DeletePostModal from "../../components/DeletePostModal";
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
  const { user } = useAuth();
  const commentInputId = useId();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentBeingDeleted, setCommentBeingDeleted] = useState<PostComment | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [postErrorMessage, setPostErrorMessage] = useState<string | null>(null);
  const [commentsErrorMessage, setCommentsErrorMessage] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentFeedbackMessage, setCommentFeedbackMessage] = useState<string | null>(null);
  const [isCommentFeedbackError, setIsCommentFeedbackError] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    let isUnmounted = false;
    const parsedPostId = Number(postId);

    setCommentDraft("");
    setCommentFeedbackMessage(null);
    setIsCommentFeedbackError(false);
    setCommentBeingDeleted(null);
    setIsDeletingComment(false);
    setIsSubmittingComment(false);

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
  const normalizedRole = user?.role?.toUpperCase();
  const isAdminUser = normalizedRole === "ADMIN" || normalizedRole === "ROLE_ADMIN";
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

  // Falls back to author-name matching until the comment API exposes a stable author id or email.
  function canManageComment(comment: PostComment): boolean {
    if (isAdminUser) {
      return true;
    }

    return user?.name.trim().toLowerCase() === comment.authorName.trim().toLowerCase();
  }

  // Keeps the comment composer in sync and clears temporary notice text.
  function handleCommentDraftChange(nextValue: string) {
    setCommentDraft(nextValue);
    setCommentFeedbackMessage(null);
    setIsCommentFeedbackError(false);
  }

  // Opens the confirmation modal for the selected comment.
  function handleOpenDeleteCommentModal(comment: PostComment) {
    setCommentFeedbackMessage(null);
    setIsCommentFeedbackError(false);
    setCommentBeingDeleted(comment);
  }

  // Closes the comment delete modal when there is no in-flight delete request.
  function handleCloseDeleteCommentModal() {
    if (isDeletingComment) {
      return;
    }

    setCommentBeingDeleted(null);
  }

  // Submits a new comment and appends it to the current comment list on success.
  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPostId = Number(postId);
    const trimmedComment = commentDraft.trim();

    if (trimmedComment.length === 0 || Number.isNaN(parsedPostId) || parsedPostId <= 0) {
      return;
    }

    setCommentFeedbackMessage(null);
    setIsCommentFeedbackError(false);
    setIsSubmittingComment(true);

    try {
      const response = await postAPI.createComment(parsedPostId, {
        content: trimmedComment,
      });

      setComments((previousComments) => [...previousComments, response.data]);
      setCommentsErrorMessage(null);
      setCommentDraft("");
      setCommentFeedbackMessage("Comment added.");
    } catch (error) {
      setIsCommentFeedbackError(true);
      setCommentFeedbackMessage(
        findPostRequestErrorMessage(
          error,
          "Unable to add your comment right now. Please try again.",
          "You are not authorized to add comments. Please sign in again.",
        ),
      );
    } finally {
      setIsSubmittingComment(false);
    }
  }

  // Removes the selected comment from the detail page when the delete API succeeds.
  async function handleDeleteCommentConfirm() {
    const parsedPostId = Number(postId);

    if (!commentBeingDeleted || Number.isNaN(parsedPostId) || parsedPostId <= 0) {
      setCommentBeingDeleted(null);
      return;
    }

    setCommentFeedbackMessage(null);
    setIsCommentFeedbackError(false);
    setIsDeletingComment(true);

    try {
      await postAPI.deleteComment(parsedPostId, commentBeingDeleted.id);
      setComments((previousComments) =>
        previousComments.filter((comment) => comment.id !== commentBeingDeleted.id),
      );
      setCommentsErrorMessage(null);
      setCommentBeingDeleted(null);
      setCommentFeedbackMessage("Comment deleted.");
    } catch (error) {
      setIsCommentFeedbackError(true);
      setCommentFeedbackMessage(
        findPostRequestErrorMessage(
          error,
          "Unable to delete this comment right now. Please try again.",
          "You are not authorized to delete this comment. Please sign in again.",
          "Comment deletion is unavailable until the backend exposes the delete endpoint.",
        ),
      );
    } finally {
      setIsDeletingComment(false);
    }
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
                <Button
                  type="submit"
                  variant="primary"
                  className={styles.commentButton}
                  disabled={isSubmittingComment || commentDraft.trim().length === 0}
                >
                  {isSubmittingComment ? "Adding comment..." : "Add comment"}
                </Button>
                {commentFeedbackMessage && (
                  <p
                    className={
                      isCommentFeedbackError
                        ? `${styles.commentFeedback} ${styles.commentFeedbackError}`
                        : `${styles.commentFeedback} ${styles.commentFeedbackSuccess}`
                    }
                    role="status"
                    aria-live="polite"
                  >
                    {commentFeedbackMessage}
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
                          <div className={styles.commentMetaLeft}>
                            <p className={styles.commentAuthor}>{comment.authorName}</p>
                            <div className={styles.commentTimeGroup}>
                              <ClockIcon className={styles.commentClockIcon} />
                              <p className={styles.commentTime}>
                                {formatRelativeTime(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                          {canManageComment(comment) && (
                            <button
                              type="button"
                              className={styles.commentDeleteButton}
                              aria-label={`Delete comment by ${comment.authorName}`}
                              onClick={() => handleOpenDeleteCommentModal(comment)}
                              disabled={isDeletingComment}
                            >
                              <Trash2Icon className={styles.commentDeleteIcon} />
                            </button>
                          )}
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

      <DeletePostModal
        isOpen={commentBeingDeleted !== null}
        isDeleting={isDeletingComment}
        title="Delete Comment"
        description="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
        onClose={handleCloseDeleteCommentModal}
        onConfirm={handleDeleteCommentConfirm}
      />
    </main>
  );
}
