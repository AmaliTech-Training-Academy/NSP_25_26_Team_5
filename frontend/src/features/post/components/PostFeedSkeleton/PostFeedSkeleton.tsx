import Skeleton from "../../../../components/ui/Skeleton/Skeleton";
import styles from "./PostFeedSkeleton.module.css";

const PLACEHOLDER_POST_COUNT = 3;

export default function PostFeedSkeleton() {
  return (
    <div
      className={styles.feedSkeleton}
      role="status"
      aria-live="polite"
      aria-label="Loading posts"
    >
      <ul className={styles.postList}>
        {Array.from({ length: PLACEHOLDER_POST_COUNT }, (_, index) => (
          <li key={index}>
            <article className={styles.postCard}>
              <div className={styles.topSection}>
                <div className={styles.contentBlock}>
                  <Skeleton className={styles.title} />
                  <Skeleton className={styles.bodyLong} />
                  <Skeleton className={styles.bodyShort} />
                </div>

                <div className={styles.metaColumn}>
                  <Skeleton className={styles.badge} />
                  <Skeleton className={styles.imageButton} />
                </div>
              </div>

              <footer className={styles.footer}>
                <div className={styles.metaLeft}>
                  <Skeleton className={styles.author} />
                  <Skeleton className={styles.time} />
                </div>

                <div className={styles.metaRight}>
                  <Skeleton className={styles.comments} />
                </div>
              </footer>
            </article>
          </li>
        ))}
      </ul>

      <Skeleton className={styles.pagination} />
    </div>
  );
}
