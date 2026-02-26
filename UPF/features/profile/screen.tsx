import React from 'react';
import { useUserStore } from '../../core/store/userStore';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// ─── Mock User Data ─────────────────────────────────────────
//const MOCK_USER = { 
//  name: 'กฤตพรต อ้นคง',
//  email: '6731503001@lamduan.mfu.ac.th',
// avatar: '👤',
//  memberSince: 'มกราคม 2026',
//  scannedProducts: 85,
//  favoriteProducts: 12,
//  healthScore: 75, // คะแนนสุขภาพ 0-100
//};

// ─── Colors ─────────────────────────────────────────────────
const GREEN = '#3BAD45';
const GREEN_LIGHT = '#E8F7E9';
const GREEN_DARK = '#2E9438';
const ORANGE = '#F5821F';
const ORANGE_LIGHT = '#FFF3E8';
const TEXT_DARK = '#1A1A1A';
const TEXT_MID = '#666';
const TEXT_LIGHT = '#999';
const WHITE = '#fff';
const BG_GRAY = '#F8F9FA';
const RED = '#E74C3C';

const ProfileScreen = ({ navigation }: any) => {
  const user = useUserStore(state => state.user);
  const logout = useUserStore(state => state.logout);

  if (!user) {
    return null; // หรือ redirect ไป Login
  }

  /*const user = MOCK_USER;*/

  // คำนวณระดับสุขภาพ
  const getHealthLevel = (score: number) => {
    if (score >= 80) return { label: 'ดีเยี่ยม', color: GREEN };
    if (score >= 60) return { label: 'ดี', color: ORANGE };
    return { label: 'ควรปรับปรุง', color: RED };
  };

  const healthLevel = getHealthLevel(user.healthScore ?? 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>โปรไฟล์</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Profile Section ── */}
        <View style={styles.profileSection}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatar}>{user.avatar || '👤'}</Text>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Text style={styles.editAvatarIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberText}>🏅 สมาชิกตั้งแต่ {user.memberSince || '-ไม่ระบุ-'}</Text>
          </View>
        </View>

        {/* ── Health Score Card ── */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.healthTitle}>🎯 คะแนนสุขภาพของคุณ</Text>
            <TouchableOpacity>
              <Text style={styles.healthInfo}>ℹ️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.healthScoreBox}>
            <Text style={styles.healthScoreNum}>{user.healthScore ?? 0}</Text>
            <Text style={styles.healthScoreMax}>/100</Text>
          </View>
          <View style={[styles.healthLevelBadge, { backgroundColor: healthLevel.color }]}>
            <Text style={styles.healthLevelText}>{healthLevel.label}</Text>
          </View>
          <Text style={styles.healthDesc}>
            คะแนนคำนวณจากอาหารที่สแกนและนิสัยการรับประทาน
          </Text>
        </View>

        {/* ── Stats Section ── */}
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

        {/* ── Account Settings ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ ตั้งค่าบัญชี</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: GREEN_LIGHT }]}>
                <Text style={styles.menuIcon}>👤</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>แก้ไขโปรไฟล์</Text>
                <Text style={styles.menuItemSubtitle}>ข้อมูลส่วนตัวและรูปโปรไฟล์</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: ORANGE_LIGHT }]}>
                <Text style={styles.menuIcon}>🔒</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>เปลี่ยนรหัสผ่าน</Text>
                <Text style={styles.menuItemSubtitle}>อัปเดตรหัสผ่านของคุณ</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#FFF3E0' }]}>
                <Text style={styles.menuIcon}>🎯</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>เป้าหมายสุขภาพ</Text>
                <Text style={styles.menuItemSubtitle}>ตั้งเป้าหมายการรับประทาน</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Food Preferences ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ ความชอบด้านอาหาร</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#FFE5E5' }]}>
                <Text style={styles.menuIcon}>🚫</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>อาหารที่แพ้</Text>
                <Text style={styles.menuItemSubtitle}>จัดการรายการอาหารที่แพ้</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: GREEN_LIGHT }]}>
                <Text style={styles.menuIcon}>🥗</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>รายการโปรด</Text>
                <Text style={styles.menuItemSubtitle}>สินค้าที่คุณบันทึกไว้</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: ORANGE_LIGHT }]}>
                <Text style={styles.menuIcon}>⚠️</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>การแจ้งเตือน UPF</Text>
                <Text style={styles.menuItemSubtitle}>ตั้งค่าระดับการเตือน</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── App Preferences ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 การตั้งค่าแอป</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#F0F0F0' }]}>
                <Text style={styles.menuIcon}>🔔</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>การแจ้งเตือน</Text>
                <Text style={styles.menuItemSubtitle}>จัดการการแจ้งเตือนทั้งหมด</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#F0F0F0' }]}>
                <Text style={styles.menuIcon}>🌐</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>ภาษา</Text>
                <Text style={styles.menuItemSubtitle}>ไทย (เริ่มต้น)</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Help & Support ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ ช่วยเหลือและสนับสนุน</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#E8F5E9' }]}>
                <Text style={styles.menuIcon}>📚</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>เกี่ยวกับ UPF</Text>
                <Text style={styles.menuItemSubtitle}>ข้อมูลและวิธีใช้งาน</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#E3F2FD' }]}>
                <Text style={styles.menuIcon}>💬</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>ติดต่อเรา</Text>
                <Text style={styles.menuItemSubtitle}>ส่งความคิดเห็นหรือรายงานปัญหา</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#FFF3E0' }]}>
                <Text style={styles.menuIcon}>⭐</Text>
              </View>
              <View style={styles.menuTextBox}>
                <Text style={styles.menuItemTitle}>ให้คะแนนแอป</Text>
                <Text style={styles.menuItemSubtitle}>ช่วยเราพัฒนาให้ดีขึ้น</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Logout Button ── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutButtonText}>🚪 ออกจากระบบ</Text>
        </TouchableOpacity>

        {/* ── App Version ── */}
        <Text style={styles.versionText}>UPF v1.0.0</Text>

        <View style={styles.spacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },

  // ── header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: GREEN_LIGHT, justifyContent: 'center', alignItems: 'center',
  },
  backIcon: { fontSize: 28, color: GREEN, fontWeight: '300' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
  },
  settingsIcon: { fontSize: 18 },

  // ── profile section ──
  profileSection: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 16,
  },
  avatarBox: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: GREEN_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
    borderWidth: 3,
    borderColor: GREEN,
  },
  avatar: { fontSize: 44 },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -2, right: -2,
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: WHITE,
  },
  editAvatarIcon: { fontSize: 14 },
  userName: { fontSize: 22, fontWeight: '800', color: TEXT_DARK, marginBottom: 4 },
  userEmail: { fontSize: 13, color: TEXT_MID, marginBottom: 10 },
  memberBadge: {
    backgroundColor: ORANGE_LIGHT,
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20,
  },
  memberText: { fontSize: 12, color: ORANGE, fontWeight: '600' },

  // ── health score card ──
  healthCard: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },
  healthInfo: { fontSize: 18 },
  healthScoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12,
  },
  healthScoreNum: { fontSize: 52, fontWeight: '800', color: GREEN },
  healthScoreMax: { fontSize: 24, fontWeight: '600', color: TEXT_LIGHT, marginLeft: 4 },
  healthLevelBadge: {
    alignSelf: 'center',
    paddingVertical: 6, paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
  },
  healthLevelText: { fontSize: 13, fontWeight: '700', color: WHITE },
  healthDesc: { fontSize: 12, color: TEXT_MID, textAlign: 'center', lineHeight: 18 },

  // ── stats ──
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800', color: ORANGE, marginBottom: 4 },
  statLabel: { fontSize: 12, color: TEXT_MID, textAlign: 'center' },

  // ── sections ──
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, marginBottom: 10 },

  // ── menu items ──
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: WHITE,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconBox: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  menuIcon: { fontSize: 18 },
  menuTextBox: { marginLeft: 12, flex: 1 },
  menuItemTitle: { fontSize: 14, fontWeight: '600', color: TEXT_DARK, marginBottom: 2 },
  menuItemSubtitle: { fontSize: 11, color: TEXT_LIGHT },
  menuArrow: { fontSize: 20, color: '#CCC', fontWeight: '300' },

  // ── logout ──
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    backgroundColor: RED,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: { fontSize: 15, fontWeight: '700', color: WHITE },

  // ── version ──
  versionText: {
    fontSize: 11,
    color: TEXT_LIGHT,
    textAlign: 'center',
    marginBottom: 10,
  },

  spacing: { height: 20 },
});

export default ProfileScreen;