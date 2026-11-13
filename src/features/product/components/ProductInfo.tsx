import { DashedDivider } from '../../../components/layout/DashedDivider';
import { StarIcon } from '../../../components/ui/icons';
import type { Product } from '../../../types/domain';
import { Description } from './Description';
import { PriceBlock } from './PriceBlock';
import { ProductCategories } from './ProductCategories';
import { PurchasePanel } from './PurchasePanel';
import { StockStatus } from './StockStatus';
import type { AddToCartPayload, ProductSelection } from '../hooks/use-product-selection';

interface ProductInfoProps {
  product: Product;
  brand: string | null;
  rating: number;
  sold: number;
  selection: ProductSelection;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: (payload: AddToCartPayload) => void;
}

const soldFormatter = new Intl.NumberFormat('en-US');

export function ProductInfo({
  product,
  brand,
  rating,
  sold,
  selection,
  quantity,
  onQuantityChange,
  onAddToCart,
}: ProductInfoProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {brand && <p className="text-sm text-gray-500 lg:text-lg">{brand}</p>}
        <StockStatus inStock={selection.inStock} />
      </div>

      <h1
        className="mt-2 text-2xl font-bold leading-tight text-gray-900 lg:mt-3 lg:text-[2.5rem]"
        data-testid="product-title"
      >
        {product.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 lg:mt-5">
        <PriceBlock
          price={selection.price}
          originalPrice={selection.originalPrice}
          onSale={selection.onSale}
          currency={product.customCurrency}
        />
        <a
          href="#reviews"
          className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900 lg:text-xl"
          data-testid="rating-link"
          aria-label={`${soldFormatter.format(sold)} sold, rated ${rating.toFixed(1)} out of 5. See reviews`}
        >
          {soldFormatter.format(sold)} Sold
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          <StarIcon className="h-4 w-4 text-star lg:h-6 lg:w-6" />
          <span className="font-bold text-gray-900 lg:text-2xl">{rating.toFixed(1)}</span>
        </a>
      </div>

      <DashedDivider className="my-6 lg:my-8" />

      <Description html={product.descriptionHtml} text={product.descriptionText} />

      <PurchasePanel
        className="mt-6 lg:mt-10"
        product={product}
        selection={selection}
        quantity={quantity}
        onQuantityChange={onQuantityChange}
        onAddToCart={onAddToCart}
      />

      <div className="mt-6">
        <ProductCategories categories={product.categories} />
      </div>
    </div>
  );
}
