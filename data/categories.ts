export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  color: string;
  count: number;
}

export const categories: Category[] = [
  {
    slug: "tech",
    name: "Tech & Electronics",
    description: "Smartphones, laptops, accessories and more",
    icon: "💻",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
    color: "from-blue-500 to-indigo-600",
    count: 0,
  },
  {
    slug: "kitchen",
    name: "Kitchen & Cooking",
    description: "Smart kitchen gadgets and appliances",
    icon: "🍳",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    color: "from-orange-400 to-red-500",
    count: 0,
  },
  {
    slug: "home",
    name: "Home & Living",
    description: "Decor, furniture and home essentials",
    icon: "🏠",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    color: "from-green-400 to-emerald-600",
    count: 0,
  },
  {
    slug: "gadgets",
    name: "Gadgets & Accessories",
    description: "Cool gadgets and smart accessories",
    icon: "🔧",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    color: "from-purple-500 to-pink-500",
    count: 0,
  },
  {
    slug: "fashion",
    name: "Fashion & Style",
    description: "Trendy clothes, bags and accessories",
    icon: "👗",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
    color: "from-pink-400 to-rose-600",
    count: 0,
  },
  {
    slug: "study",
    name: "Study & Office",
    description: "Stationery, lamps and study essentials",
    icon: "📚",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    color: "from-yellow-400 to-amber-600",
    count: 0,
  },
];
