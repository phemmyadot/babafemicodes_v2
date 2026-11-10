import type { CaseId } from "./content";

export function ArrowIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      className={`od-icon icon-${size}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

export function ExternalIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      className={`od-icon icon-${size}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg
      className="od-icon icon-16 icon-copy"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      className="od-icon icon-16 icon-check"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg
      className="od-icon icon-18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function HeroPoster() {
  return (
    <svg className="poster" viewBox="0 0 520 520" role="img" focusable="false">
      <defs>
        <pattern id="posterGrid" width="52" height="52" patternUnits="userSpaceOnUse">
          <path d="M52 0H0v52" fill="none" stroke="#101014" strokeOpacity="0.14" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="520" height="520" fill="url(#posterGrid)" />
      <circle cx="330" cy="226" r="132" fill="#FF4D38" stroke="#101014" strokeWidth="4" />
      <path d="M96 432V318a112 112 0 0 1 224 0v114Z" fill="#57E3B4" stroke="#101014" strokeWidth="4" />
      <circle cx="186" cy="178" r="64" fill="#101014" />
      <circle cx="164" cy="164" r="8" fill="#F1E94A" />
      <circle cx="208" cy="164" r="8" fill="#F1E94A" />
      <path
        d="M162 196c12 16 36 16 48 0"
        fill="none"
        stroke="#F1E94A"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <g transform="translate(418 120)">
        <g className="poster-star">
          <rect x="-9" y="-56" width="18" height="112" fill="#F1E94A" stroke="#101014" strokeWidth="4" />
          <rect
            x="-9"
            y="-56"
            width="18"
            height="112"
            fill="#F1E94A"
            stroke="#101014"
            strokeWidth="4"
            transform="rotate(45)"
          />
          <rect
            x="-9"
            y="-56"
            width="18"
            height="112"
            fill="#F1E94A"
            stroke="#101014"
            strokeWidth="4"
            transform="rotate(90)"
          />
          <rect
            x="-9"
            y="-56"
            width="18"
            height="112"
            fill="#F1E94A"
            stroke="#101014"
            strokeWidth="4"
            transform="rotate(135)"
          />
        </g>
      </g>
      <path
        d="M64 452h392"
        stroke="#F2F3F9"
        strokeWidth="4"
        strokeDasharray="2 14"
        strokeLinecap="round"
      />
      <g fill="#F2F3F9" fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="2">
        <text x="64" y="492">
          CHI / 41.88N
        </text>
        <text x="392" y="492">
          SINCE 2018
        </text>
      </g>
      <circle cx="352" cy="392" r="7" fill="#F1E94A" />
      <circle cx="450" cy="308" r="5" fill="#F2F3F9" />
      <circle cx="302" cy="86" r="6" fill="#57E3B4" />
    </svg>
  );
}

function FlowsenseVisual() {
  return (
    <svg viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="480" height="320" fill="#0C0C12" />
      <g stroke="#2A2B36" strokeWidth="1">
        <path d="M0 80h480M0 160h480M0 240h480" />
      </g>
      <g stroke="#22232D" strokeWidth="1" strokeDasharray="2 8">
        <path d="M80 40v240M160 40v240M240 40v240M320 40v240M400 40v240" />
      </g>
      <g className="ecg-scroll">
        <path
          d="M-20 160h60l12-38 14 84 16-62 12 22 18-6 14 8h70l12-44 15 92 16-70 14 24 18-8 14 10h76l12-36 15 80 16-60 14 22 18-6 14 8h64"
          fill="none"
          stroke="#F1E94A"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <circle cx="404" cy="86" r="9" fill="#0C0C12" stroke="#FF4D38" strokeWidth="2" />
      <circle cx="404" cy="86" r="3.5" fill="#FF4D38" />
      <path
        d="M420 76a18 18 0 0 1 0 20M430 66a30 30 0 0 1 0 40"
        fill="none"
        stroke="#FF4D38"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#8F91A3" letterSpacing="1.5">
        <text x="20" y="30">
          SENSOR / LIVE
        </text>
        <text x="392" y="300">
          BLE SECURE
        </text>
      </g>
    </svg>
  );
}

function DesignSystemVisual() {
  return (
    <svg viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="480" height="320" fill="#0C0C12" />
      <g stroke="#2A2B36" strokeWidth="1" strokeDasharray="2 8">
        <path d="M40 40v240M120 40v240M200 40v240M280 40v240M360 40v240M440 40v240" />
      </g>
      <g stroke="#F2F3F9" strokeWidth="2">
        <rect x="36" y="44" width="120" height="92" fill="#2B3BFF" />
        <rect x="180" y="44" width="120" height="92" fill="#FF4D38" />
        <rect x="324" y="44" width="120" height="92" fill="#F1E94A" />
        <rect x="36" y="176" width="120" height="92" fill="#57E3B4" />
        <rect x="180" y="176" width="120" height="92" fill="#F2F3F9" />
        <rect x="324" y="176" width="120" height="92" fill="#101014" />
      </g>
      <g fill="#101014">
        <rect x="52" y="64" width="58" height="7" />
        <rect x="52" y="80" width="84" height="7" opacity="0.6" />
        <rect x="52" y="106" width="40" height="16" />
      </g>
      <g fill="#101014">
        <rect x="196" y="64" width="58" height="7" />
        <rect x="196" y="80" width="72" height="7" opacity="0.6" />
      </g>
      <g fill="#101014">
        <rect x="340" y="64" width="58" height="7" />
        <rect x="340" y="80" width="80" height="7" opacity="0.65" />
      </g>
      <g fill="#101014">
        <rect x="52" y="196" width="58" height="7" />
        <rect x="52" y="212" width="80" height="7" opacity="0.65" />
      </g>
      <g fill="#101014">
        <rect x="196" y="196" width="58" height="7" />
        <rect x="196" y="212" width="74" height="7" opacity="0.55" />
        <rect x="196" y="236" width="46" height="16" />
      </g>
      <g fill="#F2F3F9">
        <rect x="340" y="196" width="58" height="7" />
        <rect x="340" y="212" width="84" height="7" opacity="0.55" />
      </g>
      <g className="cursor-select">
        <rect x="146" y="140" width="44" height="30" fill="none" stroke="#F1E94A" strokeWidth="2.5" />
        <path d="M190 170l10 24 6-10 11-2Z" fill="#F1E94A" stroke="#101014" strokeWidth="2" />
      </g>
      <g fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#8F91A3" letterSpacing="1.5">
        <text x="20" y="304">
          TOKENS / 10 TEAMS
        </text>
        <text x="356" y="304">
          STORYBOOK
        </text>
      </g>
    </svg>
  );
}

function RagVisual() {
  return (
    <svg viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="480" height="320" fill="#0C0C12" />
      <rect x="26" y="32" width="232" height="240" fill="#F2F3F9" stroke="#101014" strokeWidth="2" />
      <g fill="#C9CBD6">
        <rect x="44" y="56" width="130" height="6" rx="3" />
        <rect x="44" y="72" width="176" height="6" rx="3" />
        <rect x="44" y="88" width="150" height="6" rx="3" />
        <rect x="44" y="112" width="184" height="6" rx="3" />
        <rect x="44" y="128" width="168" height="6" rx="3" />
        <rect x="44" y="144" width="120" height="6" rx="3" />
        <rect x="44" y="168" width="180" height="6" rx="3" />
        <rect x="44" y="184" width="140" height="6" rx="3" />
        <rect x="44" y="208" width="164" height="6" rx="3" />
        <rect x="44" y="224" width="96" height="6" rx="3" />
      </g>
      <polygon
        points="44,104 220,96 226,152 48,162"
        fill="#FF4D38"
        fillOpacity="0.22"
        stroke="#FF4D38"
        strokeWidth="2.5"
      />
      <g fill="#FF4D38">
        <circle cx="44" cy="104" r="4" />
        <circle cx="220" cy="96" r="4" />
        <circle cx="226" cy="152" r="4" />
        <circle cx="48" cy="162" r="4" />
      </g>
      <rect x="282" y="48" width="172" height="76" fill="#F2F3F9" stroke="#101014" strokeWidth="2" />
      <rect x="296" y="62" width="64" height="7" fill="#101014" />
      <rect x="296" y="78" width="132" height="5" fill="#B9BCC9" />
      <rect x="296" y="90" width="118" height="5" fill="#B9BCC9" />
      <rect x="296" y="106" width="46" height="12" fill="#57E3B4" stroke="#101014" strokeWidth="1.5" />
      <rect x="282" y="142" width="172" height="76" fill="#2B3BFF" stroke="#101014" strokeWidth="2" />
      <rect x="296" y="156" width="64" height="7" fill="#F2F3F9" />
      <rect x="296" y="172" width="132" height="5" fill="#C9CDFF" />
      <rect x="296" y="184" width="108" height="5" fill="#C9CDFF" />
      <rect x="296" y="200" width="46" height="12" fill="#F1E94A" stroke="#101014" strokeWidth="1.5" />
      <g className="rag-scan">
        <rect x="20" y="96" width="244" height="4" fill="#57E3B4" />
      </g>
      <g fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#8F91A3" letterSpacing="1.5">
        <text x="20" y="300">
          CITATION / 04
        </text>
        <text x="352" y="300">
          VERIFIED
        </text>
      </g>
    </svg>
  );
}

function KoilVisual() {
  const bars = [
    { x: 60, y: 196, bottom: 252, barY: 206, fill: "#FF4D38" },
    { x: 104, y: 176, bottom: 232, barY: 186, fill: "#57E3B4" },
    { x: 148, y: 156, bottom: 212, barY: 166, fill: "#57E3B4" },
    { x: 192, y: 168, bottom: 224, barY: 178, fill: "#FF4D38" },
    { x: 236, y: 136, bottom: 192, barY: 146, fill: "#57E3B4" },
    { x: 280, y: 112, bottom: 168, barY: 122, fill: "#57E3B4" },
    { x: 324, y: 124, bottom: 180, barY: 134, fill: "#F1E94A" },
    { x: 368, y: 92, bottom: 148, barY: 102, fill: "#57E3B4" },
    { x: 412, y: 72, bottom: 128, barY: 82, fill: "#F1E94A" },
  ];
  return (
    <svg viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="480" height="320" fill="#0C0C12" />
      <g stroke="#2A2B36" strokeWidth="1">
        <path d="M0 80h480M0 160h480M0 240h480" />
      </g>
      <g>
        {bars.map((bar) => (
          <g key={bar.x}>
            <line x1={bar.x} y1={bar.y} x2={bar.x} y2={bar.bottom} stroke="#8F91A3" strokeWidth="2" />
            <rect
              x={bar.x - 10}
              y={bar.barY}
              width="20"
              height="30"
              fill={bar.fill}
              stroke="#101014"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </g>
      <g className="koil-line">
        <path
          d="M50 240c60-20 90-50 140-56s86 26 130-14 76-42 110-58"
          fill="none"
          stroke="#F2F3F9"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1 10"
        />
        <path
          d="M404 104l28-8-10 26"
          fill="none"
          stroke="#F1E94A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#8F91A3" letterSpacing="1.5">
        <text x="20" y="300">
          SCREENER / 14 SIGNALS
        </text>
        <text x="366" y="300">
          FASTAPI
        </text>
      </g>
    </svg>
  );
}

export function SheetVisual({ caseId }: { caseId: CaseId }) {
  switch (caseId) {
    case "flowsense":
      return <FlowsenseVisual />;
    case "design-system":
      return <DesignSystemVisual />;
    case "rag":
      return <RagVisual />;
    case "koil":
      return <KoilVisual />;
  }
}

export function StackSpin() {
  return (
    <svg className="stack-spin" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g fill="none" stroke="#101014" strokeWidth="10">
        <path d="M100 12v176M12 100h176M38 38l124 124M162 38 38 162" />
      </g>
    </svg>
  );
}

export function ContactSticker() {
  return (
    <svg viewBox="0 0 240 240" focusable="false">
      <defs>
        <path id="stickerCircle" d="M120 32a88 88 0 1 1-.01 0" />
      </defs>
      <circle cx="120" cy="120" r="112" fill="#F1E94A" stroke="#101014" strokeWidth="4" />
      <g className="sticker-ring">
        <text fontFamily="'JetBrains Mono', monospace" fontSize="15" letterSpacing="4.4" fill="#101014">
          <textPath href="#stickerCircle" startOffset="0">
            OPEN TO WORK · OPEN TO WORK · OPEN TO WORK ·
          </textPath>
        </text>
      </g>
      <g transform="translate(120 120)">
        <rect x="-7" y="-54" width="14" height="108" fill="#101014" />
        <rect x="-7" y="-54" width="14" height="108" fill="#101014" transform="rotate(45)" />
        <rect x="-7" y="-54" width="14" height="108" fill="#101014" transform="rotate(90)" />
        <rect x="-7" y="-54" width="14" height="108" fill="#101014" transform="rotate(135)" />
        <circle r="16" fill="#FF4D38" stroke="#101014" strokeWidth="4" />
      </g>
    </svg>
  );
}
