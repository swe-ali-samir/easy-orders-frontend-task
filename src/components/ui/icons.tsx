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

export function BasketIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.99995 13.25C9.58573 13.25 9.24995 13.5858 9.24995 14C9.24995 14.4142 9.58573 14.75 9.99995 14.75H13.9999C14.4142 14.75 14.7499 14.4142 14.7499 14C14.7499 13.5858 14.4142 13.25 13.9999 13.25H9.99995Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.6645 2.32919C15.035 2.14395 15.4855 2.29412 15.6708 2.6646L17.4841 6.2912C17.9116 6.31294 18.3015 6.34614 18.6548 6.39687C19.7105 6.54845 20.5843 6.87432 21.2053 7.64247C21.8263 8.41062 21.9618 9.33329 21.8888 10.3973C21.8181 11.4285 21.5394 12.7289 21.191 14.3545L20.7396 16.4612C20.5047 17.5577 20.3141 18.4471 20.0743 19.1419C19.8244 19.866 19.4949 20.4614 18.9323 20.9163C18.3696 21.3711 17.7184 21.5685 16.958 21.6611C16.2284 21.75 15.3188 21.75 14.1974 21.75H9.80252C8.6812 21.75 7.77159 21.75 7.04196 21.6611C6.28159 21.5685 5.63033 21.3711 5.06769 20.9163C4.50505 20.4614 4.17561 19.866 3.92569 19.1419C3.68586 18.4471 3.49529 17.5577 3.26035 16.4612L2.80893 14.3546C2.46055 12.7289 2.18188 11.4285 2.11115 10.3973C2.03816 9.33329 2.17371 8.41062 2.7947 7.64247C3.41568 6.87432 4.28947 6.54845 5.34519 6.39687C5.69846 6.34615 6.08832 6.31294 6.51583 6.2912L8.32913 2.6646C8.51437 2.29412 8.96487 2.14395 9.33536 2.32919C9.70584 2.51443 9.85601 2.96494 9.67077 3.33542L8.21244 6.25207C8.576 6.25 8.95865 6.25001 9.36076 6.25001H14.6392C15.0412 6.25001 15.424 6.25 15.7875 6.25207L14.3291 3.33542C14.1439 2.96494 14.2941 2.51443 14.6645 2.32919ZM5.73206 7.85873L5.32913 8.6646C5.14388 9.03509 5.29405 9.48559 5.66454 9.67083C6.03502 9.85607 6.48553 9.70591 6.67077 9.33542L7.45802 7.76092C8.02842 7.75035 8.67786 7.75001 9.42191 7.75001H14.5781C15.3221 7.75001 15.9715 7.75035 16.5419 7.76092L17.3291 9.33542C17.5144 9.70591 17.9649 9.85607 18.3354 9.67083C18.7058 9.48559 18.856 9.03509 18.6708 8.6646L18.2678 7.85872C18.327 7.86588 18.3849 7.87351 18.4416 7.88164C19.3255 8.00855 19.7592 8.23967 20.0388 8.58549C20.3136 8.92548 20.4488 9.38794 20.3953 10.25H3.60471C3.55112 9.38794 3.68634 8.92548 3.9612 8.58549C4.24076 8.23967 4.67449 8.00855 5.55837 7.88164C5.61501 7.87351 5.67289 7.86588 5.73206 7.85873ZM4.28844 14.1C4.09145 13.1807 3.92663 12.409 3.80694 11.75H20.193C20.0733 12.409 19.9085 13.1807 19.7115 14.1L19.2829 16.1C19.0355 17.2546 18.8629 18.0541 18.6564 18.6525C18.4565 19.2314 18.2517 19.5376 17.9893 19.7498C17.7268 19.9619 17.3845 20.0981 16.7766 20.1721C16.1482 20.2487 15.3302 20.25 14.1495 20.25H9.85048C8.66972 20.25 7.85175 20.2487 7.22341 20.1721C6.61545 20.0981 6.27314 19.9619 6.01071 19.7498C5.74827 19.5376 5.54343 19.2314 5.3436 18.6525C5.13707 18.0541 4.96442 17.2546 4.71701 16.1L4.28844 14.1Z"
      />
    </svg>
  );
}
