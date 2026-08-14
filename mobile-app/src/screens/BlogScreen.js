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
import { BookOpen, Clock, ChevronRight, X, Calendar, Tag } from 'lucide-react-native';
import { COLORS } from '../theme';
import { blogPosts, BlogPost } from '../data/blogPosts';

export default function BlogScreen() {
  const [selectedBlog, setSelectedBlog] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BookOpen color="#f97316" size={24} />
          <Text style={styles.headerTitle}>Smart Picks Tech & Career Journal</Text>
        </View>

        {blogPosts.map((b) => (
          <TouchableOpacity key={b.slug} style={styles.blogCard} onPress={() => setSelectedBlog(b)}>
            <Image source={{ uri: b.image }} style={styles.blogImage} />
            <View style={styles.blogInfo}>
              <View style={styles.metaRow}>
                <Text style={styles.catBadge}>{b.category.toUpperCase()}</Text>
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
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>{selectedBlog.category.toUpperCase()}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image source={{ uri: selectedBlog.image }} style={styles.readerImage} />

              <View style={styles.readerBody}>
                <View style={styles.metaRow}>
                  <Text style={styles.catBadge}>{selectedBlog.category.toUpperCase()}</Text>
                  <Text style={styles.readTime}>{selectedBlog.datePublished} • {selectedBlog.readTime}</Text>
                </View>

                <Text style={styles.readerTitle}>{selectedBlog.title}</Text>
                <Text style={styles.readerExcerpt}>{selectedBlog.excerpt}</Text>

                {/* Table of Contents */}
                {selectedBlog.toc && selectedBlog.toc.length > 0 && (
                  <View style={styles.tocBox}>
                    <Text style={styles.tocTitle}>Table of Contents:</Text>
                    {selectedBlog.toc.map((item, idx) => (
                      <Text key={idx} style={styles.tocItem}>• {item.title}</Text>
                    ))}
                  </View>
                )}

                <View style={styles.divider} />

                {/* Article Content */}
                <Text style={styles.contentText}>{selectedBlog.content}</Text>

                {/* FAQs Section */}
                {selectedBlog.faqs && selectedBlog.faqs.length > 0 && (
                  <View style={styles.faqSection}>
                    <Text style={styles.faqSectionTitle}>Frequently Asked Questions:</Text>
                    {selectedBlog.faqs.map((faq, idx) => (
                      <View key={idx} style={styles.faqCard}>
                        <Text style={styles.faqQuestion}>Q: {faq.question}</Text>
                        <Text style={styles.faqAnswer}>A: {faq.answer}</Text>
                      </View>
                    ))}
                  </View>
                )}
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
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  blogCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  blogImage: { width: '100%', height: 160, backgroundColor: '#1e293b' },
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
  readerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800', lineHeight: 26, marginTop: 10, marginBottom: 8 },
  readerExcerpt: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  tocBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tocTitle: { color: COLORS.accent, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  tocItem: { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  divider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 20 },
  contentText: { color: '#f8fafc', fontSize: 14, lineHeight: 22 },
  faqSection: { marginTop: 30 },
  faqSectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  faqCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  faqQuestion: { color: COLORS.accent, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  faqAnswer: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
});
