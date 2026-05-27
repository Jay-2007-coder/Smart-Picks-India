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
    price: 59900,
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
    price: 899,
    oldPrice: 3990,
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
    price: 1879,
    oldPrice: 1995,
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
    price: 899,
    oldPrice: 1495,
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
,
  {
    slug: "noise-two-wireless-on-ear-headphones-review-serene-blue",
    title: "Noise Two Wireless On-Ear Headphones Review: 50Hrs Playtime & Low Latency for Gamers & Music Lovers",
    image: "https://m.media-amazon.com/images/I/517lSvEVVsL._SL1500_.jpg",
    category: "tech",
    description: "Discover the Noise Two Wireless On-Ear Headphones in Serene Blue, offering an incredible 50 hours of playtime and ultra-low latency perfect for gaming and immersive audio. With Dual Pairing and 4 Play Modes, these headphones redefine convenience and sound quality for their price point. Dive into our expert review to see why they're a must-have tech gadget.",
    price: 1699,
    oldPrice: 3999,
    rating: 4.4,
    reviewCount: 1500,
    affiliateLink: "https://amzn.to/4denrAp",
    features: ["Upto 50 Hours of Massive Playtime on a Single Charge","Ultra-Low Latency (up to 45ms) for Lag-Free Gaming & Video","Advanced Bluetooth v5.3 for Stable & Seamless Connectivity","Dual Pairing Feature for Connecting Two Devices Simultaneously","4 Distinct Play Modes (e.g., Standard, Bass Boost, Gaming Mode) for Versatile Audio","Comfortable On-Ear Design with Plush Earcups","Integrated Controls for Music, Calls, and Voice Assistant"],
    pros: ["Exceptional Battery Life eliminates frequent charging worries, ideal for long commutes or travel.","Remarkably Low Latency makes it perfect for mobile gaming and watching videos without audio-visual sync issues.","Dual Pairing allows effortless switching between your phone and laptop, enhancing productivity and convenience.","Multiple Play Modes cater to different listening preferences, from punchy bass to clear vocals."],
    cons: ["On-ear design may not offer the same level of passive noise isolation as over-ear headphones.","Lack of active noise cancellation (ANC) might be a drawback for very noisy environments, though expected at this price."],
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: ["Noise Two","Wireless Headphones","On-Ear Headphones","Bluetooth Headphones","Low Latency Headphones","Gaming Headphones","Long Battery Life","Noise Two Review","Tech Gadgets","Affiliate Review"],
  }
,
  {
    slug: "boat-rockerz-480-rgb-wireless-headphones-review",
    title: "boAt Rockerz 480 Review: RGB Vibes, Beast Mode Audio & Epic Battery Life? (White Sabre)",
    image: "https://m.media-amazon.com/images/I/61cIHzCDl6L._SL1500_.jpg",
    category: "tech",
    description: "Dive into an immersive audio experience with the boAt Rockerz 480 wireless headphones, boasting vibrant RGB LEDs, powerful 40mm drivers, and an incredible 60-hour battery. Perfect for gamers, music lovers, and anyone seeking style and substance, these over-ear headphones deliver exceptional sound and a striking visual appeal in their sleek White Sabre finish.",
    price: 1799,
    oldPrice: 3790,
    rating: 4.3,
    reviewCount: 2350,
    affiliateLink: "https://amzn.to/4ngvDVa",
    features: ["Vibrant RGB LEDs with 6 Light Modes","Powerful 40mm Dynamic Drivers for Immersive Audio","Beast Mode™ for Ultra-Low Latency Gaming","Massive 60 Hours Total Playback","ENx™ Technology for Crystal-Clear Call Quality"],
    pros: ["Stunning RGB Lighting with Customization Options","Exceptional 60-Hour Battery Life for Prolonged Use","Immersive Audio with 40mm Drivers & Dedicated Low Latency Beast Mode"],
    cons: ["Potentially bulky design might not suit all users for extended periods.","Full feature access and ad-free music streaming dependent on the boAt Hearables App."],
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: ["boAt Rockerz 480","Wireless RGB Headphones","Beast Mode Gaming","Over-Ear Bluetooth","60H Battery"],
  }
,
  {
    slug: "boat-rockerz-411-wireless-headphones-review",
    title: "Boat Rockerz 411 Review: Ultimate Wireless Headphones for Gamers & Music Enthusiasts",
    image: "https://m.media-amazon.com/images/I/71QdB7hDCAL._SL1500_.jpg",
    category: "tech",
    description: "Dive into an immersive audio experience with the Boat Rockerz 411 wireless headphones. Featuring ultra-low 40ms latency, 40 hours of playback, and powerful 40mm drivers, these over-ear headphones deliver exceptional sound for gaming, music, and calls. Enjoy crystal-clear communication with ENx™ Tech and seamless ad-free music streaming via app support.",
    price: 1499,
    oldPrice: 3990,
    rating: 4.4,
    reviewCount: 1500,
    affiliateLink: "https://amzn.to/4uDUh4A",
    features: ["Ultra-Low 40ms Latency: Perfect for gaming and seamless video synchronization.","Epic 40-Hour Playback: Enjoy extended listening sessions without constant recharging.","Powerful 40mm Dynamic Drivers: Delivers rich, immersive audio with deep bass and clear highs.","ENx™ Technology for Clear Calls: Ensures your voice is heard loud and clear during calls, even in noisy environments.","App Support with Ad-Free Music Streaming: Unlock additional features and enjoy your favorite tunes without interruptions."],
    pros: ["Immersive Audio with Gaming-Grade Latency: Experience lag-free sound for an edge in games and perfectly synced media.","Unmatched Battery Endurance: Go days without charging, making them ideal for travel and long commutes.","Superior Call Clarity: ENx™ tech makes conference calls and voice chats remarkably clear."],
    cons: ["Bulky Over-Ear Design: May not be preferred by users looking for a more compact or discreet headphone option.","App-Dependent Features: Full functionality of ad-free streaming and other controls might rely on the companion app, potentially draining phone battery or requiring updates."],
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: ["Boat Rockerz","Wireless Over-Ear Headphones","Low Latency Gaming Audio"],
  }
,
  {
    slug: "boat-rockerz-plus-550-wireless-headphones-review",
    title: "Boat Rockerz Plus 550 Review: 100H Battery, 50mm Drivers & Customizable Earcups – Your Ultimate Wireless Audio Companion!",
    image: "https://m.media-amazon.com/images/I/81lYNV0dX3L._SL1500_.jpg",
    category: "",
    description: "Experience unparalleled audio with the Boat Rockerz Plus 550 wireless headphones, boasting an incredible 100H battery life and powerful 50mm drivers. Personalize your style with customizable earcups and enjoy seamless connectivity with dual pairing and ad-free music streaming via its dedicated app. Dive into an immersive sound journey with these feature-packed Bluetooth headphones in Blue Psyche.",
    price: 1999,
    oldPrice: 4490,
    rating: 4.4,
    reviewCount: 2150,
    affiliateLink: "https://amzn.to/49neG5M",
    features: ["Massive 100-Hour Playback on a single charge","Powerful 50mm Dynamic Audio Drivers for rich sound","Customizable Earcups for personalized style and comfort","Dual Pairing function for seamless switching between two devices","Dedicated App Support for ad-free music streaming and enhanced controls","Integrated Microphone for crystal-clear hands-free calling","Ergonomic Over-Ear Design in stylish Blue Psyche finish","Latest Bluetooth connectivity for stable wireless experience"],
    pros: ["Exceptional 100-hour battery life eliminates frequent charging worries.","Immersive and powerful audio performance from large 50mm drivers.","Personalize your look and comfort with easily swappable earcups.","Effortlessly switch between your phone and laptop with Dual Pairing.","Access ad-free music and unlock more features via the companion app.","Clear voice quality for calls with the built-in microphone."],
    cons: ["Lacks Active Noise Cancellation (ANC), which some competitors offer at similar price points.","Customizable earcups might mean additional purchases for different designs.","App features and 'ad-free music' might require specific subscriptions or internet access.","May feel slightly bulky for users preferring more compact or on-ear headphones."],
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: ["Boat Rockerz Plus 550","Wireless Headphones","Bluetooth Headphones","100 Hour Battery","50mm Drivers","Customizable Earcups","Dual Pair","Ad-Free Music","Headphones with Mic","Affiliate Review","India","Blue Psyche"],
  }
];
