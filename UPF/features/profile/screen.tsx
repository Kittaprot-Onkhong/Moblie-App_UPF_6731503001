import React from 'react';
import { useUserStore } from '../../core/store/userStore';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';

// ─── Dark Theme Colors ───────────────────────────────────────
const BG       = '#0a0f0d';
const SURFACE  = '#111a14';
const SURFACE2 = '#162019';
const GREEN    = '#2ecc71';
const GREEN_MID= '#1a9e52';
const GREEN_DIM= 'rgba(46,204,113,0.12)';
const RED      = '#ff6b6b';
const RED_DIM  = 'rgba(255,107,107,0.12)';
const YELLOW   = '#feca57';
const MUTED    = '#7a9982';
const TEXT     = '#e8f5ec';
const BORDER   = 'rgba(46,204,113,0.18)';

const ProfileScreen = ({ navigation }: any) => {
  const user   = useUserStore((state: any) => state.user);
  const logout = useUserStore((state: any) => state.logout);

  if (!user) return null;

  const getHealthLevel = (score: number) => {
    if (score >= 80) return { label: 'ดีเยี่ยม', color: GREEN };
    if (score >= 60) return { label: 'ดี',       color: YELLOW };
    return               { label: 'ควรปรับปรุง', color: RED };
  };
  const healthLevel = getHealthLevel(user.healthScore ?? 0);

  const menuSections = [
    {
      title: '⚙️ ตั้งค่าบัญชี',
      items: [
        { icon: '👤', bg: GREEN_DIM, title: 'แก้ไขโปรไฟล์', sub: 'ข้อมูลส่วนตัวและรูปโปรไฟล์' },
        { icon: '🔒', bg: 'rgba(254,202,87,0.1)', title: 'เปลี่ยนรหัสผ่าน', sub: 'อัปเดตรหัสผ่านของคุณ' },
        { icon: '🎯', bg: 'rgba(243,156,18,0.1)', title: 'เป้าหมายสุขภาพ', sub: 'ตั้งเป้าหมายการรับประทาน' },
      ],
    },
    {
      title: '🍽️ ความชอบด้านอาหาร',
      items: [
        { icon: '🚫', bg: RED_DIM,   title: 'อาหารที่แพ้',       sub: 'จัดการรายการอาหารที่แพ้' },
        { icon: '🥗', bg: GREEN_DIM, title: 'รายการโปรด',        sub: 'สินค้าที่คุณบันทึกไว้' },
        { icon: '⚠️', bg: 'rgba(254,202,87,0.1)', title: 'การแจ้งเตือน UPF', sub: 'ตั้งค่าระดับการเตือน' },
      ],
    },
    {
      title: '🎨 การตั้งค่าแอป',
      items: [
        { icon: '🔔', bg: SURFACE2, title: 'การแจ้งเตือน', sub: 'จัดการการแจ้งเตือนทั้งหมด' },
        { icon: '🌐', bg: SURFACE2, title: 'ภาษา',         sub: 'ไทย (เริ่มต้น)' },
      ],
    },
    {
      title: '❓ ช่วยเหลือและสนับสนุน',
      items: [
        { icon: '📚', bg: GREEN_DIM,  title: 'เกี่ยวกับ UPF', sub: 'ข้อมูลและวิธีใช้งาน' },
        { icon: '💬', bg: 'rgba(46,204,113,0.07)', title: 'ติดต่อเรา',    sub: 'ส่งความคิดเห็นหรือรายงานปัญหา' },
        { icon: '⭐', bg: 'rgba(254,202,87,0.08)', title: 'ให้คะแนนแอป', sub: 'ช่วยเราพัฒนาให้ดีขึ้น' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>โปรไฟล์</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Profile ── */}
        <View style={styles.profileSection}>
          {/* Glow blob */}
          <View style={styles.profileGlow} />
          <View style={styles.avatarBox}>
            <Text style={styles.avatar}>{user.avatar || '👤'}</Text>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Text style={{ fontSize: 14 }}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberText}>🏅 สมาชิกตั้งแต่ {user.memberSince || '-'}</Text>
          </View>
        </View>

        {/* ── Health Score ── */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.healthTitle}>🎯 คะแนนสุขภาพของคุณ</Text>
            <TouchableOpacity><Text style={{ fontSize: 18 }}>ℹ️</Text></TouchableOpacity>
          </View>
          <View style={styles.healthScoreBox}>
            <Text style={[styles.healthScoreNum, { color: healthLevel.color }]}>{user.healthScore ?? 0}</Text>
            <Text style={styles.healthScoreMax}>/100</Text>
          </View>
          {/* Score bar */}
          <View style={styles.scoreBarTrack}>
            <View style={[styles.scoreBarFill, { width: `${user.healthScore ?? 0}%` as any, backgroundColor: healthLevel.color }]} />
          </View>
          <View style={[styles.healthLevelBadge, { backgroundColor: healthLevel.color + '22', borderColor: healthLevel.color + '55' }]}>
            <Text style={[styles.healthLevelText, { color: healthLevel.color }]}>{healthLevel.label}</Text>
          </View>
          <Text style={styles.healthDesc}>คะแนนคำนวณจากอาหารที่สแกนและนิสัยการรับประทาน</Text>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📷</Text>
            <Text style={styles.statValue}>{user.scannedProducts ?? 0}</Text>
            <Text style={styles.statLabel}>สินค้าที่สแกน</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statValue}>{user.favoriteProducts ?? 0}</Text>
            <Text style={styles.statLabel}>รายการโปรด</Text>
          </View>
        </View>

        {/* ── Menu Sections ── */}
        {menuSections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, ii) => (
              <TouchableOpacity key={ii} style={styles.menuItem} activeOpacity={0.8}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.menuTextBox}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.sub}</Text>
                  </View>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutButtonText}>🚪 ออกจากระบบ</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>UPF v1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: GREEN_DIM, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  backIcon:    { fontSize: 28, color: GREEN, fontWeight: '300' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: SURFACE2, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },

  // Profile
  profileSection: {
    alignItems: 'center', paddingVertical: 32,
    backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER,
    marginBottom: 16, overflow: 'hidden',
  },
  profileGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: GREEN, opacity: 0.05, top: -60,
  },
  avatarBox: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: GREEN_DIM,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, position: 'relative',
    borderWidth: 2, borderColor: GREEN,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  avatar: { fontSize: 44 },
  editAvatarBtn: {
    position: 'absolute', bottom: -2, right: -2,
    width: 30, height: 30, borderRadius: 15, backgroundColor: GREEN,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: BG,
  },
  userName:    { fontSize: 22, fontWeight: '800', color: TEXT, marginBottom: 4 },
  userEmail:   { fontSize: 13, color: MUTED, marginBottom: 12 },
  memberBadge: { backgroundColor: GREEN_DIM, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  memberText:  { fontSize: 12, color: GREEN, fontWeight: '600' },

  // Health Card
  healthCard: {
    backgroundColor: SURFACE, marginHorizontal: 16, marginBottom: 16,
    borderRadius: 18, padding: 20, borderWidth: 1, borderColor: BORDER,
  },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  healthTitle:  { fontSize: 16, fontWeight: '700', color: TEXT },
  healthScoreBox: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 12 },
  healthScoreNum: { fontSize: 52, fontWeight: '800' },
  healthScoreMax: { fontSize: 22, fontWeight: '600', color: MUTED, marginLeft: 4 },
  scoreBarTrack: { height: 6, backgroundColor: SURFACE2, borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  scoreBarFill:  { height: '100%', borderRadius: 3 },
  healthLevelBadge: { alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1 },
  healthLevelText:  { fontSize: 13, fontWeight: '700' },
  healthDesc: { fontSize: 12, color: MUTED, textAlign: 'center', lineHeight: 18 },

  // Stats
  statsSection: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: SURFACE, borderRadius: 14, paddingVertical: 20,
    alignItems: 'center', borderWidth: 1, borderColor: BORDER,
  },
  statIcon:  { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800', color: GREEN, marginBottom: 4 },
  statLabel: { fontSize: 12, color: MUTED, textAlign: 'center' },

  // Sections
  section:      { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: MUTED, marginBottom: 10, letterSpacing: 0.5 },

  // Menu
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: SURFACE, paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: BORDER,
  },
  menuItemLeft:    { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconBox:     { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuIcon:        { fontSize: 18 },
  menuTextBox:     { marginLeft: 12, flex: 1 },
  menuItemTitle:   { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 2 },
  menuItemSubtitle:{ fontSize: 11, color: MUTED },
  menuArrow:       { fontSize: 22, color: BORDER, fontWeight: '300' },

  // Logout
  logoutButton: {
    marginHorizontal: 16, marginVertical: 16, paddingVertical: 14,
    backgroundColor: RED_DIM, borderRadius: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)',
  },
  logoutButtonText: { fontSize: 15, fontWeight: '700', color: RED },
  versionText:      { fontSize: 11, color: MUTED, textAlign: 'center', marginBottom: 8 },
});

export default ProfileScreen;