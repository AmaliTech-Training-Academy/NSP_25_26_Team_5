import type { EmptyPostsProps } from "./EmptyPosts.types";
import { joinClassName } from "./EmptyPosts.utils";
import styles from "./EmptyPosts.module.css";
import EmptyPostsIcon from "../Icons/EmptyPostsIcon";

export default function EmptyPosts({
  className,
  message = "No posts have been made yet",
}: EmptyPostsProps) {
  const containerClassName = joinClassName(styles.emptyPosts, className);

  return (
    <div className={containerClassName}>
      <div className={styles.illustration} aria-hidden="true">
        <EmptyPostsIcon />
      </div>

      <p className={styles.message}>{message}</p>
    </div>
  );
}
