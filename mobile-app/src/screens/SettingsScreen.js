import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, SafeAreaView, Share } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Bell, Share2, Globe } from 'lucide-react-native';
import { COLORS } from '../theme';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Smart Picks India app for verified Amazon deals, placement guides, and price drops! https://smart-picks-india.vercel.app',
      });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>App Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Bell color={COLORS.accent} size={18} />
              <Text style={styles.rowText}>Price Drop Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#334155', true: COLORS.accent }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>About & Links</Text>

          <TouchableOpacity style={styles.rowBtn} onPress={shareApp}>
            <View style={styles.rowLeft}>
              <Share2 color={COLORS.textMuted} size={18} />
              <Text style={styles.rowText}>Share App with Friends</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowBtn}
            onPress={() => WebBrowser.openBrowserAsync('https://smart-picks-india.vercel.app')}
          >
            <View style={styles.rowLeft}>
              <Globe color={COLORS.textMuted} size={18} />
              <Text style={styles.rowText}>Visit Smart Picks India Website</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Smart Picks India v1.0.0 (Android)</Text>
          <Text style={styles.footerSub}>Made with ❤️ for Indian Shoppers & Students</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionHeader: { color: COLORS.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowBtn: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  footerSub: { color: COLORS.textMuted, fontSize: 10, marginTop: 4 },
});
