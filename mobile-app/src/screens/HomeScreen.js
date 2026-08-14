import React from 'react';
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
import { ShoppingCart, Flame, Star, Sparkles, TrendingUp, GraduationCap, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../theme';
import { products } from '../data/products';

export default function HomeScreen({ navigation }) {
  const flashSales = products.filter((p) => p.oldPrice > p.price).slice(0, 5);
  const dealOfTheDay = products.find((p) => p.dealOfTheDay) || products[0];

  const openAmazon = (url) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.badgeContainer}>
            <Sparkles color="#f97316" size={14} />
            <Text style={styles.badgeText}>SMART PICKS INDIA</Text>
          </View>
          <Text style={styles.heroTitle}>Verified Amazon Price Drop Tracker</Text>
          <Text style={styles.heroSub}>Track 90-day price history, student placement guides, and daily Amazon drops.</Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => navigation.navigate('Deals')}
          >
            <Flame color="#ffffff" size={16} />
            <Text style={styles.heroButtonText}>Explore 25+ Live Deals</Text>
          </TouchableOpacity>
        </View>

        {/* Student Hub Card */}
        <TouchableOpacity
          style={styles.studentBanner}
          onPress={() => navigation.navigate('StudentHub')}
        >
          <View style={styles.studentLeft}>
            <GraduationCap color="#f97316" size={24} />
            <View>
              <Text style={styles.studentTitle}>Student Placement Hub</Text>
              <Text style={styles.studentSub}>ATS Resume Checker & CGPA Predictor</Text>
            </View>
          </View>
          <ChevronRight color={COLORS.accent} size={18} />
        </TouchableOpacity>

        {/* Deal of the Day */}
        {dealOfTheDay && (
          <View style={styles.dodCard}>
            <View style={styles.dodBadge}>
              <Flame color="#ffffff" size={12} />
              <Text style={styles.dodBadgeText}>DEAL OF THE DAY</Text>
            </View>
            <Image source={{ uri: dealOfTheDay.image }} style={styles.dodImage} />
            <Text style={styles.dodTitle} numberOfLines={2}>{dealOfTheDay.title}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{dealOfTheDay.price.toLocaleString('en-IN')}</Text>
              <Text style={styles.oldPrice}>₹{dealOfTheDay.oldPrice.toLocaleString('en-IN')}</Text>
              <Text style={styles.discountTag}>
                {Math.round(((dealOfTheDay.oldPrice - dealOfTheDay.price) / dealOfTheDay.oldPrice) * 100)}% OFF
              </Text>
            </View>
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => openAmazon(dealOfTheDay.affiliateLink)}
            >
              <ShoppingCart color="#ffffff" size={14} />
              <Text style={styles.buyBtnText}>Buy on Amazon India</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Flash Sales List */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <TrendingUp color="#f97316" size={18} />
            <Text style={styles.sectionTitle}>Trending Verified Deals</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Deals')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {flashSales.map((item) => {
          const discountPct = Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100);
          return (
            <TouchableOpacity
              key={item.slug}
              style={styles.dealCard}
              activeOpacity={0.9}
              onPress={() => openAmazon(item.affiliateLink)}
            >
              <Image source={{ uri: item.image }} style={styles.dealImage} />
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discountPct}% OFF</Text>
              </View>

              <View style={styles.dealInfo}>
                <Text style={styles.dealTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.ratingRow}>
                  <Star color="#eab308" size={12} fill="#eab308" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.categoryTag}>{item.category.toUpperCase()}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
                  <Text style={styles.oldPrice}>₹{item.oldPrice.toLocaleString('en-IN')}</Text>
                </View>

                <TouchableOpacity
                  style={styles.buyBtnSmall}
                  onPress={() => openAmazon(item.affiliateLink)}
                >
                  <ShoppingCart color="#ffffff" size={12} />
                  <Text style={styles.buyBtnTextSmall}>Buy on Amazon</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 16,
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
  heroTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
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
  studentBanner: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  studentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  studentTitle: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  studentSub: { color: COLORS.textMuted, fontSize: 11 },
  dodCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  dodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  dodBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
  dodImage: { width: '100%', height: 180, borderRadius: 12, backgroundColor: '#1e293b', marginBottom: 12 },
  dodTitle: { color: '#ffffff', fontSize: 15, fontWeight: '800', lineHeight: 20, marginBottom: 8 },
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
    fontSize: 9,
    marginLeft: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 },
  price: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  oldPrice: { color: COLORS.textMuted, fontSize: 12, textDecorationLine: 'line-through' },
  discountTag: { color: '#22c55e', fontSize: 11, fontWeight: '800', marginLeft: 4 },
  buyBtn: {
    backgroundColor: '#1e3a5f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  buyBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  buyBtnSmall: {
    backgroundColor: '#1e3a5f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buyBtnTextSmall: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
});
