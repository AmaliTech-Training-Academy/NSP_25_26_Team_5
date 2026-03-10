import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import CloseIcon from "../../../../assets/Icons/CloseIcon";
import ChevronDownIcon from "../../../../assets/Icons/ChevronDownIcon";
import ChevronUpIcon from "../../../../assets/Icons/ChevronUpIcon";
import Button from "../../../../components/ui/Button/Button";
import { BadgeType } from "../../../../components/ui/Button/Button.types";
import Input from "../../../../components/ui/Input/Input";
import styles from "./EditPostModal.module.css";
import type {
  EditPostFormErrors,
  EditPostFormValues,
  EditPostModalProps,
} from "./EditPostModal.types";
import {
  EDIT_POST_CATEGORIES,
  findEditPostCategoryId,
  findEditPostCategoryLabel,
  findEditPostErrorMessage,
  joinEditPostModalClassName,
  validateEditPostForm,
} from "./EditPostModal.utils";

// Renders an edit-post modal prefilled from the selected post.
export default function EditPostModal({
  className,
  isOpen,
  post,
  onClose,
  onEditPost,
}: EditPostModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BadgeType | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<EditPostFormErrors>({});
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categorySectionRef = useRef<HTMLDivElement | null>(null);
  const bodyInputId = useId();

  const overlayClassName = joinEditPostModalClassName(styles.overlay, className);
  const selectedCategoryLabel = selectedCategory
    ? findEditPostCategoryLabel(selectedCategory)
    : "";
  const canSubmit =
    !isSubmitting &&
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    selectedCategory !== null;

  useEffect(() => {
    if (!isOpen || !post) {
      return;
    }

    setTitle(post.title);
    setBody(post.content);
    setSelectedCategory(post.badgeType ?? null);
    setIsCategoryMenuOpen(false);
    setFormErrors({});
    setSubmitErrorMessage(null);
    setIsSubmitting(false);
  }, [isOpen, post]);

  // Locks body scrolling while the modal is active.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Closes the modal when Escape is pressed.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscapeKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleCancel();
      }
    }

    document.addEventListener("keydown", handleEscapeKeyDown);

    return () => {
      document.removeEventListener("keydown", handleEscapeKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  // Closes category dropdown when clicking outside.
  useEffect(() => {
    if (!isOpen || !isCategoryMenuOpen) {
      return;
    }

    function handleDocumentMouseDown(event: globalThis.MouseEvent) {
      if (!categorySectionRef.current) {
        return;
      }

      if (!categorySectionRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [isCategoryMenuOpen, isOpen]);

  // Closes the modal on backdrop click.
  function handleBackdropMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }

  // Applies selected category option and closes dropdown.
  function handleCategorySelect(category: BadgeType) {
    setSelectedCategory(category);
    setIsCategoryMenuOpen(false);
    setFormErrors((previousErrors) => ({ ...previousErrors, category: undefined }));
    setSubmitErrorMessage(null);
  }

  // Resets transient form state and closes modal.
  function handleCancel(forceClose = false) {
    if (isSubmitting && !forceClose) {
      return;
    }

    setIsCategoryMenuOpen(false);
    setFormErrors({});
    setSubmitErrorMessage(null);
    setIsSubmitting(false);
    onClose();
  }

  // Submits an update payload to the parent edit handler.
  async function handleEditPostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!post || !onEditPost) {
      return;
    }

    const nextErrors = validateEditPostForm(title, body, selectedCategory);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !selectedCategory) {
      return;
    }

    const payload: EditPostFormValues = {
      postId: post.id,
      title: title.trim(),
      body: body.trim(),
      category: selectedCategory,
      categoryId: findEditPostCategoryId(selectedCategory),
    };

    setSubmitErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onEditPost(payload);
      handleCancel(true);
    } catch (error) {
      setSubmitErrorMessage(findEditPostErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen || !post) {
    return null;
  }

  return (
    <div className={overlayClassName} role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="edit-post-title">
        <div className={styles.modalHeader}>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close edit post modal"
            onClick={() => handleCancel()}
            disabled={isSubmitting}
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleEditPostSubmit}>
          <h2 id="edit-post-title" className={styles.title}>
            Edit Post
          </h2>

          <Input
            label="Post Title"
            placeholder="Enter a clear, descriptive title"
            value={title}
            autoComplete="off"
            hasError={Boolean(formErrors.title)}
            onChange={(event) => {
              setTitle(event.target.value);
              setFormErrors((previousErrors) => ({
                ...previousErrors,
                title: undefined,
              }));
              setSubmitErrorMessage(null);
            }}
          />
          {formErrors.title && (
            <p className={styles.fieldError} role="alert">
              {formErrors.title}
            </p>
          )}

          <div className={styles.categorySection} ref={categorySectionRef}>
            <Input
              label="Category"
              variant="select"
              placeholder="Select"
              value={selectedCategoryLabel}
              readOnly
              hasError={Boolean(formErrors.category)}
              onInputContainerClick={() => {
                if (isSubmitting) {
                  return;
                }

                setIsCategoryMenuOpen((isCurrentlyOpen) => !isCurrentlyOpen);
              }}
              rightIcon={
                isCategoryMenuOpen ? (
                  <ChevronUpIcon className={styles.selectIcon} />
                ) : (
                  <ChevronDownIcon className={styles.selectIcon} />
                )
              }
              inputClassName={styles.categoryInput}
            />

            {isCategoryMenuOpen && (
              <div className={styles.categoryMenu} role="listbox" aria-label="Post category options">
                {EDIT_POST_CATEGORIES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={joinEditPostModalClassName(
                      styles.categoryOption,
                      selectedCategory === option.value
                        ? styles.categoryOptionActive
                        : undefined,
                    )}
                    onClick={() => handleCategorySelect(option.value)}
                    disabled={isSubmitting}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            {formErrors.category && (
              <p className={styles.fieldError} role="alert">
                {formErrors.category}
              </p>
            )}
          </div>

          <div className={styles.bodyField}>
            <label className={styles.fieldLabel} htmlFor={bodyInputId}>
              Post Body
            </label>
            <textarea
              id={bodyInputId}
              className={joinEditPostModalClassName(
                styles.textarea,
                formErrors.body ? styles.textareaError : undefined,
              )}
              placeholder="Share the details of your post..."
              value={body}
              aria-invalid={Boolean(formErrors.body)}
              onChange={(event) => {
                setBody(event.target.value);
                setFormErrors((previousErrors) => ({
                  ...previousErrors,
                  body: undefined,
                }));
                setSubmitErrorMessage(null);
              }}
            />
            {formErrors.body && (
              <p className={styles.fieldError} role="alert">
                {formErrors.body}
              </p>
            )}
          </div>

          {submitErrorMessage && (
            <p className={styles.submitError} role="alert">
              {submitErrorMessage}
            </p>
          )}

          <div className={styles.actionRow}>
            <Button
              type="button"
              variant="secondary"
              className={styles.cancelButton}
              onClick={() => handleCancel()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              className={styles.submitButton}
              disabled={!canSubmit}
            >
              Update Post
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
