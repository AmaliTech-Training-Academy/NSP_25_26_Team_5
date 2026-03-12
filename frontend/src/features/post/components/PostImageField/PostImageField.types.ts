import type { ChangeEventHandler } from "react";

export interface PostImageFieldProps {
  inputId: string;
  isDisabled?: boolean;
  isUploading?: boolean;
  previewUrl?: string | null;
  statusText?: string | null;
  errorMessage?: string;
  onFileChange: ChangeEventHandler<HTMLInputElement>;
  onClearSelection?: () => void;
}
