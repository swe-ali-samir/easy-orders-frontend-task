export type ReviewTopic =
  'Product Quality' | 'Seller Services' | 'Product Price' | 'Shipment' | 'Match with Description';

export interface Review {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body?: string;
  /** ISO timestamp (UTC). */
  createdAt: string;
  likes: number;
  hasMedia: boolean;
  topics: ReviewTopic[];
}

export type ReviewTab = 'all' | 'media' | 'description';

export interface ReviewFilterState {
  tab: ReviewTab;
  ratings: number[];
  topics: ReviewTopic[];
}
