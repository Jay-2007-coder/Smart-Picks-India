import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Search, ShoppingCart } from 'lucide-react-native';
import { COLORS } from '../theme';

export default function DealsScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Tech', 'Gadgets', 'Kitchen', 'Home', 'Fashion'];

  const deals = [
    {
      id: '1',
      title: 'boAt Airdopes Plus 311 TWS Earbuds',
      price: '₹999',
      oldPrice: '₹3,999',
      category: 'Gadgets',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0CXPR5M93?tag=smartpicks03a-21',
    },
    {
      id: '2',
      title: 'Noise Two Wireless On-Ear Headphones',
      price: '₹1,699',
      oldPrice: '₹4,999',
      category: 'Gadgets',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0B647DGB9?tag=smartpicks03a-21',
    },
    {
      id: '3',
      title: 'Lenovo LOQ 2024 Gaming Laptop i5-12450HX',
      price: '₹78,990',
      oldPrice: '₹96,590',
      category: 'Tech',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0D1YH49X4?tag=smartpicks03a-21',
    },
    {
      id: '4',
      title: 'ASUS TUF A15 Gaming Laptop Ryzen 7',
      price: '₹68,990',
      oldPrice: '₹83,990',
      category: 'Tech',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0CXP8C7NW?tag=smartpicks03a-21',
    },
  ];

  const filteredDeals = deals.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || d.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Smart Deals</Text>
        <View style={styles.searchBar}>
          <Search color={COLORS.textMuted} size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search deals, products..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.dealsGrid}>
        {filteredDeals.map((deal) => (
          <TouchableOpacity
            key={deal.id}
            style={styles.dealCard}
            onPress={() => WebBrowser.openBrowserAsync(deal.affiliateLink)}
          >
            <Image source={{ uri: deal.image }} style={styles.dealImage} />
            <View style={styles.cardContent}>
              <Text style={styles.dealTitle} numberOfLines={2}>{deal.title}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{deal.price}</Text>
                <Text style={styles.oldPrice}>{deal.oldPrice}</Text>
              </View>
              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() => WebBrowser.openBrowserAsync(deal.affiliateLink)}
              >
                <ShoppingCart color="#ffffff" size={12} />
                <Text style={styles.buyBtnText}>Buy on Amazon</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 13, marginLeft: 8 },
  catScroll: { flexDirection: 'row' },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  catPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#ffffff', fontWeight: '800' },
  dealsGrid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dealCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  dealImage: { width: '100%', height: 120, backgroundColor: '#1e293b' },
  cardContent: { padding: 10 },
  dealTitle: { color: '#ffffff', fontSize: 12, fontWeight: '700', height: 34 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginVertical: 6 },
  price: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  oldPrice: { color: COLORS.textMuted, fontSize: 10, textDecorationLine: 'line-through' },
  buyBtn: {
    backgroundColor: '#1e3a5f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  buyBtnText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
});
