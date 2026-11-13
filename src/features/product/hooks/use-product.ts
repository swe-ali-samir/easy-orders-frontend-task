import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '../../../services/product-service';

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: ({ signal }) => fetchProduct(slug, signal),
    staleTime: 5 * 60 * 1000,
  });
}
