const POST_IMAGE_STORAGE_KEY = "community-board-post-images";

type StoredPostImages = Record<string, string>;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readStoredPostImages(): StoredPostImages {
  if (!canUseStorage()) {
    return {};
  }

  const raw = localStorage.getItem(POST_IMAGE_STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as StoredPostImages;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredPostImages(images: StoredPostImages): void {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(POST_IMAGE_STORAGE_KEY, JSON.stringify(images));
}

function normalizeImageUrl(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export const postImageStorage = {
  getImageUrl(postId: number | string): string | null {
    const normalizedImageUrl = normalizeImageUrl(
      readStoredPostImages()[String(postId)],
    );

    return normalizedImageUrl;
  },

  setImageUrl(postId: number | string, imageUrl: string): void {
    const normalizedImageUrl = normalizeImageUrl(imageUrl);

    if (!normalizedImageUrl) {
      return;
    }

    const images = readStoredPostImages();
    images[String(postId)] = normalizedImageUrl;
    writeStoredPostImages(images);
  },

  removeImage(postId: number | string): void {
    const images = readStoredPostImages();
    delete images[String(postId)];
    writeStoredPostImages(images);
  },
};

export function resolvePostImageUrl(
  postId: number | string,
  imageUrl?: string | null,
): string | null {
  return normalizeImageUrl(imageUrl) ?? postImageStorage.getImageUrl(postId);
}
