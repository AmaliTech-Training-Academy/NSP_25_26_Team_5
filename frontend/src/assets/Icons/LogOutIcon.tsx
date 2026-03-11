import type { SVGProps } from "react";

export default function LogOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12.5 2.5H5.83333C5.39131 2.5 4.96738 2.67559 4.65482 2.98816C4.34226 3.30072 4.16667 3.72464 4.16667 4.16667V15.8333C4.16667 16.2754 4.34226 16.6993 4.65482 17.0118C4.96738 17.3244 5.39131 17.5 5.83333 17.5H12.5M15.8333 14.1667L19.1667 10.8333M19.1667 10.8333L15.8333 7.5M19.1667 10.8333H9.16667"
        stroke="#C81E1E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
