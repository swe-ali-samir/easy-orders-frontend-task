import { DashedDivider } from '../../../components/layout/DashedDivider';
import { StarIcon } from '../../../components/ui/icons';
import { ProductImage } from '../../../components/ui/ProductImage';
import { StaticLink } from '../../../components/ui/StaticLink';

export interface ShowcaseItem {
  id: string;
  brand: string | null;
  name: string;
  price: string;
  image: string;
  rating: number;
  sold: number;
}

const soldFormatter = new Intl.NumberFormat('en-US');

function ProductCard({ item }: { item: ShowcaseItem }) {
  return (
    <article
      className="w-[70%] shrink-0 snap-start sm:w-[40%] lg:w-auto"
      data-testid="product-card"
    >
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
        <ProductImage src={item.image} alt={item.name} />
      </div>
      {item.brand && <p className="mt-4 text-base font-bold lg:text-lg">{item.brand}</p>}
      <p className="mt-2 text-lg font-bold lg:text-xl">{item.price}</p>
      <h3 className="mt-2 text-sm text-gray-500 lg:text-base">{item.name}</h3>
      <p className="mt-2 flex items-center gap-2 text-sm text-gray-500 lg:text-base">
        <StarIcon className="h-5 w-5 text-star" />
        <span className="text-gray-900">{item.rating.toFixed(1)}</span>
        <span className="sr-only">out of 5,</span>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gray-300" />
        {soldFormatter.format(item.sold)} Sold
      </p>
    </article>
  );
}

interface ProductShowcaseProps {
  title: string;
  items: ShowcaseItem[];
}

export function ProductShowcase({ title, items }: ProductShowcaseProps) {
  const headingId = `showcase-${title.toLowerCase().replace(/\W+/g, '-')}`;

  return (
    <section aria-labelledby={headingId}>
      <DashedDivider />
      <div className="flex items-end justify-between gap-4 pt-14 lg:pt-20">
        <h2 id={headingId} className="text-2xl font-bold lg:text-3xl">
          {title}
        </h2>
        <StaticLink className="shrink-0 whitespace-nowrap text-sm font-medium text-gray-600 underline underline-offset-4 lg:text-base">
          View All
        </StaticLink>
      </div>
      <div className="relative -mx-6 mt-8 flex snap-x scroll-px-6 gap-5 overflow-x-auto px-6 pb-2 md:-mx-10 md:scroll-px-10 md:px-10 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-10 lg:overflow-visible lg:px-0">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
