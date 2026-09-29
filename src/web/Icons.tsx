import type { SVGProps } from "react";

const paths = {
  warning: "M12 3 2 21h20zM12 9v5m0 3h.01",
  circle: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  models: "M8 3h8v4h4v10h-4v4H8v-4H4V7h4zm0 4v10h8V7z",
  key: "M14 5a5 5 0 1 1-3 9l-7 7H2v-4l7-7a5 5 0 0 1 5-5m2 3h.01",
  plus: "M12 5v14M5 12h14",
  search: "m20 20-4-4M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  cube: "m12 3 9 5v9l-9 5-9-5V8zm0 10 9-5M3 8l9 5v9",
  sliders: "M5 3v8m0 4v6M12 3v3m0 4v11M19 3v12m0 4v2M2 11h6M9 6h6M16 15h6",
  arrow: "M12 19V5m-6 6 6-6 6 6",
  chevron: "m8 10 4 4 4-4",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2",
  check: "m5 12 4 4 10-10",
  heart: "M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15z",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  close: "m6 6 12 12M6 18 18 6",
  external: "M14 4h6v6m0-6-9 9M9 4H4v16h16v-5",
  play: "m8 4 12 8-12 8z",
  bolt: "m13 2-8 12h6l-1 8 9-13h-6z",
} as const;

export function Icon({
  name,
  size = 20,
  ...props
}: SVGProps<SVGSVGElement> & { name: keyof typeof paths; size?: number }) {
  return (
    <svg
      {...props}
      className={"ui-icon " + (props.className ?? "")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}

/** Shared mascot artwork keeps the sidebar, welcome screen and favicon in sync. */
export function TakkoMark({ className = "" }: { className?: string }) {
  return (
    <img
      className={"takko-mark " + className}
      src="/takko.svg"
      width={32}
      height={32}
      alt=""
      aria-hidden="true"
    />
  );
}
