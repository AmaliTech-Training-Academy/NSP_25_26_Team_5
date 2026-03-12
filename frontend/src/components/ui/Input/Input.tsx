import type { InputProps } from "./Input.types";
import {
  factoryInputVariantClass,
  joinInputClassName,
  useInputId,
} from "./Input.utils";
import styles from "./Input.module.css";

export default function Input({
  label,
  variant = "default",
  hasError = false,
  highlightLabelOnError = true,
  leftIcon,
  rightIcon,
  id,
  containerClassName,
  inputContainerClassName,
  inputClassName,
  onInputContainerClick,
  ...inputProps
}: InputProps) {
  const inputId = useInputId(id);
  const { inputContainerClass, inputClass } = factoryInputVariantClass(variant);

  const containerClasses = joinInputClassName(
    styles.container,
    containerClassName,
  );
  const labelClasses = joinInputClassName(
    styles.label,
    hasError && highlightLabelOnError ? styles.labelError : undefined,
  );
  const wrapperClasses = joinInputClassName(
    styles.inputContainer,
    inputContainerClass,
    hasError ? styles.inputContainerError : undefined,
    inputContainerClassName,
  );
  const elementClasses = joinInputClassName(
    styles.inputElement,
    inputClass,
    hasError ? styles.inputElementError : undefined,
    inputClassName,
  );

  return (
    <div className={containerClasses}>
      <label className={labelClasses} htmlFor={inputId}>
        {label}
      </label>

      <div className={wrapperClasses} onClick={onInputContainerClick}>
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}

        <input
          id={inputId}
          className={elementClasses}
          {...inputProps}
          aria-invalid={inputProps["aria-invalid"] ?? hasError}
        />

        {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </div>
    </div>
  );
}
