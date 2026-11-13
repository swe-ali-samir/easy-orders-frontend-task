import type { Category } from '../../../types/domain';

export function ProductCategories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return null;
  }
  return (
    <p data-testid="product-categories" className="text-sm text-gray-500 lg:text-base">
      {categories.length === 1 ? 'Category' : 'Categories'}:{' '}
      <span className="text-gray-900">
        {categories.map((category) => category.name).join(', ')}
      </span>
    </p>
  );
}
