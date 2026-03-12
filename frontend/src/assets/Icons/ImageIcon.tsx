import type { SVGProps } from "react";

export default function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="1.333"
        y="2"
        width="13.333"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="5" cy="5.333" r="1.167" fill="currentColor" />
      <path
        d="M14 10.667L10.377 7.044C10.117 6.784 9.696 6.784 9.435 7.044L4 12.479"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.333 12L9.289 10.044C9.55 9.784 9.971 9.784 10.232 10.044L12 11.812"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
