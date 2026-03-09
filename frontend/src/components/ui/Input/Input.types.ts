import type {
  InputHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

export type InputVariant = "default" | "select";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  variant?: InputVariant;
  hasError?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  inputContainerClassName?: string;
  inputClassName?: string;
  onInputContainerClick?: MouseEventHandler<HTMLDivElement>;
}
