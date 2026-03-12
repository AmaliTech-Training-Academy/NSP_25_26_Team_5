import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import styles from "./CreatePostModal.module.css";
import type {
  CreatePostFormErrors,
  CreatePostFormValues,
  CreatePostModalProps,
} from "./CreatePostModal.types";
import {
  findCreatePostErrorMessage,
  findCreatePostCategoryLabel,
  joinCreatePostModalClassName,
  TITLE_MAX_LENGTH,
  TITLE_WARNING_THRESHOLD,
  validateCreatePostForm,
} from "./CreatePostModal.utils";
import CloseIcon from "../../../../assets/Icons/CloseIcon";
import Input from "../../../../components/ui/Input/Input";
import Button from "../../../../components/ui/Button/Button";
import ChevronUpIcon from "../../../../assets/Icons/ChevronUpIcon";
import ChevronDownIcon from "../../../../assets/Icons/ChevronDownIcon";
import HouseIcon from "../../../../assets/Icons/HouseIcon";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs/Breadcrumbs";
import PostImageField from "../PostImageField";
import { validatePostImageFile } from "../../utils/post.utils";

// Renders the create-post modal and submits a new post payload to the parent.
export default function CreatePostModal({
  className,
  categoryOptions,
  isLoadingCategories = false,
  categoriesErrorMessage = null,
  isOpen,
  onClose,
  onCreatePost,
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<CreatePostFormErrors>({});
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categorySectionRef = useRef<HTMLDivElement | null>(null);
  const bodyInputId = useId();
  const imageInputId = useId();

  const overlayClassName = joinCreatePostModalClassName(styles.overlay, className);
  const selectedCategoryLabel =
    selectedCategoryId === null
      ? ""
      : findCreatePostCategoryLabel(categoryOptions, selectedCategoryId);
  const titleLength = title.length;
  const isTitleNearLimit = titleLength >= TITLE_WARNING_THRESHOLD;
  const canSubmit =
    !isSubmitting &&
    !isLoadingCategories &&
    !categoriesErrorMessage &&
    title.trim().length > 0 &&
    title.trim().length <= TITLE_MAX_LENGTH &&
    body.trim().length > 0 &&
    selectedCategoryId !== null &&
    !formErrors.image;

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

  useEffect(() => {
    if (!selectedImageFile) {
      setImagePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImageFile);
    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImageFile]);

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
  }, [isOpen, isSubmitting, onClose]);

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
    setBody("");
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setSelectedCategoryId(null);
    setIsCategoryMenuOpen(false);
    setFormErrors({});
    setSubmitErrorMessage(null);
    setIsSubmitting(false);
  }

  // Closes the modal when the desktop backdrop is clicked.
  function handleBackdropMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }

  // Applies the selected category option to the form and closes the dropdown.
  function handleCategorySelect(categoryId: number) {
    setSelectedCategoryId(categoryId);
    setIsCategoryMenuOpen(false);
    setFormErrors((previousErrors) => ({ ...previousErrors, category: undefined }));
    setSubmitErrorMessage(null);
  }

  function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!nextFile) {
      return;
    }

    const imageErrorMessage = validatePostImageFile(nextFile);

    if (imageErrorMessage) {
      setSelectedImageFile(null);
      setFormErrors((previousErrors) => ({
        ...previousErrors,
        image: imageErrorMessage,
      }));
      setSubmitErrorMessage(null);
      return;
    }

    setSelectedImageFile(nextFile);
    setFormErrors((previousErrors) => ({
      ...previousErrors,
      image: undefined,
    }));
    setSubmitErrorMessage(null);
  }

  function handleClearSelectedImage() {
    setSelectedImageFile(null);
    setFormErrors((previousErrors) => ({
      ...previousErrors,
      image: undefined,
    }));
    setSubmitErrorMessage(null);
  }

  // Closes the modal and clears temporary input state.
  function handleCancel(forceClose = false) {
    if (isSubmitting && !forceClose) {
      return;
    }

    resetFormState();
    onClose();
  }

  // Emits the new post payload and closes the modal.
  async function handleCreatePostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateCreatePostForm(title, body, selectedCategoryId);
    setFormErrors(nextErrors);

    if (
      Object.keys(nextErrors).length > 0 ||
      formErrors.image ||
      selectedCategoryId === null ||
      !onCreatePost
    ) {
      return;
    }

    setSubmitErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onCreatePost({
        title: title.trim(),
        body: body.trim(),
        categoryId: selectedCategoryId,
        imageFile: selectedImageFile,
      });
      handleCancel(true);
    } catch (error) {
      setSubmitErrorMessage(findCreatePostErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => handleCancel()}
            disabled={isSubmitting}
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
            maxLength={TITLE_MAX_LENGTH}
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
          <p
            className={joinCreatePostModalClassName(
              styles.titleMeta,
              isTitleNearLimit ? styles.titleMetaWarning : undefined,
            )}
          >
            {titleLength}/{TITLE_MAX_LENGTH} characters
            {isTitleNearLimit ? " - approaching the limit" : ""}
          </p>
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
              disabled={isLoadingCategories || Boolean(categoriesErrorMessage)}
              hasError={Boolean(formErrors.category)}
              onInputContainerClick={() => {
                if (
                  isSubmitting ||
                  isLoadingCategories ||
                  Boolean(categoriesErrorMessage) ||
                  categoryOptions.length === 0
                ) {
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
                {categoryOptions.map((categoryOption) => (
                  <button
                    key={categoryOption.categoryId}
                    type="button"
                    className={joinCreatePostModalClassName(
                      styles.categoryOption,
                      selectedCategoryId === categoryOption.categoryId
                        ? styles.categoryOptionActive
                        : undefined,
                    )}
                    onClick={() => handleCategorySelect(categoryOption.categoryId)}
                    disabled={isSubmitting}
                  >
                    {categoryOption.label}
                  </button>
                ))}
              </div>
            )}
            {categoriesErrorMessage && (
              <p className={styles.fieldError} role="alert">
                {categoriesErrorMessage}
              </p>
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
              className={joinCreatePostModalClassName(
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

          <PostImageField
            inputId={imageInputId}
            isDisabled={isSubmitting}
            previewUrl={imagePreviewUrl}
            statusText={
              selectedImageFile ? `Selected image: ${selectedImageFile.name}` : null
            }
            errorMessage={formErrors.image}
            onFileChange={handleImageFileChange}
            onClearSelection={selectedImageFile ? handleClearSelectedImage : undefined}
          />

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
              {isSubmitting ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
