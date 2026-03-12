import { useState } from "react";
import type { PostCardProps } from "./PostCard.types";
import styles from "./PostCard.module.css";
import { joinButtonClassName } from "../../../../components/ui/Button/Button.utils";
import Button from "../../../../components/ui/Button/Button";
import MessageCircleMoreIcon from "../../../../assets/Icons/MessageCircleMoreIcon";
import ClockIcon from "../../../../assets/Icons/ClockIcon";
import PenIcon from "../../../../assets/Icons/PenIcon";
import Trash2Icon from "../../../../assets/Icons/Trash2Icon";
import ImageIcon from "../../../../assets/Icons/ImageIcon";
import PostImageModal from "../PostImageModal";

export default function PostCard({
  post,
  className,
  canManage = false,
  onEdit,
  onDelete,
}: PostCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const badgeClassName = styles.badge;
  const containerClassName = joinButtonClassName(styles.postCard, className);

  return (
    <>
      <article className={containerClassName}>
        <header className={styles.header}>
          <h2 className={styles.title}>{post.title}</h2>

          <div className={styles.headerMeta}>
            <Button
              variant="badge"
              badgeType={post.badgeType}
              className={badgeClassName}
              disabled
            >
              {post.badgeLabel}
            </Button>

            {post.imageUrl && (
              <button
                type="button"
                className={styles.imageButton}
                data-prevent-post-navigation="true"
                aria-label={`View image for ${post.title}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsImageModalOpen(true);
                }}
              >
                <ImageIcon className={styles.imageIcon} />
              </button>
            )}
          </div>
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

          <div className={styles.footerRight}>
            {canManage && (
              <div className={styles.postActions} aria-label="Post actions">
                <button
                  type="button"
                  className={styles.postActionButton}
                  data-prevent-post-navigation="true"
                  aria-label={`Edit ${post.title}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onEdit?.(post.id);
                  }}
                >
                  <PenIcon className={styles.editIcon} />
                </button>

                <button
                  type="button"
                  className={styles.postActionButton}
                  data-prevent-post-navigation="true"
                  aria-label={`Delete ${post.title}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onDelete?.(post.id);
                  }}
                >
                  <Trash2Icon className={styles.deleteIcon} />
                </button>
              </div>
            )}

            <div className={styles.comments} aria-label={`${post.commentsCount} comments`}>
              <MessageCircleMoreIcon className={styles.icon} />
              <p className={styles.commentCount}>{post.commentsCount}</p>
            </div>
          </div>
        </footer>
      </article>

      <PostImageModal
        authorName={post.writerName}
        description={post.content}
        imageUrl={post.imageUrl ?? null}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        time={post.time}
        title={post.title}
      />
    </>
  );
}
