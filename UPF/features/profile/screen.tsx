import React, { useState, useRef } from 'react';
import { useUserStore } from '../../core/store/userStore';
import { useLanguage } from '../../core/i18n';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  Alert,
  Clipboard,
  Image,
  Platform,
} from 'react-native';

// ─── Image Picker ────────────────────────────────────────────
// ติดตั้ง: expo install expo-image-picker  หรือ  npm install react-native-image-picker
// รองรับทั้ง Expo และ bare React Native
// ตัวอย่างนี้ใช้ expo-image-picker เป็นหลัก (import แบบ dynamic)
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch {
  try {
    ImagePicker = require('react-native-image-picker');
  } catch {
    // ไม่มีทั้งคู่ — ปุ่มจะแสดง alert แนะนำติดตั้ง
  }
}

// ─── Colors ─────────────────────────────────────────────────
const GREEN = '#3BAD45';
const GREEN_LIGHT = '#E8F7E9';
const GREEN_DARK = '#2E9438';
const GREEN_PALE = '#C8EDCC';
const ORANGE = '#F5821F';
const ORANGE_LIGHT = '#FFF3E8';
const ORANGE_DARK = '#D96B10';
const TEXT_DARK = '#1A1A1A';
const TEXT_MID = '#666';
const TEXT_LIGHT = '#999';
const WHITE = '#fff';
const BG_GRAY = '#F8F9FA';
const RED = '#E74C3C';

// ─────────────────────────────────────────────────────────────
//  ProfileScreen
// ─────────────────────────────────────────────────────────────
const ProfileScreen = ({ navigation }: any) => {
  const user = useUserStore((state: any) => state.user);
  const logout = useUserStore((state: any) => state.logout);
  const { language, setLanguage } = useLanguage();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // ── Contact Modal ──
  const [contactVisible, setContactVisible] = useState(false);
  const contactAnim = useRef(new Animated.Value(0)).current;
  const contactSlide = useRef(new Animated.Value(60)).current;

  const [copied, setCopied] = useState(false);

  if (!user) return null;

  // ─── Image Picker ──────────────────────────────────────────
  const handlePickImage = () => {
    Alert.alert(
      'เปลี่ยนรูปโปรไฟล์',
      'เลือกวิธีการ',
      [
        { text: 'ถ่ายรูป 📷', onPress: openCamera },
        { text: 'เลือกจากคลัง 🖼️', onPress: openGallery },
        { text: 'ยกเลิก', style: 'cancel' },
      ],
    );
  };

  const openCamera = async () => {
    if (!ImagePicker) {
      Alert.alert('แจ้งเตือน', 'กรุณาติดตั้ง expo-image-picker ก่อนใช้งาน\nnpm install expo-image-picker');
      return;
    }
    // Expo ImagePicker
    if (ImagePicker.launchCameraAsync) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่า');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images ?? 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } else {
      // react-native-image-picker
      ImagePicker.launchCamera({ mediaType: 'photo', includeBase64: false }, (res: any) => {
        if (!res.didCancel && res.assets?.[0]?.uri) setAvatarUri(res.assets[0].uri);
      });
    }
  };

  const openGallery = async () => {
    if (!ImagePicker) {
      Alert.alert('แจ้งเตือน', 'กรุณาติดตั้ง expo-image-picker ก่อนใช้งาน\nnpm install expo-image-picker');
      return;
    }
    if (ImagePicker.launchImageLibraryAsync) {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตการเข้าถึงคลังรูปภาพในการตั้งค่า');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images ?? 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } else {
      ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (res: any) => {
        if (!res.didCancel && res.assets?.[0]?.uri) setAvatarUri(res.assets[0].uri);
      });
    }
  };

  // ─── Contact Modal Animations ─────────────────────────────
  const openContact = () => {
    setContactVisible(true);
    contactAnim.setValue(0);
    contactSlide.setValue(60);
    Animated.parallel([
      Animated.timing(contactAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(contactSlide, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
    ]).start();
  };

  const closeContact = () => {
    Animated.parallel([
      Animated.timing(contactAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(contactSlide, { toValue: 80, duration: 220, useNativeDriver: true }),
    ]).start(() => setContactVisible(false));
  };

  const handleCopy = () => {
    Clipboard.setString('0653090417');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Health Score ─────────────────────────────────────────
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
          <TouchableOpacity 
            style={styles.languageBtn}
            onPress={() => setLanguage(language === 'th' ? 'en' : 'th')}
          >
            <Text style={styles.languageIcon}>{language === 'th' ? '🇹🇭' : '🇬🇧'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Profile Section ── */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.85}>
            <View style={styles.avatarBox}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatar}>{user.avatar || '👤'}</Text>
              )}
              <View style={styles.editAvatarBtn}>
                <Text style={styles.editAvatarIcon}>📷</Text>
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.tapHint}>แตะเพื่อเปลี่ยนรูป</Text>
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
            <TouchableOpacity><Text style={styles.healthInfo}>ℹ️</Text></TouchableOpacity>
          </View>
          <View style={styles.healthScoreBox}>
            <Text style={styles.healthScoreNum}>{user.healthScore ?? 0}</Text>
            <Text style={styles.healthScoreMax}>/100</Text>
          </View>
          <View style={[styles.healthLevelBadge, { backgroundColor: healthLevel.color }]}>
            <Text style={styles.healthLevelText}>{healthLevel.label}</Text>
          </View>
          <Text style={styles.healthDesc}>คะแนนคำนวณจากอาหารที่สแกนและนิสัยการรับประทาน</Text>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statValue}>{user.favoriteProducts ?? 0}</Text>
            <Text style={styles.statLabel}>รายการโปรด</Text>
          </View>
        </View>

        {/* ── Account Settings ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ ตั้งค่าบัญชี</Text>
          <MenuItem icon="👤" bg={GREEN_LIGHT} title="แก้ไขโปรไฟล์" sub="ข้อมูลส่วนตัวและรูปโปรไฟล์" />
          <MenuItem icon="🔒" bg={ORANGE_LIGHT} title="เปลี่ยนรหัสผ่าน" sub="อัปเดตรหัสผ่านของคุณ" />
          <MenuItem icon="🎯" bg="#FFF3E0" title="เป้าหมายสุขภาพ" sub="ตั้งเป้าหมายการรับประทาน" />
        </View>

        {/* ── Food Preferences ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ ความชอบด้านอาหาร</Text>
          <MenuItem icon="🚫" bg="#FFE5E5" title="อาหารที่แพ้" sub="จัดการรายการอาหารที่แพ้" />
          <MenuItem icon="🥗" bg={GREEN_LIGHT} title="รายการโปรด" sub="สินค้าที่คุณบันทึกไว้" />
          <MenuItem icon="⚠️" bg={ORANGE_LIGHT} title="การแจ้งเตือน UPF" sub="ตั้งค่าระดับการเตือน" />
        </View>

        {/* ── App Preferences ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 การตั้งค่าแอป</Text>
          <MenuItem icon="🔔" bg="#F0F0F0" title="การแจ้งเตือน" sub="จัดการการแจ้งเตือนทั้งหมด" />
        </View>

        {/* ── Help & Support ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ ช่วยเหลือและสนับสนุน</Text>

          {/* เกี่ยวกับ UPF → navigate ไปหน้าใหม่ */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AboutUPF')}
            activeOpacity={0.75}
          >
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

          {/* ติดต่อเรา → Modal */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={openContact}
            activeOpacity={0.75}
          >
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

          <MenuItem icon="⭐" bg="#FFF3E0" title="ให้คะแนนแอป" sub="ช่วยเราพัฒนาให้ดีขึ้น" />
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.logoutButtonText}>🚪 ออกจากระบบ</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>UPF v1.0.0</Text>
        <View style={styles.spacing} />
      </ScrollView>

      {/* ════════════════════════════════════════════
          Contact Modal
      ════════════════════════════════════════════ */}
      <Modal
        visible={contactVisible}
        transparent
        animationType="none"
        onRequestClose={closeContact}
      >
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: contactAnim }]}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={closeContact} activeOpacity={1} />
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={[
            styles.contactCard,
            {
              opacity: contactAnim,
              transform: [{ translateY: contactSlide }],
            },
          ]}
          pointerEvents="box-none"
        >
          {/* Pill handle */}
          <View style={styles.pill} />

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={closeContact}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.contactHeader}>
            <View style={styles.contactIconCircle}>
              <Text style={{ fontSize: 32 }}>💬</Text>
            </View>
            <Text style={styles.contactTitle}>ติดต่อเรา</Text>
            <Text style={styles.contactSubtitle}>พร้อมช่วยเหลือคุณเสมอ</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Info Row — Name */}
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: GREEN_LIGHT }]}>
              <Text>👤</Text>
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>ผู้รับผิดชอบ</Text>
              <Text style={styles.infoValue}>ภูมิใจ</Text>
            </View>
          </View>

          {/* Info Row — Phone */}
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: ORANGE_LIGHT }]}>
              <Text>📱</Text>
            </View>
            <View style={styles.infoTexts}>
              <Text style={styles.infoLabel}>เบอร์โทรศัพท์</Text>
              <Text style={styles.infoValue}>065-309-0417</Text>
            </View>
          </View>

          {/* Copy Button */}
          <TouchableOpacity
            style={[styles.copyButton, copied && styles.copyButtonDone]}
            onPress={handleCopy}
            activeOpacity={0.82}
          >
            <Text style={styles.copyButtonText}>
              {copied ? '✅  คัดลอกแล้ว!' : '📋  คัดลอกเบอร์โทร'}
            </Text>
          </TouchableOpacity>

          {/* Tagline */}
          <Text style={styles.contactTagline}>
            หากมีปัญหาหรือข้อเสนอแนะ สามารถติดต่อได้เลยนะครับ 😊
          </Text>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
//  Reusable MenuItem
// ─────────────────────────────────────────────────────────────
const MenuItem = ({
  icon, bg, title, sub, onPress,
}: { icon: string; bg: string; title: string; sub: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.menuItemLeft}>
      <View style={[styles.menuIconBox, { backgroundColor: bg }]}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <View style={styles.menuTextBox}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text style={styles.menuItemSubtitle}>{sub}</Text>
      </View>
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────
//  AboutUPFScreen  (ลงทะเบียนใน Navigator ของคุณด้วย)
// ─────────────────────────────────────────────────────────────
export const AboutUPFScreen = ({ navigation }: any) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={aboutStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_DARK} />

      {/* ── Header ── */}
      <View style={aboutStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={aboutStyles.backBtn}>
          <Text style={aboutStyles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={aboutStyles.headerTitle}>เกี่ยวกับ UPF</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <Animated.View style={[aboutStyles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={aboutStyles.heroEmoji}>🍔</Text>
          <Text style={aboutStyles.heroTitle}>UPF คืออะไร?</Text>
          <Text style={aboutStyles.heroDef}>
            <Text style={aboutStyles.boldGreen}>UPF</Text> (Ultra-Processed Foods) คือ{' '}
            <Text style={aboutStyles.boldOrange}>อาหารแปรรูปขั้นสูง</Text> หรืออาหารที่ผ่านกระบวนการผลิต
            เชิงอุตสาหกรรมอย่างหนัก แทบไม่เหลือสภาพวัตถุดิบเดิม มักมีส่วนผสมที่หาไม่ได้ในครัวทั่วไป
            เช่น สารปรุงแต่งกลิ่น สี สารกันเสีย สารให้ความหวานสังเคราะห์ ไขมันทรานส์
            ซึ่งส่งผลเสียต่อสุขภาพหากกินเป็นประจำ เช่น เสี่ยงโรคอ้วน โรคหัวใจ
          </Text>
        </Animated.View>

        {/* Section: ลักษณะเด่น */}
        <Animated.View style={[aboutStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={aboutStyles.cardTitle}>🔍 ลักษณะเด่นของอาหาร UPF</Text>

          <FeatureRow
            icon="🧪"
            title="ส่วนผสมจำเพาะ"
            desc="มีสารสังเคราะห์ที่ไม่ใช่อาหารจริงเยอะ เช่น ไฮโดรเจนเนเต็ดออยล์ ไฮโดรไลซ์โปรตีน สีและรสสังเคราะห์"
          />
          <FeatureRow
            icon="🏭"
            title="กระบวนการซับซ้อน"
            desc="ผ่านการทอด การอัดรีด การขึ้นรูปใหม่"
          />
          <FeatureRow
            icon="😋"
            title="รสชาติอร่อยจัด"
            desc="ถูกออกแบบมาให้รสชาติดีและอร่อยจนหยุดกินไม่ได้"
          />
        </Animated.View>

        {/* Section: ตัวอย่าง */}
        <Animated.View style={[aboutStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={aboutStyles.cardTitle}>🛒 ตัวอย่างอาหาร UPF ที่พบบ่อย</Text>

          <ExampleGroup
            icon="🥤"
            label="เครื่องดื่ม"
            items="น้ำอัดลม  น้ำผลไม้กล่อง  กาแฟ 3in1"
          />
          <ExampleGroup
            icon="🍜"
            label="อาหารพร้อมทาน"
            items="บะหมี่กึ่งสำเร็จรูป  อาหารแช่แข็ง  ไส้กรอก  แฮม  นักเก็ต"
          />
          <ExampleGroup
            icon="🍪"
            label="ขนม"
            items="ขนมกรุบกรอบ  ขนมปังเบเกอรี่  ไอศกรีม  โยเกิร์ตหวาน"
          />
        </Animated.View>

        {/* Section: ทำไมต้องเลี่ยง */}
        <Animated.View style={[aboutStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={aboutStyles.cardTitle}>⚠️ ทำไม UPF ถึงควรเลี่ยง?</Text>

          <WhyRow
            num="1"
            title="โภชนาการต่ำ"
            desc="มักมีไขมัน โซเดียม น้ำตาลสูง แต่มีใยอาหารและโปรตีนต่ำ"
          />
          <WhyRow
            num="2"
            title="เสี่ยงโรคไม่ติดต่อเรื้อรัง (NCDs)"
            desc="เชื่อมโยงกับความเสี่ยงโรคหัวใจและหลอดเลือดเพิ่มขึ้น 47%"
          />
          <WhyRow
            num="3"
            title="ส่งผลต่อระบบเผาผลาญ"
            desc="ทำให้ระบบเผาผลาญพังและเสี่ยงต่อโรคอ้วน"
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Helper Sub-Components ────────────────────────────────────
const FeatureRow = ({ icon, title, desc }: any) => (
  <View style={aboutStyles.featureRow}>
    <Text style={aboutStyles.featureIcon}>{icon}</Text>
    <View style={aboutStyles.featureTexts}>
      <Text style={aboutStyles.featureTitle}>{title}</Text>
      <Text style={aboutStyles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

const ExampleGroup = ({ icon, label, items }: any) => (
  <View style={aboutStyles.exampleGroup}>
    <Text style={aboutStyles.exampleLabel}>{icon}  {label}</Text>
    <Text style={aboutStyles.exampleItems}>{items}</Text>
  </View>
);

const WhyRow = ({ num, title, desc }: any) => (
  <View style={aboutStyles.whyRow}>
    <View style={aboutStyles.whyNum}>
      <Text style={aboutStyles.whyNumText}>{num}</Text>
    </View>
    <View style={aboutStyles.whyTexts}>
      <Text style={aboutStyles.whyTitle}>{title}</Text>
      <Text style={aboutStyles.whyDesc}>{desc}</Text>
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────
//  Styles — Profile
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },

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
  languageBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: ORANGE_LIGHT, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: ORANGE,
  },
  languageIcon: { fontSize: 18 },

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
    marginBottom: 6,
    position: 'relative',
    borderWidth: 3,
    borderColor: GREEN,
    overflow: 'visible',
  },
  avatarImage: { width: 84, height: 84, borderRadius: 42 },
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
    zIndex: 10,
  },
  editAvatarIcon: { fontSize: 14 },
  tapHint: { fontSize: 11, color: TEXT_LIGHT, marginBottom: 10 },
  userName: { fontSize: 22, fontWeight: '800', color: TEXT_DARK, marginBottom: 4 },
  userEmail: { fontSize: 13, color: TEXT_MID, marginBottom: 10 },
  memberBadge: {
    backgroundColor: ORANGE_LIGHT,
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20,
  },
  memberText: { fontSize: 12, color: ORANGE, fontWeight: '600' },

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

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, marginBottom: 10 },

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
  versionText: { fontSize: 11, color: TEXT_LIGHT, textAlign: 'center', marginBottom: 10 },
  spacing: { height: 20 },

  // ── Contact Modal ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  contactCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  pill: {
    width: 40, height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 16, right: 20,
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 13, color: TEXT_MID, fontWeight: '700' },

  contactHeader: { alignItems: 'center', marginBottom: 20 },
  contactIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: GREEN_LIGHT,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3,
    borderColor: GREEN_PALE,
    marginBottom: 10,
  },
  contactTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK, marginBottom: 4 },
  contactSubtitle: { fontSize: 13, color: TEXT_MID },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 16 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoIcon: {
    width: 42, height: 42, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  infoTexts: { flex: 1 },
  infoLabel: { fontSize: 11, color: TEXT_LIGHT, marginBottom: 2 },
  infoValue: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },

  copyButton: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  copyButtonDone: { backgroundColor: GREEN },
  copyButtonText: { fontSize: 15, fontWeight: '700', color: WHITE },

  contactTagline: {
    marginTop: 14,
    fontSize: 12,
    color: TEXT_LIGHT,
    textAlign: 'center',
    lineHeight: 18,
  },
});

// ─────────────────────────────────────────────────────────────
//  Styles — About UPF
// ─────────────────────────────────────────────────────────────
const aboutStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: GREEN_DARK,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  backIcon: { fontSize: 28, color: WHITE, fontWeight: '300' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: WHITE },

  hero: {
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 8,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },
  heroEmoji: { fontSize: 56, marginBottom: 10 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: WHITE, marginBottom: 12 },
  heroDef: { fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 22, textAlign: 'center' },
  boldGreen: { fontWeight: '800', color: GREEN_PALE },
  boldOrange: { fontWeight: '800', color: '#FFCC80' },

  card: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, marginBottom: 14 },

  // Feature rows
  featureRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  featureIcon: { fontSize: 22, marginRight: 12, marginTop: 2 },
  featureTexts: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, marginBottom: 2 },
  featureDesc: { fontSize: 13, color: TEXT_MID, lineHeight: 18 },

  // Example groups
  exampleGroup: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  exampleLabel: { fontSize: 13, fontWeight: '700', color: GREEN_DARK, marginBottom: 4 },
  exampleItems: { fontSize: 12, color: TEXT_MID, lineHeight: 18 },

  // Why rows
  whyRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  whyNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: ORANGE,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, marginTop: 2,
  },
  whyNumText: { fontSize: 13, fontWeight: '800', color: WHITE },
  whyTexts: { flex: 1 },
  whyTitle: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, marginBottom: 2 },
  whyDesc: { fontSize: 13, color: TEXT_MID, lineHeight: 18 },
});

export default ProfileScreen;