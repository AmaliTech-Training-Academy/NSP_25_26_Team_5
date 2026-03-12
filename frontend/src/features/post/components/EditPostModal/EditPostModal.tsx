import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import CloseIcon from "../../../../assets/Icons/CloseIcon";
import ChevronDownIcon from "../../../../assets/Icons/ChevronDownIcon";
import ChevronUpIcon from "../../../../assets/Icons/ChevronUpIcon";
import HouseIcon from "../../../../assets/Icons/HouseIcon";
import Breadcrumbs from "../../../../components/shared/Breadcrumbs/Breadcrumbs";
import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import styles from "./EditPostModal.module.css";
import { imageAPI } from "../../api/image.api";
import PostImageField from "../PostImageField";
import type {
  EditPostFormErrors,
  EditPostFormValues,
  EditPostModalProps,
} from "./EditPostModal.types";
import {
  findEditPostCategoryLabel,
  findEditPostErrorMessage,
  joinEditPostModalClassName,
  validateEditPostForm,
} from "./EditPostModal.utils";
import {
  findImageUploadErrorMessage,
  validatePostImageFile,
} from "../../utils/post.utils";

// Renders an edit-post modal prefilled from the selected post.
export default function EditPostModal({
  className,
  categoryOptions,
  isLoadingCategories = false,
  categoriesErrorMessage = null,
  isOpen,
  post,
  onClose,
  onEditPost,
}: EditPostModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<EditPostFormErrors>({});
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const categorySectionRef = useRef<HTMLDivElement | null>(null);
  const bodyInputId = useId();
  const imageInputId = useId();

  const overlayClassName = joinEditPostModalClassName(styles.overlay, className);
  const selectedCategoryLabel =
    selectedCategoryId === null
      ? post?.badgeLabel ?? ""
      : findEditPostCategoryLabel(categoryOptions, selectedCategoryId);
  const resolvedPreviewUrl = imagePreviewUrl ?? existingImageUrl;
  const canSubmit =
    !isSubmitting &&
    !isUploadingImage &&
    !isLoadingCategories &&
    !categoriesErrorMessage &&
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    selectedCategoryId !== null &&
    !formErrors.image;

  useEffect(() => {
    if (!isOpen || !post) {
      return;
    }

    const matchedCategory = categoryOptions.find(
      (categoryOption) => categoryOption.backendName === post.categoryName,
    );

    setTitle(post.title);
    setBody(post.content);
    setExistingImageUrl(post.imageUrl ?? null);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setSelectedCategoryId(matchedCategory?.categoryId ?? null);
    setIsCategoryMenuOpen(false);
    setFormErrors({});
    setSubmitErrorMessage(null);
    setIsSubmitting(false);
    setIsUploadingImage(false);
  }, [categoryOptions, isOpen, post]);

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

  // Resets transient form state and closes modal.
  function handleCancel(forceClose = false) {
    if ((isSubmitting || isUploadingImage) && !forceClose) {
      return;
    }

    setIsCategoryMenuOpen(false);
    setFormErrors({});
    setSubmitErrorMessage(null);
    setIsSubmitting(false);
    onClose();
  }

  async function uploadSelectedImage(): Promise<string | null> {
    if (!selectedImageFile) {
      return existingImageUrl;
    }

    setIsUploadingImage(true);

    try {
      const response = await imageAPI.upload(selectedImageFile);
      const uploadedImageUrl = response.data.imageUrl?.trim();

      if (!uploadedImageUrl) {
        throw new Error("Image upload completed without a usable image URL.");
      }

      return uploadedImageUrl;
    } catch (error) {
      throw new Error(findImageUploadErrorMessage(error));
    } finally {
      setIsUploadingImage(false);
    }
  }

  // Submits an update payload to the parent edit handler.
  async function handleEditPostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!post || !onEditPost) {
      return;
    }

    const nextErrors = validateEditPostForm(title, body, selectedCategoryId);
    setFormErrors(nextErrors);

    if (
      Object.keys(nextErrors).length > 0 ||
      formErrors.image ||
      selectedCategoryId === null
    ) {
      return;
    }

    const payload: EditPostFormValues = {
      postId: post.id,
      title: title.trim(),
      body: body.trim(),
      categoryId: selectedCategoryId,
      imageUrl: existingImageUrl,
    };

    setSubmitErrorMessage(null);
    setIsSubmitting(true);

    try {
      const imageUrl = await uploadSelectedImage();
      await onEditPost({
        ...payload,
        imageUrl,
      });
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

  const breadcrumbItems = [
    {
      id: "home",
      label: "Home",
      icon: <HouseIcon />,
      onClick: handleCancel,
    },
    {
      id: "edit-post",
      label: "Edit Post",
    },
  ];

  return (
    <div className={overlayClassName} role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="edit-post-title">
        <div className={styles.modalHeader}>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close edit post modal"
            onClick={() => handleCancel()}
            disabled={isSubmitting || isUploadingImage}
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <Breadcrumbs className={styles.mobileBreadcrumbs} items={breadcrumbItems} />

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
                    className={joinEditPostModalClassName(
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

          <PostImageField
            inputId={imageInputId}
            isDisabled={isSubmitting || isUploadingImage}
            isUploading={isUploadingImage}
            previewUrl={resolvedPreviewUrl}
            statusText={
              selectedImageFile
                ? `Selected image: ${selectedImageFile.name}`
                : existingImageUrl
                  ? "Current image attached."
                  : null
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
              disabled={isSubmitting || isUploadingImage}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              className={styles.submitButton}
              disabled={!canSubmit}
            >
              {isUploadingImage
                ? "Uploading image..."
                : isSubmitting
                  ? "Updating..."
                  : "Update Post"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
