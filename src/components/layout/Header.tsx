import { selectCartCount, useCartStore } from '../../store/cart-store';
import { selectWishlistCount, useWishlistStore } from '../../store/wishlist-store';
import {
    BasketIcon,
    ChevronDownIcon,
    HeartIcon,
    MenuIcon,
    SearchIcon,
    UserIcon,
} from '../ui/icons';
import { PLACEHOLDER_TITLE } from '../ui/StaticLink';
import { Container } from './Container';
import { Logo } from './Logo';

const iconButton =
  'relative flex h-10 w-10 items-center justify-center rounded-full text-gray-900 transition hover:bg-gray-100 sm:h-11 sm:w-11';
const placeholderIcon =
  'relative flex h-10 w-10 cursor-default items-center justify-center rounded-full text-gray-900 sm:h-11 sm:w-11';
const placeholderText =
  'hidden h-11 cursor-default items-center gap-2 rounded-full px-3 text-base font-medium text-gray-900 lg:flex';

const placeholderProps = {
  type: 'button',
  'aria-disabled': true,
  title: PLACEHOLDER_TITLE,
} as const;

function CountBadge({ count, testId }: { count: number; testId: string }) {
  if (count <= 0) {
    return null;
  }
  return (
    <span
      data-testid={testId}
      className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-950 px-1 text-[10px] font-semibold leading-none text-white"
    >
      {count}
    </span>
  );
}

export function Header() {
  const itemCount = useCartStore(selectCartCount);
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore(selectWishlistCount);

  return (
    <header className="bg-white">
      <Container>
        <div className="flex items-center justify-between gap-3 border-b sm:gap-6 border-dashed border-gray-300 py-5 lg:py-8">
          <a href="/" aria-label="John Lewis & Partners homepage">
            <Logo />
          </a>

          <div className="flex shrink-0 items-center sm:gap-1 lg:gap-4">
            <button {...placeholderProps} aria-label="Search" className={placeholderIcon}>
              <SearchIcon className="h-6 w-6" />
            </button>

            <button {...placeholderProps} className={placeholderText}>
              Categories
              <ChevronDownIcon />
            </button>

            <button {...placeholderProps} className={placeholderText}>
              <UserIcon className="h-6 w-6" />
              Sign in
            </button>

            <button
              {...placeholderProps}
              aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'}`}
              className={`${placeholderIcon} hidden lg:flex`}
            >
              <HeartIcon className="h-6 w-6" />
              <CountBadge count={wishlistCount} testId="wishlist-badge" />
            </button>

            <button
              type="button"
              data-testid="cart-button"
              aria-label={`Open cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
              onClick={openCart}
              className={iconButton}
            >
              <BasketIcon className="size-7" />
              <CountBadge count={itemCount} testId="cart-badge" />
            </button>

            <button
              {...placeholderProps}
              aria-label="Menu"
              className={`${placeholderIcon} lg:hidden`}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
