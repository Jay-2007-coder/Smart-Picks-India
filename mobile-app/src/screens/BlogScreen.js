import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
} from 'react-native';
import { BookOpen, Clock, ChevronRight, X, Sparkles, Share2, Check } from 'lucide-react-native';
import { COLORS } from '../theme';

export default function BlogScreen() {
  const [selectedBlog, setSelectedBlog] = useState(null);

  const [blogs] = useState([
    {
      slug: 'must-know-ai-tools-developer-technologies-2026',
      title: 'Must-Know AI Tools & Developer Technologies for 2026',
      excerpt: 'A comprehensive guide to AI coding assistants, modern frameworks, and open-source models for Indian developers.',
      category: 'Tech Trends',
      readTime: '7 min read',
      date: 'Aug 14, 2026',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      sections: [
        {
          heading: '1. AI Coding Assistants & Agentic Workflows',
          content: 'Modern software development in 2026 relies heavily on AI coding agents. Tools like Antigravity, GitHub Copilot, and Cursor have transformed developer productivity by generating multi-file implementations, running automated tests, and handling environment setups seamlessly.',
        },
        {
          heading: '2. Open-Source LLMs & Local Inference',
          content: 'Running local LLMs (like Llama 3 & DeepSeek) on Apple Silicon or RTX GPUs allows developers to write code without exposing private company repositories to cloud APIs.',
        },
        {
          heading: '3. Full-Stack Next.js 15 & React 19',
          content: 'React 19 Server Actions, Server Components, and Streaming SSR provide ultra-fast page load times and zero-bundle-size rendering for modern Indian e-commerce and SaaS platforms.',
        },
      ],
    },
    {
      slug: 'complete-placement-preparation-guide',
      title: 'Complete Campus Placement Guide for Engineering Students',
      excerpt: 'Your step-by-step roadmap to campus placements — from building an ATS-optimised resume to cracking coding interviews.',
      category: 'Career & Student',
      readTime: '8 min read',
      date: 'Aug 12, 2026',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
      sections: [
        {
          heading: '1. Crafting a 100% ATS-Compliant Resume',
          content: 'Keep your resume strictly to a single page. Avoid multi-column templates, icons, or graphics. Use clean headings (Education, Technical Skills, Projects, Experience) and action verbs like Built, Architected, and Scaled.',
        },
        {
          heading: '2. Data Structures & Algorithms Roadmap',
          content: 'Master Core DSA patterns: Two Pointers, Sliding Window, Binary Search, Trees, and Dynamic Programming. Practice 150 curated LeetCode questions before placement season begins.',
        },
      ],
    },
    {
      slug: 'smart-buying-guide-best-budget-deals',
      title: 'Smart Buying Guide — Best Budget Tech Deals in India',
      excerpt: 'Discover verified deals on electronics, home essentials, and gadgets checked against 90-day price history.',
      category: 'Buying Guides',
      readTime: '6 min read',
      date: 'Aug 10, 2026',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
      sections: [
        {
          heading: '1. Always Verify Price History',
          content: 'Never buy based on inflated MSRP discounts. Check price tracking history to ensure the current price is a real 90-day low.',
        },
        {
          heading: '2. TWS Earbuds & Laptops Under Budget',
          content: 'Look for ANC, fast charging, and manufacturer warranty coverage when picking audio gear and laptops under ₹20,000.',
        },
      ],
    },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BookOpen color="#f97316" size={24} />
          <Text style={styles.headerTitle}>Smart Picks Native Journal</Text>
        </View>

        {blogs.map((b) => (
          <TouchableOpacity key={b.slug} style={styles.blogCard} onPress={() => setSelectedBlog(b)}>
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
                <Text style={styles.readMoreText}>Read Article Inside App</Text>
                <ChevronRight color={COLORS.accent} size={14} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FULLSCREEN NATIVE ARTICLE READER MODAL */}
      <Modal visible={!!selectedBlog} animationType="slide" transparent={false}>
        {selectedBlog && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedBlog(null)} style={styles.closeBtn}>
                <X color="#ffffff" size={20} />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>{selectedBlog.category}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image source={{ uri: selectedBlog.image }} style={styles.readerImage} />

              <View style={styles.readerBody}>
                <View style={styles.metaRow}>
                  <Text style={styles.catBadge}>{selectedBlog.category}</Text>
                  <Text style={styles.readTime}>{selectedBlog.date} • {selectedBlog.readTime}</Text>
                </View>

                <Text style={styles.readerTitle}>{selectedBlog.title}</Text>
                <Text style={styles.readerExcerpt}>{selectedBlog.excerpt}</Text>

                <View style={styles.divider} />

                {selectedBlog.sections.map((sec, idx) => (
                  <View key={idx} style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>{sec.heading}</Text>
                    <Text style={styles.sectionContent}>{sec.content}</Text>
                  </View>
                ))}
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
  content: { padding: 16, paddingBottom: 40 },
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

  // MODAL READER STYLES
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
  readerImage: { width: '100%', height: 220 },
  readerBody: { padding: 20 },
  readerTitle: { color: '#ffffff', fontSize: 22, fontWeight: '800', lineHeight: 28, marginTop: 10, marginBottom: 8 },
  readerExcerpt: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 20 },
  sectionBlock: { marginBottom: 20 },
  sectionHeading: { color: COLORS.accent, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  sectionContent: { color: '#f8fafc', fontSize: 14, lineHeight: 22 },
});
