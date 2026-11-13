import { ChevronRightIcon } from '../../../components/ui/icons';

interface BreadcrumbProps {
  categories: { id: string; name: string }[];
  productName: string;
}

const separator = <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-gray-500 lg:h-4 lg:w-4" />;

export function Breadcrumb({ categories, productName }: BreadcrumbProps) {
  const [primary] = categories;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs lg:gap-x-4 lg:text-base">
        <li>
          <a href="/" className="text-gray-500 transition hover:text-gray-900">
            Homepage
          </a>
        </li>
        {primary && (
          <li className="flex items-center gap-2 lg:gap-4">
            {separator}
            <a href="/" className="text-gray-500 transition hover:text-gray-900">
              {primary.name}
            </a>
          </li>
        )}
        <li className="flex items-center gap-2 lg:gap-4">
          {separator}
          <span aria-current="page" className="font-medium text-gray-900">
            {productName}
          </span>
        </li>
      </ol>
    </nav>
  );
}
