import { useState, type FormEvent } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  TwitterIcon,
  UsFlagIcon,
} from '../ui/icons';
import { PLACEHOLDER_TITLE, StaticLink } from '../ui/StaticLink';
import { Container } from './Container';
import { DashedDivider } from './DashedDivider';
import { Logo } from './Logo';

const LINK_GROUPS = [
  { title: 'Shop', links: ['My account', 'Login', 'Wishlist', 'Cart'] },
  {
    title: 'Information',
    links: ['Shipping Policy', 'Returns & Refunds', 'Cookies Policy', 'Frequently asked'],
  },
  { title: 'Company', links: ['About us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us'] },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'Twitter', Icon: TwitterIcon },
  { label: 'Email', Icon: MailIcon },
];

function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="flex items-end border-b border-[#838383] transition focus-within:border-gray-900">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="Get latest offers to your inbox"
          className="h-9 min-w-0 flex-1 bg-transparent pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none lg:h-10 lg:text-base"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="-mb-px flex h-9 w-12 shrink-0 items-center justify-center rounded-md bg-gray-950 text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 lg:h-10 lg:w-14"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
      <p role="status" className="mt-2 min-h-5 text-sm text-gray-600">
        {subscribed ? 'Thanks for subscribing!' : ''}
      </p>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-900">
      <Container className="pb-8 pt-14 lg:pt-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="space-y-5 lg:w-[21rem] lg:shrink-0">
            <Logo />
            <Newsletter />
            <ul className="flex gap-3">
              {SOCIAL_LINKS.map(({ label, Icon }) => (
                <li key={label}>
                  <span
                    role="img"
                    aria-label={label}
                    title={PLACEHOLDER_TITLE}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            data-testid="footer-links"
            className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:w-3/5 lg:gap-x-16"
          >
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="text-lg font-medium lg:text-sm lg:font-semibold">{group.title}</h2>
                <ul className="mt-4 space-y-3 lg:mt-5 lg:space-y-4">
                  {group.links.map((link) => (
                    <li key={link}>
                      <StaticLink className="text-sm text-gray-700">{link}</StaticLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <DashedDivider className="mb-6 mt-12 lg:mt-14" />

        <div className="flex flex-col gap-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-700">© John Lewis plc 2001 - 2024</p>
          <div className="flex items-center justify-end gap-8 font-medium">
            <span className="flex items-center gap-2">
              <UsFlagIcon />
              English
              <ChevronDownIcon />
            </span>
            <span className="flex items-center gap-1">
              USD
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
