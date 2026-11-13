import type { ReactNode } from 'react';

interface IconProps {
  className?: string;
}

interface BaseIconProps extends IconProps {
  children: ReactNode;
  filled?: boolean;
  strokeWidth?: number;
}

function Icon({
  className = 'h-5 w-5',
  filled = false,
  strokeWidth = 1.8,
  children,
}: BaseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </Icon>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  );
}

export function HeartIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Icon className={className} filled={filled}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Icon>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M6 7V6a6 6 0 0 1 12 0v1" />
      <path d="M4 7h16l-1.2 13a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8Z" />
    </Icon>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v13" />
    </Icon>
  );
}

export function ChevronDownIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function ChevronUpIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="m18 15-6-6-6 6" />
    </Icon>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Icon className={className} strokeWidth={2}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Icon>
  );
}

export function FilterIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3 4h18l-7 8.5V19l-4 2v-8.5Z" />
    </Icon>
  );
}

export function StarIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95Z" />
    </svg>
  );
}

export function ThumbUpIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Icon className={className} filled={filled}>
      <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
      <path d="M7 10l4-7a2.5 2.5 0 0 1 3 2.5V9h5a2 2 0 0 1 2 2.3l-1.2 7.5A2.5 2.5 0 0 1 17.3 21H7" />
    </Icon>
  );
}

export function ThumbDownIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Icon className={className} filled={filled}>
      <path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1Z" />
      <path d="M17 14l-4 7a2.5 2.5 0 0 1-3-2.5V15H5a2 2 0 0 1-2-2.3l1.2-7.5A2.5 2.5 0 0 1 6.7 3H17" />
    </Icon>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H7v3.5h2V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15Z" />
    </Icon>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </Icon>
  );
}

export function TwitterIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2Z" />
    </Icon>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Icon>
  );
}

export function UsFlagIcon({ className = 'h-4 w-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" fill="#fff" />
      {/* 13 stripes; red on even rows. Canton covers the top 7 stripes. */}
      {[0, 2, 4, 6, 8, 10, 12].map((row) => (
        <rect key={row} y={(row * 16) / 13} width="24" height={16 / 13} fill="#B22234" />
      ))}
      <rect width="10" height={(7 * 16) / 13} fill="#3C3B6E" />
    </svg>
  );
}

export function ImageOffIcon({ className }: IconProps) {
  return (
    <Icon className={className} strokeWidth={1.5}>
      <path d="M3 3l18 18" />
      <path d="M10.4 5H19a2 2 0 0 1 2 2v8.6M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 1.2-1.8" />
      <path d="m3 16 5-5 3 3M14.5 11.5 16 10l5 5" />
    </Icon>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Icon>
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <Icon className={className} strokeWidth={1.5}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </Icon>
  );
}
