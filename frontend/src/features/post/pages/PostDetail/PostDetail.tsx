import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Button from "../../../../components/ui/Button/Button";
import { postAPI } from "../../api/api.post";
import type { Post } from "../../types/post.type";
import styles from "./PostDetail.module.css";

// Formats an ISO timestamp to a readable date/time string for the detail page.
function formatPostTimestamp(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return parsedDate.toLocaleString();
}

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

    async function loadPostDetails() {
      setIsLoadingPost(true);
      setPostErrorMessage(null);

      try {
        const response = await postAPI.getById(parsedPostId);

        if (isUnmounted) {
          return;
        }

        setPost(response.data);
      } catch {
        if (isUnmounted) {
          return;
        }

        setPost(null);
        setPostErrorMessage("Unable to load this post right now.");
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

  return (
    <main className={styles.postDetailPage}>
      <section className={styles.content}>
        <Button
          variant="secondary"
          className={styles.backButton}
          onClick={() => navigate("/")}
        >
          Back to community board
        </Button>

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
          <article className={styles.card}>
            <header className={styles.header}>
              <p className={styles.category}>{post.categoryName ?? "General"}</p>
              <h1 className={styles.title}>{post.title}</h1>
              <p className={styles.meta}>
                {post.authorName} ({post.authorEmail}) • {formatPostTimestamp(post.createdAt)}
              </p>
            </header>

            <p className={styles.body}>{post.content}</p>

            <footer className={styles.footer}>
              <p className={styles.commentCount}>{post.commentCount} comments</p>
            </footer>
          </article>
        )}
      </section>
    </main>
  );
}
