import type { ChangeEventHandler } from "react";

export interface PostImageFieldProps {
  inputId: string;
  isDisabled?: boolean;
  isUploading?: boolean;
  previewFile?: File | null;
  previewUrl?: string | null;
  statusText?: string | null;
  errorMessage?: string;
  onFileChange: ChangeEventHandler<HTMLInputElement>;
  onClearSelection?: () => void;
}
