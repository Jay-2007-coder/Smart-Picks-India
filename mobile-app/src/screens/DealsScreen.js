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
import { Search, ShoppingCart, Star, X, Check, AlertCircle, ShieldCheck } from 'lucide-react-native';
import { COLORS } from '../theme';
import { products, Product } from '../data/products';

export default function DealsScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['all', 'tech', 'gadgets', 'home', 'kitchen', 'fashion'];

  const filteredDeals = products.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      (d.tags && d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    const matchesCat = activeCategory === 'all' || d.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Verified Amazon Deals</Text>
        <View style={styles.searchBar}>
          <Search color={COLORS.textMuted} size={16} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search 25+ deals, iPhones, laptops..."
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
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.dealsGrid} showsVerticalScrollIndicator={false}>
        {filteredDeals.map((deal) => {
          const discountPct = Math.round(((deal.oldPrice - deal.price) / deal.oldPrice) * 100);
          return (
            <TouchableOpacity
              key={deal.slug}
              style={styles.dealCard}
              onPress={() => setSelectedProduct(deal)}
            >
              <Image source={{ uri: deal.image }} style={styles.dealImage} />
              {discountPct > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discountPct}% OFF</Text>
                </View>
              )}

              <View style={styles.cardContent}>
                <Text style={styles.dealTitle} numberOfLines={2}>{deal.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{deal.price.toLocaleString('en-IN')}</Text>
                  <Text style={styles.oldPrice}>₹{deal.oldPrice.toLocaleString('en-IN')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={() => setSelectedProduct(deal)}
                >
                  <Text style={styles.detailsBtnText}>View Full Review & Specs</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* FULLSCREEN NATIVE PRODUCT DETAIL MODAL */}
      <Modal visible={!!selectedProduct} animationType="slide" transparent={false}>
        {selectedProduct && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedProduct(null)} style={styles.closeBtn}>
                <X color="#ffffff" size={20} />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>Product Expert Review</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image source={{ uri: selectedProduct.image }} style={styles.productModalImage} />

              <View style={styles.productBody}>
                <View style={styles.ratingRow}>
                  <Star color="#eab308" size={14} fill="#eab308" />
                  <Text style={styles.ratingText}>{selectedProduct.rating} ({selectedProduct.reviewCount} reviews)</Text>
                  <Text style={styles.categoryBadge}>{selectedProduct.category.toUpperCase()}</Text>
                </View>

                <Text style={styles.productTitle}>{selectedProduct.title}</Text>

                <View style={styles.priceBox}>
                  <View style={styles.priceRowBig}>
                    <Text style={styles.priceBig}>₹{selectedProduct.price.toLocaleString('en-IN')}</Text>
                    <Text style={styles.oldPriceBig}>₹{selectedProduct.oldPrice.toLocaleString('en-IN')}</Text>
                    <View style={styles.discountBadgeBig}>
                      <Text style={styles.discountTextBig}>
                        {Math.round(((selectedProduct.oldPrice - selectedProduct.price) / selectedProduct.oldPrice) * 100)}% OFF
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.priceSub}>Lowest verified 90-day price on Amazon India</Text>
                </View>

                <Text style={styles.descText}>{selectedProduct.description}</Text>

                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.specsTitle}>Key Highlights:</Text>
                    {selectedProduct.features.map((feat, idx) => (
                      <View key={idx} style={styles.specRow}>
                        <Check color="#22c55e" size={16} />
                        <Text style={styles.specText}>{feat}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedProduct.pros && selectedProduct.pros.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.prosTitle}>Why You Should Buy (Pros):</Text>
                    {selectedProduct.pros.map((pro, idx) => (
                      <View key={idx} style={styles.specRow}>
                        <Check color="#22c55e" size={16} />
                        <Text style={styles.specText}>{pro}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedProduct.cons && selectedProduct.cons.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.consTitle}>Keep In Mind (Cons):</Text>
                    {selectedProduct.cons.map((con, idx) => (
                      <View key={idx} style={styles.specRow}>
                        <AlertCircle color="#ef4444" size={16} />
                        <Text style={styles.specText}>{con}</Text>
                      </View>
                    ))}
                  </View>
                )}

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
  catText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  catTextActive: { color: '#ffffff', fontWeight: '900' },
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
  dealImage: { width: '100%', height: 130, backgroundColor: '#1e293b' },
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
  detailsBtnText: { color: COLORS.accent, fontSize: 10, fontWeight: '700' },

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
  productModalImage: { width: '100%', height: 260, backgroundColor: '#1e293b' },
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
  descText: { color: '#f8fafc', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  sectionBlock: { marginBottom: 20 },
  specsTitle: { color: '#ffffff', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  prosTitle: { color: '#22c55e', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  consTitle: { color: '#ef4444', fontSize: 14, fontWeight: '800', marginBottom: 10 },
  specRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  specText: { color: '#f8fafc', fontSize: 13, flex: 1, lineHeight: 18 },
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
