import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import styles from "./CreatePostModal.module.css";
import type {
  CreatePostFormValues,
  CreatePostModalProps,
} from "./CreatePostModal.types";
import {
  CREATE_POST_CATEGORIES,
  findCreatePostCategoryLabel,
  joinCreatePostModalClassName,
} from "./CreatePostModal.utils";
import { BadgeType } from "../../../../components/ui/Button/Button.types";
import CloseIcon from "../../../../assets/Icons/CloseIcon";
import Input from "../../../../components/ui/Input/Input";
import Button from "../../../../components/ui/Button/Button";
import ChevronUpIcon from "../../../../assets/Icons/ChevronUpIcon";
import ChevronDownIcon from "../../../../assets/Icons/ChevronDownIcon";

// Renders the create-post modal and submits a new post payload to the parent.
export default function CreatePostModal({
  className,
  isOpen,
  onClose,
  onCreatePost,
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BadgeType | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categorySectionRef = useRef<HTMLDivElement | null>(null);

  const overlayClassName = joinCreatePostModalClassName(styles.overlay, className);
  const selectedCategoryLabel = selectedCategory ? findCreatePostCategoryLabel(selectedCategory) : "";
  const canSubmit = title.trim().length > 0 && details.trim().length > 0 && selectedCategory !== null;

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

  // Supports keyboard closing with Escape.
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
  }, [isOpen, onClose]);

  // Closes the category menu when clicking outside of its trigger/list area.
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

  // Resets all form fields and closes the category menu.
  function resetFormState() {
    setTitle("");
    setDetails("");
    setSelectedCategory(null);
    setIsCategoryMenuOpen(false);
  }

  // Closes the modal when the desktop backdrop is clicked.
  function handleBackdropMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }

  // Applies the selected category option to the form and closes the dropdown.
  function handleCategorySelect(category: BadgeType) {
    setSelectedCategory(category);
    setIsCategoryMenuOpen(false);
  }

  // Closes the modal and clears temporary input state.
  function handleCancel() {
    resetFormState();
    onClose();
  }

  // Emits the new post payload and closes the modal.
  function handleCreatePostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCategory || !canSubmit) {
      return;
    }

    const payload: CreatePostFormValues = {
      title: title.trim(),
      details: details.trim(),
      category: selectedCategory,
      categoryLabel: findCreatePostCategoryLabel(selectedCategory),
    };

    onCreatePost?.(payload);
    handleCancel();
  }

  if (!isOpen) {
    return null;
  }

  const breadcrumbItems = [
    {
      id: "home",
      label: "Home",
      icon: <HouseIcon />,
      onClick: handleCancel,
    },
    {
      id: "create-post",
      label: "Create Post",
    },
  ];

  return (
    <div className={overlayClassName} role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="create-post-title">
        <div className={styles.modalHeader}>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close create post modal"
            onClick={handleCancel}
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <Breadcrumbs className={styles.mobileBreadcrumbs} items={breadcrumbItems} />

        <form className={styles.form} onSubmit={handleCreatePostSubmit}>
          <h2 id="create-post-title" className={styles.title}>
            Create New Post
          </h2>

          <Input
            label="Post Title"
            placeholder="Enter a clear, descriptive title"
            value={title}
            autoComplete="off"
            onChange={(event) => setTitle(event.target.value)}
          />

          <div className={styles.categorySection} ref={categorySectionRef}>
            <Input
              label="Category"
              variant="select"
              placeholder="Select"
              value={selectedCategoryLabel}
              readOnly
              onInputContainerClick={() =>
                setIsCategoryMenuOpen((isCurrentlyOpen) => !isCurrentlyOpen)
              }
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
                {CREATE_POST_CATEGORIES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={joinCreatePostModalClassName(
                      styles.categoryOption,
                      selectedCategory === option.value
                        ? styles.categoryOptionActive
                        : undefined,
                    )}
                    onClick={() => handleCategorySelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            className={styles.textarea}
            placeholder="Share the details of your post..."
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />

          <div className={styles.actionRow}>
            <Button
              type="button"
              variant="secondary"
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              className={styles.submitButton}
              disabled={!canSubmit}
            >
              Create Post
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
