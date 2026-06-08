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
    slug: "sony-wh-1000xm5-headphones-review",
    title: "Sony WH-1000XM5 Wireless Headphones Review: Industry-Leading Noise Cancellation",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80",
    category: "tech",
    description: "Read our comprehensive review of the Sony WH-1000XM5 wireless over-ear headphones. Featuring dual processors, eight microphones, and exceptional sound quality, these headphones redefine premium active noise cancellation.",
    price: 24990,
    oldPrice: 34990,
    rating: 4.6,
    reviewCount: 1200,
    affiliateLink: "https://www.amazon.in/dp/B09XS7JWHH?tag=smartpick07d2-21",
    features: ["Industry-leading Active Noise Cancellation with two processors and 8 microphones","Magnificent sound quality with the new Integrated Processor V1","Up to 30 hours of battery life with quick charging (3 min for 3 hours)","Crystal clear hands-free calls with 4 beamforming microphones","Speak-to-chat technology automatically pauses music when you speak"],
    pros: ["Unmatched active noise cancellation isolates you completely from noise.","Extremely comfortable, lightweight design with soft-fit leather.","Clear, detailed sound signature with deep punchy bass."],
    cons: ["The design does not fold completely, taking up more space in bags.","Premium pricing makes them a significant investment."],
    featured: true,
    trending: true,
    dealOfTheDay: true,
    tags: ["Sony WH-1000XM5","Noise Cancelling Headphones","Wireless Audio","Premium Tech"],
  },
  {
    slug: "philips-air-fryer-hd9200-review",
    title: "Philips Air Fryer HD9200 Review: Healthy and Crispy Cooking for Every Home",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80",
    category: "home",
    description: "Discover the Philips Daily Collection Air Fryer HD9200. With Rapid Air Technology and a compact design, it allows you to fry, bake, grill, and roast with up to 90% less fat.",
    price: 6495,
    oldPrice: 8995,
    rating: 4.6,
    reviewCount: 1200,
    affiliateLink: "https://www.amazon.in/dp/B08V8R3RMB?tag=smartpick07d2-21",
    features: ["Rapid Air Technology for healthy, evenly fried crispy dishes","Manually adjustable time and temperature controls","Compact design with a 4.1L capacity, perfect for small families","Easy-to-clean non-stick dishwasher-safe basket","Multifunctional cooking: Fry, bake, grill, roast, and reheat"],
    pros: ["Cooks food with up to 90% less oil, promoting healthier eating.","Very easy to operate with simple dials for time and temperature.","Compact footprint fits easily on standard Indian kitchen counters."],
    cons: ["Lacks digital touch screen presets found on premium models.","Capacity might require cooking in batches for larger family meals."],
    featured: true,
    trending: true,
    dealOfTheDay: true,
    tags: ["Philips Air Fryer","Healthy Appliances","Rapid Air Technology","Kitchen Gear"],
  },
  {
    slug: "lg-32-inch-ultragear-monitor-review",
    title: "LG 32 inch UltraGear Gaming Monitor Review: Immersive QHD Performance",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
    category: "tech",
    description: "We review the LG UltraGear 32-inch QHD gaming monitor. Boasting a fast 165Hz refresh rate and 1ms MBR, it delivers smooth, stutter-free visuals for gaming and productive workspaces.",
    price: 22999,
    oldPrice: 29999,
    rating: 4.6,
    reviewCount: 1200,
    affiliateLink: "https://www.amazon.in/dp/B08V85XBFZ?tag=smartpick07d2-21",
    features: ["Large 32-inch QHD (2560 x 1440) display for stunning visual detail","165Hz refresh rate and 1ms Motion Blur Reduction (MBR)","HDR10 support with sRGB 95% color gamut accuracy","AMD FreeSync Premium compatibility to reduce screen tearing","Virtually borderless design on 3 sides for an immersive setup"],
    pros: ["High refresh rate and low latency make it superb for fast-paced gaming.","Large screen real estate improves productivity in multitasking.","Strong contrast and colors with accurate QHD resolution."],
    cons: ["VA panel has slightly narrower viewing angles than IPS alternatives.","Large stand requires considerable desk depth."],
    featured: true,
    trending: true,
    dealOfTheDay: true,
    tags: ["LG UltraGear","Gaming Monitor","QHD Display","Desktop Tech"],
  },
];
