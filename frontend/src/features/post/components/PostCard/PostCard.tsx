
import type { PostCardProps } from "./PostCard.types";
import styles from "./PostCard.module.css";
import { joinButtonClassName } from "../../../../components/ui/Button/Button.utils";
import Button from "../../../../components/ui/Button/Button";
import MessageCircleMoreIcon from "../../../../assets/Icons/MessageCircleMoreIcon";
import ClockIcon from "../../../../assets/Icons/ClockIcon";


export default function PostCard({ post, className }: PostCardProps) {
  const badgeClassName = styles.badge;
  const containerClassName = joinButtonClassName(styles.postCard, className);

  return (
    <article className={containerClassName}>
      <header className={styles.header}>
        <h2 className={styles.title}>{post.title}</h2>
        <Button
          variant="badge"
          badgeType={post.badgeType}
          className={badgeClassName}
          disabled
        >
          {post.badgeLabel}
        </Button>
      </header>

      <p className={styles.body}>{post.content}</p>

      <footer className={styles.footer}>
        <div className={styles.metaLeft}>
          <p className={styles.author}>{post.writerName}</p>
          <div className={styles.timeGroup}>
            <ClockIcon className={styles.icon} />
            <p className={styles.time}>{post.time}</p>
          </div>
        </div>

        <div className={styles.comments} aria-label={`${post.commentsCount} comments`}>
          <MessageCircleMoreIcon className={styles.icon} />
          <p className={styles.commentCount}>{post.commentsCount}</p>
        </div>
      </footer>
    </article>
  );
}
