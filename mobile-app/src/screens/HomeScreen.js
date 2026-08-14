import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ShoppingCart, Flame, Star, Sparkles } from 'lucide-react-native';
import { COLORS } from '../theme';

export default function HomeScreen({ navigation }) {
  const [featured] = useState([
    {
      id: '1',
      title: 'boAt Airdopes Plus 311 TWS Earbuds',
      price: '₹999',
      oldPrice: '₹3,999',
      discount: '75% OFF',
      rating: 4.4,
      category: 'Gadgets',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0CXPR5M93?tag=smartpicks03a-21',
    },
    {
      id: '2',
      title: 'Noise Two Wireless On-Ear Headphones',
      price: '₹1,699',
      oldPrice: '₹4,999',
      discount: '66% OFF',
      rating: 4.4,
      category: 'Gadgets',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0B647DGB9?tag=smartpicks03a-21',
    },
    {
      id: '3',
      title: 'Lenovo LOQ 2024 Gaming Laptop i5-12450HX',
      price: '₹78,990',
      oldPrice: '₹96,590',
      discount: '18% OFF',
      rating: 4.3,
      category: 'Tech',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
      affiliateLink: 'https://www.amazon.in/dp/B0D1YH49X4?tag=smartpicks03a-21',
    },
  ]);

  const openAmazon = (url) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroBanner}>
          <View style={styles.badgeContainer}>
            <Sparkles color="#f97316" size={14} />
            <Text style={styles.badgeText}>SMART PICKS INDIA</Text>
          </View>
          <Text style={styles.heroTitle}>India's Best Verified Deals</Text>
          <Text style={styles.heroSub}>Track price history, placement guides, and daily Amazon drops.</Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => navigation.navigate('Deals')}
          >
            <Flame color="#ffffff" size={16} />
            <Text style={styles.heroButtonText}>Explore Flash Sales</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Flame color="#f97316" size={18} />
            <Text style={styles.sectionTitle}>Featured Flash Sales</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Deals')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {featured.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.dealCard}
            activeOpacity={0.9}
            onPress={() => openAmazon(item.affiliateLink)}
          >
            <Image source={{ uri: item.image }} style={styles.dealImage} />
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}</Text>
            </View>

            <View style={styles.dealInfo}>
              <Text style={styles.dealTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.ratingRow}>
                <Star color="#eab308" size={12} fill="#eab308" />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.categoryTag}>{item.category}</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.oldPrice}>{item.oldPrice}</Text>
              </View>

              <TouchableOpacity
                style={styles.buyBtn}
                onPress={() => openAmazon(item.affiliateLink)}
              >
                <ShoppingCart color="#ffffff" size={14} />
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  heroBanner: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 24,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: { color: COLORS.accent, fontSize: 10, fontWeight: '800' },
  heroTitle: { color: '#ffffff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  heroSub: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 16 },
  heroButton: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  heroButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  viewAll: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  dealCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
  },
  dealImage: { width: 120, height: 140, backgroundColor: '#1e293b' },
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
  dealInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  dealTitle: { color: '#ffffff', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 4 },
  ratingText: { color: '#f8fafc', fontSize: 11, fontWeight: '600' },
  categoryTag: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginLeft: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 },
  price: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  oldPrice: { color: COLORS.textMuted, fontSize: 12, textDecorationLine: 'line-through' },
  buyBtn: {
    backgroundColor: '#1e3a5f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99,155,255,0.2)',
  },
  buyBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
});
