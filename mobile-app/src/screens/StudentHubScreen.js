import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { GraduationCap, FileText, Calculator, Award, ArrowUpRight } from 'lucide-react-native';
import { COLORS } from '../theme';

export default function StudentHubScreen() {
  const tools = [
    {
      title: 'ATS Resume Builder & Tips',
      sub: 'Single-page ATS format guide for campus placements',
      icon: FileText,
      url: 'https://smart-picks-india.vercel.app/blog/placement-preparation-ats-resume-blueprint',
    },
    {
      title: 'CGPA & Placement Predictor',
      sub: 'Check target CGPA for TCS, Infosys, Google, Wipro',
      icon: Calculator,
      url: 'https://smart-picks-india.vercel.app/blog/complete-placement-preparation-guide',
    },
    {
      title: '2026 Tech Skill Roadmap',
      sub: 'Must-learn frameworks, DSA patterns & AI tools',
      icon: Award,
      url: 'https://smart-picks-india.vercel.app/blog/must-know-ai-tools-developer-technologies-2026',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <GraduationCap color="#f97316" size={32} />
          <Text style={styles.heroTitle}>Student Career Hub</Text>
          <Text style={styles.heroSub}>
            Free tools & blueprints to crack your campus placements and build a top 1% resume.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Essential Placement Tools</Text>
        {tools.map((t, idx) => {
          const Icon = t.icon;
          return (
            <TouchableOpacity
              key={idx}
              style={styles.toolCard}
              onPress={() => WebBrowser.openBrowserAsync(t.url)}
            >
              <View style={styles.iconCircle}>
                <Icon color="#f97316" size={20} />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>{t.title}</Text>
                <Text style={styles.toolSub}>{t.sub}</Text>
              </View>
              <ArrowUpRight color={COLORS.textMuted} size={18} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  heroTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginTop: 10, marginBottom: 6 },
  heroSub: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 14 },
  toolCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toolInfo: { flex: 1 },
  toolTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  toolSub: { color: COLORS.textMuted, fontSize: 11, lineHeight: 15 },
});
