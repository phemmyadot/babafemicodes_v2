type IconProps = {
  size?: 12 | 14 | 16 | 18 | 20;
  className?: string;
};

const cls = (size: IconProps["size"], className?: string) =>
  ["od-icon", `icon-${size ?? 16}`, className].filter(Boolean).join(" ");

const shared = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
} as const;

export function ArrowRight({ size = 16, className }: IconProps) {
  return (
    <svg {...shared} className={cls(size, className)} strokeWidth={1.8}>
      <path d="M4 12h16m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

export function ExternalLink({ size = 14, className }: IconProps) {
  return (
    <svg {...shared} className={cls(size, className)} strokeWidth={1.9}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function Download({ size = 16, className }: IconProps) {
  return (
    <svg {...shared} className={cls(size, className)} strokeWidth={1.8}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function Copy({ size = 16, className }: IconProps) {
  return (
    <svg {...shared} className={cls(size, className)} strokeWidth={1.6}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

export function Check({ size = 16, className }: IconProps) {
  return (
    <svg {...shared} className={cls(size, className)} strokeWidth={1.9}>
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

export function Close({ size = 18, className }: IconProps) {
  return (
    <svg {...shared} className={cls(size, className)} strokeWidth={1.7}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Menu({ size = 20, className }: IconProps) {
  return (
    <svg {...shared} className={cls(size, className)} strokeWidth={1.7}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function ShieldCheck({ size = 18, className }: IconProps) {
  return (
    <svg {...shared} className={cls(size, className)} strokeWidth={1.6}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Verified({ size = 12, className }: IconProps) {
  return (
    <svg {...shared} className={cls(size, className)} strokeWidth={2.2}>
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}
