import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Switch,
} from 'react-native';
import { GraduationCap, FileText, Calculator, CheckCircle2, AlertCircle, Sparkles, Award } from 'lucide-react-native';
import { COLORS } from '../theme';

export default function StudentHubScreen() {
  const [activeTab, setActiveTab] = useState('ats'); // 'ats' | 'cgpa'

  // ATS Tool State
  const [skills, setSkills] = useState('Java, React, Node.js, Python, SQL, Git');
  const [projectCount, setProjectCount] = useState('3');
  const [hasActionVerbs, setHasActionVerbs] = useState(true);
  const [isSinglePage, setIsSinglePage] = useState(true);

  // CGPA Tool State
  const [currentCgpa, setCurrentCgpa] = useState('8.4');
  const [targetCompany, setTargetCompany] = useState('TCS Digital / Ninja');
  const [backlogs, setBacklogs] = useState('0');

  // ATS Calculation
  const calculateAtsScore = () => {
    let score = 30;
    const skillList = skills.split(',').filter(s => s.trim().length > 0);
    score += Math.min(skillList.length * 5, 30);
    const projects = parseInt(projectCount) || 0;
    score += Math.min(projects * 8, 24);
    if (hasActionVerbs) score += 8;
    if (isSinglePage) score += 8;
    return Math.min(score, 100);
  };

  // CGPA Calculation
  const getCompanyRequirement = () => {
    switch (targetCompany) {
      case 'Google / Amazon / Product Co': return { minCgpa: 8.5, package: '₹18 - ₹45 LPA' };
      case 'TCS Digital / Ninja': return { minCgpa: 7.0, package: '₹7.0 - ₹9.0 LPA' };
      case 'Infosys / Wipro / Accenture': return { minCgpa: 6.5, package: '₹4.5 - ₹6.5 LPA' };
      default: return { minCgpa: 7.5, package: '₹8.0 LPA' };
    }
  };

  const atsScore = calculateAtsScore();
  const companyInfo = getCompanyRequirement();
  const isEligible = parseFloat(currentCgpa || 0) >= companyInfo.minCgpa && parseInt(backlogs || 0) === 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <GraduationCap color="#f97316" size={28} />
          <Text style={styles.headerTitle}>Student Placement Hub</Text>
        </View>

        {/* Native Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'ats' && styles.tabItemActive]}
            onPress={() => setActiveTab('ats')}
          >
            <FileText color={activeTab === 'ats' ? '#ffffff' : COLORS.textMuted} size={16} />
            <Text style={[styles.tabText, activeTab === 'ats' && styles.tabTextActive]}>
              ATS Resume Tool
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'cgpa' && styles.tabItemActive]}
            onPress={() => setActiveTab('cgpa')}
          >
            <Calculator color={activeTab === 'cgpa' ? '#ffffff' : COLORS.textMuted} size={16} />
            <Text style={[styles.tabText, activeTab === 'cgpa' && styles.tabTextActive]}>
              CGPA Predictor
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: NATIVE ATS RESUME TOOL */}
        {activeTab === 'ats' && (
          <View style={styles.toolCard}>
            <View style={styles.toolHeader}>
              <Sparkles color="#f97316" size={20} />
              <Text style={styles.toolTitle}>Native ATS Resume Score Checker</Text>
            </View>

            {/* Score Banner */}
            <View style={[styles.scoreBanner, { borderColor: atsScore >= 80 ? '#22c55e' : '#eab308' }]}>
              <Text style={styles.scoreNumber}>{atsScore} / 100</Text>
              <Text style={styles.scoreLabel}>
                {atsScore >= 85 ? '🌟 Excellent ATS Compatibility' : atsScore >= 70 ? '👍 Good — Minor Improvements Needed' : '⚠️ Needs Formatting Upgrade'}
              </Text>
            </View>

            {/* Inputs */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Technical Skills (Comma Separated)</Text>
              <TextInput
                style={styles.input}
                value={skills}
                onChangeText={setSkills}
                placeholder="e.g. Java, React, SQL"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of Technical Projects Listed</Text>
              <TextInput
                style={styles.input}
                value={projectCount}
                onChangeText={setProjectCount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Uses Action Verbs (Designed, Built)?</Text>
              <Switch
                value={hasActionVerbs}
                onValueChange={setHasActionVerbs}
                trackColor={{ false: '#334155', true: COLORS.accent }}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Single Page Resume Layout?</Text>
              <Switch
                value={isSinglePage}
                onValueChange={setIsSinglePage}
                trackColor={{ false: '#334155', true: COLORS.accent }}
              />
            </View>

            {/* Recommendations */}
            <View style={styles.recsBox}>
              <Text style={styles.recsTitle}>ATS Optimization Checklist:</Text>
              <View style={styles.recRow}>
                <CheckCircle2 color="#22c55e" size={14} />
                <Text style={styles.recText}>Standard font (Inter/Arial) with no multi-column tables</Text>
              </View>
              <View style={styles.recRow}>
                <CheckCircle2 color="#22c55e" size={14} />
                <Text style={styles.recText}>Includes measurable metrics (e.g. "improved speed by 35%")</Text>
              </View>
              <View style={styles.recRow}>
                <CheckCircle2 color="#22c55e" size={14} />
                <Text style={styles.recText}>PDF format with selectable text</Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: NATIVE CGPA & PLACEMENT PREDICTOR */}
        {activeTab === 'cgpa' && (
          <View style={styles.toolCard}>
            <View style={styles.toolHeader}>
              <Award color="#f97316" size={20} />
              <Text style={styles.toolTitle}>Native CGPA Placement Eligibility</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Aggregate CGPA</Text>
              <TextInput
                style={styles.input}
                value={currentCgpa}
                onChangeText={setCurrentCgpa}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Active Backlogs</Text>
              <TextInput
                style={styles.input}
                value={backlogs}
                onChangeText={setBacklogs}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.label}>Select Target Placement Tier</Text>
            <View style={styles.tierGrid}>
              {['TCS Digital / Ninja', 'Infosys / Wipro / Accenture', 'Google / Amazon / Product Co'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tierBtn, targetCompany === t && styles.tierBtnActive]}
                  onPress={() => setTargetCompany(t)}
                >
                  <Text style={[styles.tierText, targetCompany === t && styles.tierTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Results Box */}
            <View style={[styles.resultBox, { backgroundColor: isEligible ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
              <View style={styles.resultRow}>
                {isEligible ? <CheckCircle2 color="#22c55e" size={20} /> : <AlertCircle color="#ef4444" size={20} />}
                <Text style={[styles.resultTitle, { color: isEligible ? '#22c55e' : '#ef4444' }]}>
                  {isEligible ? 'Eligible for Placement Criteria' : 'Below Cutoff Criteria'}
                </Text>
              </View>

              <Text style={styles.resultDetail}>Target Company Cutoff: {companyInfo.minCgpa} CGPA</Text>
              <Text style={styles.resultDetail}>Expected Package: {companyInfo.package}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabItemActive: { backgroundColor: COLORS.accent },
  tabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#ffffff' },
  toolCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  toolHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  toolTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  scoreBanner: {
    backgroundColor: 'rgba(30, 58, 95, 0.4)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
  },
  scoreNumber: { color: '#ffffff', fontSize: 28, fontWeight: '900' },
  scoreLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginTop: 4 },
  inputGroup: { marginBottom: 14 },
  label: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 6 },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  recsBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  recsTitle: { color: '#ffffff', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  recRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  recText: { color: COLORS.textMuted, fontSize: 11, flex: 1 },
  tierGrid: { marginBottom: 16 },
  tierBtn: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tierBtnActive: { borderColor: COLORS.accent, backgroundColor: 'rgba(249, 115, 22, 0.15)' },
  tierText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  tierTextActive: { color: '#ffffff', fontWeight: '800' },
  resultBox: { borderRadius: 12, padding: 16, marginTop: 10 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  resultTitle: { fontSize: 14, fontWeight: '800' },
  resultDetail: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
});
