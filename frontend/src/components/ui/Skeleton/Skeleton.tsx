import type { HTMLAttributes } from "react";
import styles from "./Skeleton.module.css";

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export default function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={joinClassNames(styles.skeleton, className)}
      {...props}
    />
  );
}
