export interface Deal {
  slug: string;
  title: string;
  image: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  category: string;
  affiliateLink: string;
  trending: boolean;
  label: string;
  expiresIn: string;
}

export const deals: Deal[] = [];
