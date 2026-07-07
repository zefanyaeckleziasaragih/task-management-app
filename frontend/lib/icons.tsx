type IconProps = {
  className?: string;
};

export function PlusIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PencilIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16.862 3.487a1.875 1.875 0 1 1 2.652 2.652L7.5 18.153l-4 1 1-4L16.862 3.487Z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 6.5h16M9.5 6.5V4.8c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1.7M6.5 6.5 7.2 19a2 2 0 0 0 2 1.85h5.6a2 2 0 0 0 2-1.85l.7-12.5"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x={3.5}
        y={5}
        width={17}
        height={16}
        rx={2.5}
        stroke="currentColor"
        strokeWidth={1.7}
      />
      <path
        d="M8 3v4M16 3v4M3.5 10h17"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SendIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="m4 20 16-8L4 4l2.2 6.4a1 1 0 0 0 .8.68L15 12l-8 .92a1 1 0 0 0-.8.68L4 20Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.5c.5 3.2 1.3 5.3 2.5 6.5 1.2 1.2 3.3 2 6.5 2.5-3.2.5-5.3 1.3-6.5 2.5-1.2 1.2-2 3.3-2.5 6.5-.5-3.2-1.3-5.3-2.5-6.5C8.3 12.8 6.2 12 3 11.5c3.2-.5 5.3-1.3 6.5-2.5C10.7 7.8 11.5 5.7 12 2.5Z" />
    </svg>
  );
}

export function SearchIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx={11} cy={11} r={6.5} stroke="currentColor" strokeWidth={1.7} />
      <path
        d="m20 20-4.35-4.35"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AlertIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 9v4.5M12 17h.01M10.6 3.8 2.9 17.3A1.8 1.8 0 0 0 4.46 20h15.08a1.8 1.8 0 0 0 1.56-2.7L13.4 3.8a1.8 1.8 0 0 0-2.8 0Z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckCircleIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.7} />
      <path
        d="m8.5 12.5 2.3 2.3 4.7-5.1"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClipboardIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x={5}
        y={4.5}
        width={14}
        height={16}
        rx={2}
        stroke="currentColor"
        strokeWidth={1.7}
      />
      <path
        d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5"
        stroke="currentColor"
        strokeWidth={1.7}
      />
      <path
        d="M8.5 10h7M8.5 13.5h7M8.5 17h4.5"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoutIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 21H6.5A2.5 2.5 0 0 1 4 18.5v-13A2.5 2.5 0 0 1 6.5 3H9M16 16l5-4-5-4M21 12H9"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BotIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x={4}
        y={8}
        width={16}
        height={11}
        rx={3}
        stroke="currentColor"
        strokeWidth={1.7}
      />
      <path
        d="M12 8V4.5M9 4.5h6"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <circle cx={9} cy={13.2} r={1.2} fill="currentColor" />
      <circle cx={15} cy={13.2} r={1.2} fill="currentColor" />
      <path
        d="M9 16.5c1 .7 5 .7 6 0"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
