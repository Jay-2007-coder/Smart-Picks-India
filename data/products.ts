export interface Product {
  slug: string;
  title: string;
  image: string;
  category: string;
  description: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviewCount: number;
  affiliateLink: string;
  features: string[];
  pros: string[];
  cons: string[];
  featured: boolean;
  trending: boolean;
  dealOfTheDay: boolean;
  tags: string[];
}

export const products: Product[] = [
  {
    slug: "apple-iphone-15-128gb-black-review",
    title: "Apple iPhone 15 (128GB, Black) Review: Is It The Perfect Upgrade for You?",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
    category: "tech",
    description: "Dive into our comprehensive review of the Apple iPhone 15 (128GB) in Black. Discover its cutting-edge features, stunning camera, and why it might be your next smartphone. We explore performance, battery life, and overall value for money in the Indian market.",
    price: 72999,
    oldPrice: 79900,
    rating: 4.7,
    reviewCount: 12500,
    affiliateLink: "https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY?tag=smartpick07d2-21",
    features: ["Dynamic Island for intuitive alerts and Live Activities","Powerful A16 Bionic chip for lightning-fast performance","48MP Main camera with 2x Telephoto for incredible detail","USB-C connector for universal charging and data transfer","Durable Ceramic Shield front cover and color-infused glass back"],
    pros: ["Exceptional camera system delivering stunning photos and videos","Smooth and powerful performance thanks to the A16 Bionic chip","Premium, lightweight design with a bright Super Retina XDR display"],
    cons: ["Standard 60Hz display refresh rate, not 120Hz ProMotion","Significant price point compared to high-end Android alternatives"],
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: ["Apple iPhone 15","Smartphone Review","Tech Gadget"],
  }
];