import type { SVGProps } from "react";

export default function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M14.0001 14.0001L11.1001 11.1001M12.6667 7.33341C12.6667 10.2789 10.2789 12.6667 7.33342 12.6667C4.3879 12.6667 2.00008 10.2789 2.00008 7.33341C2.00008 4.3879 4.3879 2.00008 7.33342 2.00008C10.2789 2.00008 12.6667 4.3879 12.6667 7.33341Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
