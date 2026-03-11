import { useId } from "react";
import type { InputVariant } from "./Input.types";
import styles from "./Input.module.css";


// move this to a hooks file
export function useInputId(id?: string): string {
  const generatedId = "input-" + useId();
  return id ?? generatedId;
}

export function factoryInputVariantClass(variant: InputVariant): {
  inputContainerClass: string;
  inputClass: string;
} {
  switch (variant) {
    case "select":
      return {
        inputContainerClass: styles.inputContainerSelect,
        inputClass: styles.inputElementSelect,
      };
    case "default":
    default:
      return {
        inputContainerClass: "",
        inputClass: "",
      };
  }
}

export function joinInputClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
