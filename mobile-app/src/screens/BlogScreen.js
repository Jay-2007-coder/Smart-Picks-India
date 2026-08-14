import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { BookOpen, Clock, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../theme';

export default function BlogScreen() {
  const [blogs] = useState([
    {
      slug: 'must-know-ai-tools-developer-technologies-2026',
      title: 'Must-Know AI Tools & Developer Technologies for 2026',
      excerpt: 'A comprehensive guide to AI coding assistants, modern frameworks, and open-source models.',
      category: 'tech-trends',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    },
    {
      slug: 'complete-placement-preparation-guide',
      title: 'Complete Campus Placement Guide for Engineering Students',
      excerpt: 'Your step-by-step roadmap to campus placements — from building an ATS-optimised resume to cracking interviews.',
      category: 'student-hub',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    },
    {
      slug: 'smart-buying-guide-best-budget-deals',
      title: 'Smart Buying Guide — Best Budget Deals in India',
      excerpt: 'Discover verified deals on electronics, home essentials, and lifestyle gear verified against 90-day price history.',
      category: 'buying-guides',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
    },
  ]);

  const openBlog = (slug) => {
    WebBrowser.openBrowserAsync(`https://smart-picks-india.vercel.app/blog/${slug}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BookOpen color="#f97316" size={24} />
          <Text style={styles.headerTitle}>Smart Picks Journal</Text>
        </View>

        {blogs.map((b) => (
          <TouchableOpacity key={b.slug} style={styles.blogCard} onPress={() => openBlog(b.slug)}>
            <Image source={{ uri: b.image }} style={styles.blogImage} />
            <View style={styles.blogInfo}>
              <View style={styles.metaRow}>
                <Text style={styles.catBadge}>{b.category}</Text>
                <View style={styles.timeRow}>
                  <Clock color={COLORS.textMuted} size={10} />
                  <Text style={styles.readTime}>{b.readTime}</Text>
                </View>
              </View>

              <Text style={styles.blogTitle}>{b.title}</Text>
              <Text style={styles.blogExcerpt} numberOfLines={2}>{b.excerpt}</Text>

              <View style={styles.readMoreRow}>
                <Text style={styles.readMoreText}>Read Full Article</Text>
                <ChevronRight color={COLORS.accent} size={14} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  blogCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  blogImage: { width: '100%', height: 150, backgroundColor: '#1e293b' },
  blogInfo: { padding: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catBadge: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readTime: { color: COLORS.textMuted, fontSize: 10 },
  blogTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 6, lineHeight: 20 },
  blogExcerpt: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17, marginBottom: 12 },
  readMoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readMoreText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
});
