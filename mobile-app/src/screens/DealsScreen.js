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
  Modal,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Search, ShoppingCart, Star, X, Check, ShieldCheck, Flame } from 'lucide-react-native';
import { COLORS } from '../theme';

export default function DealsScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['All', 'Tech', 'Gadgets', 'Kitchen', 'Home', 'Fashion'];

  const deals = [
    {
      id: '1',
      title: 'boAt Airdopes Plus 311 TWS Earbuds',
      price: '₹999',
      oldPrice: '₹3,999',
      discount: '75% OFF',
      rating: 4.4,
      reviews: '1,850',
      category: 'Gadgets',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0CXPR5M93?tag=smartpicks03a-21',
      specs: ['50 Hours Playback', 'ENx Noise Cancellation', 'ASAP Fast Charge (10 min = 150 mins)'],
    },
    {
      id: '2',
      title: 'Noise Two Wireless On-Ear Headphones',
      price: '₹1,699',
      oldPrice: '₹4,999',
      discount: '66% OFF',
      rating: 4.4,
      reviews: '1,500',
      category: 'Gadgets',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0B647DGB9?tag=smartpicks03a-21',
      specs: ['50 Hours Battery Life', '40mm Drivers', 'Dual Pairing & Low Latency Mode'],
    },
    {
      id: '3',
      title: 'Lenovo LOQ 2024 Gaming Laptop i5-12450HX',
      price: '₹78,990',
      oldPrice: '₹96,590',
      discount: '18% OFF',
      rating: 4.3,
      reviews: '1,847',
      category: 'Tech',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0D1YH49X4?tag=smartpicks03a-21',
      specs: ['Intel Core i5-12450HX', '16GB DDR5 RAM', 'NVIDIA RTX 3050 6GB', '144Hz FHD Display'],
    },
    {
      id: '4',
      title: 'ASUS TUF A15 Gaming Laptop Ryzen 7',
      price: '₹68,990',
      oldPrice: '₹83,990',
      discount: '18% OFF',
      rating: 4.4,
      reviews: '1,823',
      category: 'Tech',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0CXP8C7NW?tag=smartpicks03a-21',
      specs: ['AMD Ryzen 7 7435HS', '16GB DDR5 RAM', 'NVIDIA RTX 3050', '144Hz FHD Display'],
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
        <Text style={styles.title}>Explore Native Smart Deals</Text>
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

      <ScrollView contentContainerStyle={styles.dealsGrid} showsVerticalScrollIndicator={false}>
        {filteredDeals.map((deal) => (
          <TouchableOpacity
            key={deal.id}
            style={styles.dealCard}
            onPress={() => setSelectedProduct(deal)}
          >
            <Image source={{ uri: deal.image }} style={styles.dealImage} />
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{deal.discount}</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.dealTitle} numberOfLines={2}>{deal.title}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{deal.price}</Text>
                <Text style={styles.oldPrice}>{deal.oldPrice}</Text>
              </View>
              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => setSelectedProduct(deal)}
              >
                <Text style={styles.detailsBtnText}>View Product</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FULLSCREEN NATIVE PRODUCT DETAIL MODAL */}
      <Modal visible={!!selectedProduct} animationType="slide" transparent={false}>
        {selectedProduct && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedProduct(null)} style={styles.closeBtn}>
                <X color="#ffffff" size={20} />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Product Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image source={{ uri: selectedProduct.image }} style={styles.productModalImage} />

              <View style={styles.productBody}>
                <View style={styles.ratingRow}>
                  <Star color="#eab308" size={14} fill="#eab308" />
                  <Text style={styles.ratingText}>{selectedProduct.rating} ({selectedProduct.reviews} reviews)</Text>
                  <Text style={styles.categoryBadge}>{selectedProduct.category}</Text>
                </View>

                <Text style={styles.productTitle}>{selectedProduct.title}</Text>

                <View style={styles.priceBox}>
                  <View style={styles.priceRowBig}>
                    <Text style={styles.priceBig}>{selectedProduct.price}</Text>
                    <Text style={styles.oldPriceBig}>{selectedProduct.oldPrice}</Text>
                    <View style={styles.discountBadgeBig}>
                      <Text style={styles.discountTextBig}>{selectedProduct.discount}</Text>
                    </View>
                  </View>
                  <Text style={styles.priceSub}>Lowest verified price on Amazon India</Text>
                </View>

                <Text style={styles.specsTitle}>Key Specifications:</Text>
                {selectedProduct.specs.map((spec, idx) => (
                  <View key={idx} style={styles.specRow}>
                    <Check color="#22c55e" size={16} />
                    <Text style={styles.specText}>{spec}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.buyAmazonBtn}
                  onPress={() => WebBrowser.openBrowserAsync(selectedProduct.affiliateLink)}
                >
                  <ShoppingCart color="#ffffff" size={18} />
                  <Text style={styles.buyAmazonText}>Buy Directly on Amazon India</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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
  dealsGrid: { padding: 16, paddingBottom: 40, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
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
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: { color: '#ffffff', fontSize: 9, fontWeight: '900' },
  cardContent: { padding: 10 },
  dealTitle: { color: '#ffffff', fontSize: 12, fontWeight: '700', height: 34 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginVertical: 6 },
  price: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  oldPrice: { color: COLORS.textMuted, fontSize: 10, textDecorationLine: 'line-through' },
  detailsBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  detailsBtnText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },

  // PRODUCT MODAL STYLES
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    backgroundColor: COLORS.primaryDark,
  },
  closeBtn: { padding: 4 },
  modalHeaderTitle: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  modalContent: { paddingBottom: 40 },
  productModalImage: { width: '100%', height: 240, backgroundColor: '#1e293b' },
  productBody: { padding: 20 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  ratingText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  categoryBadge: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  productTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', lineHeight: 24, marginBottom: 16 },
  priceBox: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  priceRowBig: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  priceBig: { color: '#ffffff', fontSize: 24, fontWeight: '900' },
  oldPriceBig: { color: COLORS.textMuted, fontSize: 14, textDecorationLine: 'line-through' },
  discountBadgeBig: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 'auto' },
  discountTextBig: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  priceSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  specsTitle: { color: '#ffffff', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  specText: { color: '#f8fafc', fontSize: 13 },
  buyAmazonBtn: {
    backgroundColor: '#1e3a5f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(99,155,255,0.3)',
  },
  buyAmazonText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
});
