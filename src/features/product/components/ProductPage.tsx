import { Container } from '../../../components/layout/Container';
import { Skeleton } from '../../../components/ui/Skeleton';
import { getUserErrorMessage } from '../../../services/api-client';
import { PRODUCT_SLUG } from '../../../services/config';
import type { Product } from '../../../types/domain';
import { excerpt } from '../../../utils/text';
import { RATING_SUMMARY } from '../../reviews/utils/review-utils';
import { SOLD_COUNT } from '../../reviews/data/reviews-data';
import { ReviewsSection } from '../../reviews/components/ReviewsSection';
import { Breadcrumb } from './Breadcrumb';
import { Gallery } from './Gallery';
import { buildGalleryImages, buildShowcaseItems } from '../utils/product-view-data';
import { ProductInfo } from './ProductInfo';
import { ProductShowcase } from './ProductShowcase';
import { useAddToCart } from '../hooks/use-add-to-cart';
import { useProduct } from '../hooks/use-product';
import { useProductSelection } from '../hooks/use-product-selection';

/** Search engines show roughly the first 155 characters. */
const META_DESCRIPTION_LENGTH = 155;

function ProductSkeleton() {
  return (
    <div className="grid gap-10 md:grid-cols-2" aria-busy="true" aria-live="polite" role="status">
      <span className="sr-only">Loading product…</span>
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

function ProductView({ product }: { product: Product }) {
  const selection = useProductSelection(product);
  const { quantity, setQuantity, addToCart } = useAddToCart(product, selection);

  const brand = product.categories[0]?.name ?? null;
  const metaDescription = excerpt(product.descriptionText, META_DESCRIPTION_LENGTH);
  const galleryImages = buildGalleryImages(product);
  const showcaseItems = buildShowcaseItems(product, galleryImages, brand);

  return (
    <>
      <title>{`${product.name} | EasyOrders`}</title>
      <meta name="description" content={metaDescription} />
      <div className="space-y-6 lg:space-y-10">
        <Breadcrumb categories={product.categories} productName={product.name} />
        <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-16 xl:gap-36">
          <Gallery
            productId={product.id}
            images={galleryImages}
            alt={product.name}
            highlightImage={selection.highlightImage}
          />
          <ProductInfo
            product={product}
            brand={brand}
            rating={RATING_SUMMARY.average}
            sold={SOLD_COUNT}
            selection={selection}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={addToCart}
          />
        </div>
      </div>

      <div className="mt-16 space-y-16 lg:mt-24 lg:space-y-24">
        <ProductShowcase title="Related Product" items={showcaseItems} />
        <ReviewsSection />
        <ProductShowcase title="Popular this week" items={showcaseItems} />
      </div>
    </>
  );
}

export function ProductPage() {
  const { data: product, isPending, isError, error, refetch } = useProduct(PRODUCT_SLUG);

  return (
    <main className="flex-1 pb-16 pt-6 lg:pb-24 lg:pt-10">
      <Container>
        {isPending && <ProductSkeleton />}

        {!isPending && !product && (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 rounded-2xl bg-gray-100 p-12 text-center"
          >
            <p className="text-lg font-medium">We couldn't load this product.</p>
            <p className="text-sm text-gray-500">{getUserErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-gray-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Try again
            </button>
          </div>
        )}

        {product && isError && (
          <p
            role="status"
            data-testid="refresh-error"
            className="mb-6 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-900"
          >
            We couldn&apos;t refresh this product, so you may be seeing slightly older details.
          </p>
        )}

        {product && <ProductView product={product} />}
      </Container>
    </main>
  );
}
