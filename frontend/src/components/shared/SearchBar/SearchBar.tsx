import type { FormEvent } from "react";
import styles from "./SearchBar.module.css";
import type { SearchBarProps } from "./SearchBar.types";
import { joinSearchBarClassName } from "./SearchBar.utils";
import SearchIcon from "../../../assets/Icons/SearchIcon";
import CloseIcon from "../../../assets/Icons/CloseIcon";

// Renders a controlled search form with clear and submit interactions.
export default function SearchBar({
  className,
  placeholder = "Search by title of post...",
  value = "",
  onValueChange,
  onSearch,
}: SearchBarProps) {
  const searchBarClassName = joinSearchBarClassName(
    styles.searchBar,
    className,
  );
  const hasValue = value.length > 0;

  // Handles search submit without causing a page refresh.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch?.(value);
  }

  return (
    <form className={searchBarClassName} role="search" onSubmit={handleSubmit}>
      <div className={styles.inputField}>
        <div className={styles.inputWrapper}>
          <SearchIcon className={styles.inputIcon} />
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            className={styles.input}
            aria-label="Search by post title"
            onChange={(event) => onValueChange?.(event.target.value)}
          />
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => onValueChange?.("")}
            aria-label="Clear search"
            disabled={!hasValue}
          >
            <CloseIcon className={styles.clearIcon} />
          </button>
        </div>
      </div>

      <button
        type="submit"
        className={styles.searchButton}
        aria-label="Search posts"
      >
        <SearchIcon className={styles.searchButtonIcon} />
      </button>
    </form>
  );
}
