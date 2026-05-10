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
,
  {
    slug: "boat-airdopes-plus-311-wireless-earbuds-review",
    title: "Boat Airdopes Plus 311 Review: 50-Hr Battery, Fast Charge & Glass Design TWS Earbuds",
    image: "https://m.media-amazon.com/images/I/61c3+AAop3L._SL1500_.jpg",
    category: "tech",
    description: "Dive into an unparalleled audio experience with the Boat Airdopes Plus 311. These TWS earbuds combine a premium glass design, powerful 50-hour battery life, and ENx Tech for crystal-clear calls, all while delivering your favorite tunes seamlessly. Enjoy fast charging and ad-free music streaming for an uninterrupted auditory journey.",
    price: 1299,
    oldPrice: 2999,
    rating: 4.4,
    reviewCount: 1567,
    affiliateLink: "https://amzn.to/42qa772",
    features: ["Premium Glass Design","ENx™ Technology for Clear Voice Calls","Up to 50 Hours Total Playback Time","ASAP™ Fast Charge Technology","Stream Ad-Free Music via App Support","Bluetooth v5.3 Connectivity","TWS (True Wireless Stereo) Functionality","Built-in Microphone for Calls","Stylish Charcoal Black Finish"],
    pros: ["Exceptional 50-hour battery life eliminates frequent charging worries","Stunning glass design offers a premium, unique aesthetic appeal","ENx™ Technology ensures crystal-clear call quality even in noisy environments","ASAP™ Fast Charge provides quick power boosts when you're in a hurry","App support for ad-free music enhances the listening experience"],
    cons: ["Glass design, while premium, might be prone to fingerprints and smudges","Bass output may not satisfy extreme audiophiles seeking very deep thumping bass","Ad-free music streaming feature might be dependent on specific app integration"],
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: ["Boat Airdopes","TWS Earbuds","Wireless Earphones","Bluetooth Earbuds","Fast Charge","50-Hour Battery","Glass Design","ENx Tech","Audio Tech","Earbuds with Mic","Charcoal Black Earbuds"],
  }
];
