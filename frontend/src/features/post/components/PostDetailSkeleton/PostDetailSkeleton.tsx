import Skeleton from "../../../../components/ui/Skeleton/Skeleton";
import styles from "./PostDetailSkeleton.module.css";

const PLACEHOLDER_COMMENT_COUNT = 3;

export default function PostDetailSkeleton() {
  return (
    <div
      className={styles.detailSkeleton}
      role="status"
      aria-live="polite"
      aria-label="Loading post details"
    >
      <section className={styles.postSection}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <Skeleton className={styles.title} />

            <div className={styles.titleMeta}>
              <Skeleton className={styles.badge} />
              <Skeleton className={styles.imageButton} />
            </div>
          </div>

          <Skeleton className={styles.bodyLong} />
          <Skeleton className={styles.bodyLong} />
          <Skeleton className={styles.bodyShort} />

          <div className={styles.metaRow}>
            <Skeleton className={styles.author} />
            <Skeleton className={styles.time} />
          </div>
        </header>

        <div className={styles.divider} aria-hidden="true" />
      </section>

      <section className={styles.commentsSection} aria-hidden="true">
        <Skeleton className={styles.commentsHeading} />
        <Skeleton className={styles.composer} />

        <ul className={styles.commentsList}>
          {Array.from({ length: PLACEHOLDER_COMMENT_COUNT }, (_, index) => (
            <li key={index}>
              <Skeleton className={styles.commentItem} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
