import { useEffect, useId, useState, type FormEvent } from "react";
import PenIcon from "../../../../assets/Icons/PenIcon";
import Trash2Icon from "../../../../assets/Icons/Trash2Icon";
import EmptyPostsIcon from "../../../../assets/Icons/EmptyPostsIcon";
import Button from "../../../../components/ui/Button/Button";
import { useAuth } from "../../../../context/AuthContext/AuthContext";
import { useToast } from "../../../../context/ToastContext/ToastContext";
import DeletePostModal from "../../../post/components/DeletePostModal";
import { commentAPI } from "../../api/comment.api";
import type { Comment } from "../../types/comment.types";
import {
  MAX_COMMENT_LENGTH,
  canManageComment,
  findCommentRequestErrorMessage,
  formatCommentTimestamp,
  getCommentAuthorInitials,
  joinCommentsSectionClassName,
  sortCommentsOldestFirst,
  validateCommentContent,
} from "../../utils/comment.utils";
import type { CommentsSectionProps } from "./CommentsSection.types";
import styles from "./CommentsSection.module.css";

// Renders the responsive comment composer, list, and inline management states.
export default function CommentsSection({
  className,
  postId,
}: CommentsSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const commentInputId = useId();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentDraftError, setCommentDraftError] = useState<string | null>(null);
  const [commentRequestError, setCommentRequestError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [editingDraftError, setEditingDraftError] = useState<string | null>(null);
  const [commentBeingDeleted, setCommentBeingDeleted] = useState<Comment | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsErrorMessage, setCommentsErrorMessage] = useState<string | null>(null);
  const [commentsReloadKey, setCommentsReloadKey] = useState(0);

  const commentsSectionClassName = joinCommentsSectionClassName(
    styles.commentsSection,
    className,
  );

  useEffect(() => {
    let isUnmounted = false;

    // Loads the latest comments for the selected post id.
    async function loadComments() {
      setIsLoadingComments(true);
      setCommentsErrorMessage(null);
      setCommentRequestError(null);
      setEditingCommentId(null);
      setEditingDraft("");
      setEditingDraftError(null);
      setCommentBeingDeleted(null);

      try {
        const response = await commentAPI.getByPostId(postId);

        if (isUnmounted) {
          return;
        }

        setComments(sortCommentsOldestFirst(response.data));
      } catch (error) {
        if (isUnmounted) {
          return;
        }

        setComments([]);
        setCommentsErrorMessage(
          findCommentRequestErrorMessage(
            error,
            "Unable to load comments right now.",
          ),
        );
      } finally {
        if (!isUnmounted) {
          setIsLoadingComments(false);
        }
      }
    }

    void loadComments();

    return () => {
      isUnmounted = true;
    };
  }, [postId, commentsReloadKey]);

  // Keeps the composer input aligned with the current validation state.
  function handleCommentDraftChange(nextValue: string) {
    setCommentDraft(nextValue);
    setCommentDraftError(null);
    setCommentRequestError(null);
  }

  // Validates and submits a new comment through the frontend API contract.
  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateCommentContent(commentDraft);

    if (validationError) {
      setCommentDraftError(validationError);
      return;
    }

    setCommentDraftError(null);
    setCommentRequestError(null);
    setIsSubmittingComment(true);

    try {
      const response = await commentAPI.create(postId, {
        body: commentDraft.trim(),
      });

      setComments((previousComments) =>
        sortCommentsOldestFirst([...previousComments, response.data]),
      );
      setCommentDraft("");
      showToast({
        variant: "success",
        message: "Comment added successfully",
      });
    } catch (error) {
      setCommentRequestError(
        findCommentRequestErrorMessage(
          error,
          "Unable to add your comment right now. Please try again.",
          "You are not authorized to add comments. Please sign in again.",
        ),
      );
    } finally {
      setIsSubmittingComment(false);
    }
  }

  // Starts inline editing for a single comment at a time.
  function handleStartEditingComment(comment: Comment) {
    setEditingCommentId(comment.id);
    setEditingDraft(comment.body);
    setEditingDraftError(null);
    setCommentRequestError(null);
  }

  // Keeps the inline editor value in sync and clears stale errors.
  function handleEditingDraftChange(nextValue: string) {
    setEditingDraft(nextValue);
    setEditingDraftError(null);
    setCommentRequestError(null);
  }

  // Saves the inline edit against the configured comment endpoint.
  async function handleSaveEditedComment(
    event: FormEvent<HTMLFormElement>,
    commentId: number,
  ) {
    event.preventDefault();

    const validationError = validateCommentContent(editingDraft);

    if (validationError) {
      setEditingDraftError(validationError);
      return;
    }

    setEditingDraftError(null);
    setCommentRequestError(null);
    setIsSavingComment(true);

    try {
      const response = await commentAPI.update(postId, commentId, {
        body: editingDraft.trim(),
      });

      setComments((previousComments) =>
        previousComments.map((comment) =>
          comment.id === commentId ? response.data : comment,
        ),
      );
      setEditingCommentId(null);
      setEditingDraft("");
      showToast({
        variant: "success",
        message: "Comment updated successfully",
      });
    } catch (error) {
      setCommentRequestError(
        findCommentRequestErrorMessage(
          error,
          "Unable to update this comment right now. Please try again.",
          "You are not authorized to edit this comment. Please sign in again.",
          "This comment could not be found anymore.",
        ),
      );
    } finally {
      setIsSavingComment(false);
    }
  }

  // Opens the confirmation prompt for the selected comment.
  function handleOpenDeleteCommentModal(comment: Comment) {
    setCommentBeingDeleted(comment);
    setCommentRequestError(null);
  }

  // Closes the delete prompt when no request is in flight.
  function handleCloseDeleteCommentModal() {
    if (isDeletingComment) {
      return;
    }

    setCommentBeingDeleted(null);
  }

  // Removes the selected comment after the delete endpoint succeeds.
  async function handleDeleteCommentConfirm() {
    if (!commentBeingDeleted) {
      return;
    }

    setCommentRequestError(null);
    setIsDeletingComment(true);

    try {
      await commentAPI.delete(postId, commentBeingDeleted.id);
      setComments((previousComments) =>
        previousComments.filter((comment) => comment.id !== commentBeingDeleted.id),
      );

      if (editingCommentId === commentBeingDeleted.id) {
        setEditingCommentId(null);
        setEditingDraft("");
        setEditingDraftError(null);
      }

      setCommentBeingDeleted(null);
      showToast({
        variant: "success",
        message: "Comment deleted successfully",
      });
    } catch (error) {
      setCommentRequestError(
        findCommentRequestErrorMessage(
          error,
          "Unable to delete this comment right now. Please try again.",
          "You are not authorized to delete this comment. Please sign in again.",
          "This comment could not be found anymore.",
        ),
      );
    } finally {
      setIsDeletingComment(false);
    }
  }

  return (
    <section className={commentsSectionClassName} aria-label="Comments">
      {isAuthenticated ? (
        <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
          <label htmlFor={commentInputId} className={styles.srOnly}>
            Share your thoughts
          </label>
          <textarea
            id={commentInputId}
            className={
              commentDraftError
                ? `${styles.commentTextarea} ${styles.textareaError}`
                : styles.commentTextarea
            }
            placeholder="Share your thoughts..."
            value={commentDraft}
            onChange={(event) => handleCommentDraftChange(event.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
          />
          <div className={styles.formMeta}>
            <div className={styles.assistRow}>
              {commentDraftError ? (
                <p className={styles.fieldError} role="alert">
                  {commentDraftError}
                </p>
              ) : (
                <span />
              )}
              <p className={styles.characterCount}>
                {commentDraft.length}/{MAX_COMMENT_LENGTH}
              </p>
            </div>
            {commentRequestError && (
              <p className={styles.requestError} role="alert">
                {commentRequestError}
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            className={styles.commentButton}
            disabled={isSubmittingComment}
          >
            {isSubmittingComment ? "Adding comment..." : "Add comment"}
          </Button>
        </form>
      ) : (
        <p className={styles.guestPrompt}>Log in to join the discussion</p>
      )}

      <div className={styles.commentsBlock}>
        <h2 className={styles.commentsHeading}>Comments ({comments.length})</h2>

        {isLoadingComments && (
          <p className={styles.statusMessage} role="status" aria-live="polite">
            Loading comments...
          </p>
        )}

        {!isLoadingComments && commentsErrorMessage && (
          <div className={styles.retryState}>
            <p className={styles.errorMessage} role="alert">
              {commentsErrorMessage}
            </p>
            <Button
              variant="secondary"
              className={styles.retryButton}
              onClick={() => setCommentsReloadKey((currentKey) => currentKey + 1)}
            >
              Retry loading comments
            </Button>
          </div>
        )}

        {!isLoadingComments &&
          !commentsErrorMessage &&
          !commentRequestError &&
          comments.length === 0 && (
            <div className={styles.emptyState}>
              <EmptyPostsIcon className={styles.emptyStateIcon} />
              <p className={styles.emptyStateLabel}>No Comments yet</p>
            </div>
          )}

        {!isLoadingComments && !commentsErrorMessage && commentRequestError && (
          <p className={styles.requestError} role="alert">
            {commentRequestError}
          </p>
        )}

        {!isLoadingComments && !commentsErrorMessage && comments.length > 0 && (
          <ul className={styles.commentsList}>
            {comments.map((comment) => {
              const isEditingComment = editingCommentId === comment.id;
              const canManageCurrentComment = canManageComment(
                comment,
                user?.name,
                user?.email,
                user?.role,
              );

              return (
                <li key={comment.id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentIdentity}>
                      <div className={styles.commentAvatar}>
                        {getCommentAuthorInitials(comment.authorName)}
                      </div>
                      <div className={styles.commentMeta}>
                        <p className={styles.commentAuthor}>{comment.authorName}</p>
                        <p className={styles.commentTime}>
                          {formatCommentTimestamp(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {canManageCurrentComment && !isEditingComment && (
                    <div className={styles.commentActions}>
                      <button
                        type="button"
                        className={styles.commentActionButton}
                        aria-label={`Edit comment by ${comment.authorName}`}
                        onClick={() => handleStartEditingComment(comment)}
                        disabled={isSavingComment || isDeletingComment}
                      >
                        <PenIcon className={styles.commentActionIcon} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.commentActionButton} ${styles.deleteActionButton}`}
                        aria-label={`Delete comment by ${comment.authorName}`}
                        onClick={() => handleOpenDeleteCommentModal(comment)}
                        disabled={isSavingComment || isDeletingComment}
                      >
                        <Trash2Icon className={styles.commentActionIcon} />
                      </button>
                    </div>
                  )}

                  {isEditingComment ? (
                    <form
                      className={styles.editForm}
                      onSubmit={(event) => handleSaveEditedComment(event, comment.id)}
                    >
                      <label htmlFor={`edit-comment-${comment.id}`} className={styles.srOnly}>
                        Edit your comment
                      </label>
                      <textarea
                        id={`edit-comment-${comment.id}`}
                        className={
                          editingDraftError
                            ? `${styles.editTextarea} ${styles.textareaError}`
                            : styles.editTextarea
                        }
                        value={editingDraft}
                        onChange={(event) => handleEditingDraftChange(event.target.value)}
                        maxLength={MAX_COMMENT_LENGTH}
                      />
                      {editingDraftError && (
                        <p className={styles.fieldError} role="alert">
                          {editingDraftError}
                        </p>
                      )}
                      <Button
                        type="submit"
                        variant="primary"
                        className={styles.editSaveButton}
                        disabled={isSavingComment}
                      >
                        {isSavingComment ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  ) : (
                    <p className={styles.commentBody}>{comment.body}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <DeletePostModal
        isOpen={commentBeingDeleted !== null}
        isDeleting={isDeletingComment}
        title="Delete Comment"
        description="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
        onClose={handleCloseDeleteCommentModal}
        onConfirm={handleDeleteCommentConfirm}
      />
    </section>
  );
}
