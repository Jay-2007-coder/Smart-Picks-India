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
,
  {
    slug: "titan-casual-watches-women-2656wl01-review",
    title: "Titan 2656WL01 Review: The Perfect Blend of Style & Tech for Modern Women",
    image: "https://m.media-amazon.com/images/I/61EAcTdXZ7L._SX679_.jpg",
    category: "tech",
    description: "Looking for a timepiece that beautifully combines elegance with everyday functionality? Our in-depth review of the Titan Casual Watch 2656WL01 reveals why this women's watch is more than just an accessory, but a reliable piece of wearable tech. Discover its timeless design, precise engineering, and how it seamlessly integrates into your dynamic lifestyle.",
    price: 2299,
    oldPrice: 3499,
    rating: 4.3,
    reviewCount: 1250,
    affiliateLink: "https://amzn.to/42mAv1F",
    features: ["Precision Quartz Movement for accurate timekeeping","Durable Mineral Glass protects the elegant dial","3 ATM Water Resistance for everyday splashes and spills","Stylish Rose Gold-Tone Dial with clear hour markers","Comfortable and high-quality Leather Strap"],
    pros: ["Elegant and versatile design suitable for various occasions","Reliable and trusted Titan brand quality and craftsmanship","Comfortable for extended daily wear due to lightweight design"],
    cons: ["Lacks smart features like connectivity or health tracking","Basic water resistance, not suitable for swimming or showering"],
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: ["Titan watch","Women's watch","Casual watch","Analog watch","Tech accessory","Indian brand","Fashion tech","2656WL01"],
  }
,
  {
    slug: "sonata-polyurethane-silver-dial-womens-analog-watch-review-87049PP11W",
    title: "Sonata Polyurethane Silver Dial Watch Review: Style Meets Durability (87049PP11W)",
    image: "https://m.media-amazon.com/images/I/71UMb+8-n5L._SX679_.jpg",
    category: "tech",
    description: "Discover the Sonata 87049PP11W, a sophisticated analog watch for women that perfectly blends contemporary style with robust design. Featuring a sleek silver dial and a comfortable polyurethane strap, this timepiece offers reliable performance and an elegant aesthetic, making it an ideal 'tech' accessory for any modern wardrobe.",
    price: 1499,
    oldPrice: 2799,
    rating: 4.4,
    reviewCount: 1567,
    affiliateLink: "https://amzn.to/4wlvST8",
    features: ["Elegant Silver Dial with Clear Hour Markers","Durable and Flexible Polyurethane Strap","Precision Quartz Movement for Accurate Timekeeping","5 ATM Water Resistance (suitable for splashes and rain)","Sturdy Mineral Glass Dial Window for Scratch Protection","Lightweight Design for All-Day Comfort","Product Model: 87049PP11W"],
    pros: ["Chic and versatile design suitable for various occasions","Comfortable, skin-friendly, and long-lasting polyurethane strap","Reliable quartz movement ensures precise and consistent time","Excellent value for money from a trusted Indian brand","Water-resistant for enhanced everyday practicality"],
    cons: ["Lacks smart features common in many modern 'tech' accessories","Does not include a date display function","Polyurethane strap may not appeal to those preferring leather or metal"],
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: ["Sonata Watch","Women's Watch","Analog Watch","Polyurethane Strap","Silver Dial","Fashion Watch","Casual Watch","Durable Watch","Water Resistant Watch","Tech Accessory","Sonata 87049PP11W"],
  }
];
