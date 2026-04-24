// features/profile/screen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, TextInput, Image,
  Alert, ActivityIndicator, FlatList, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// ── Firebase setup (import from service ตรงๆ) ────────────────────
import { auth, db } from '../../core/services/firebase';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';

const getDbRef = (uid: string) => doc(db, 'users', uid);
const doSignOut = () => signOut(auth);
const doSendResetEmail = (email: string) => sendPasswordResetEmail(auth, email);
const doUpdateDoc = (docRef: any, data: any) => updateDoc(docRef, data);
const doGetDocs = async (col: any) => {
  const snap = await getDocs(col);
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
};
const doCollection = (name: string) => collection(db, name);

let useUserStore: any = (sel: any) =>
  sel({ user: null, setUser: () => {}, clearUser: () => {} });
try { useUserStore = require('../../core/store/userStore').useUserStore; } catch {}

// ── Colors ────────────────────────────────────────────────────────
const BG        = '#0a0f0d';
const SURFACE   = '#111a14';
const SURFACE2  = '#162019';
const GREEN     = '#2ecc71';
const GREEN_DIM = 'rgba(46,204,113,0.12)';
const RED       = '#ff6b6b';
const RED_DIM   = 'rgba(255,107,107,0.12)';
const YELLOW    = '#feca57';
const MUTED     = '#7a9982';
const TEXT      = '#e8f5ec';
const BORDER    = 'rgba(46,204,113,0.18)';

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// ── Overlay modal ─────────────────────────────────────────────────
const OverlayModal = ({
  visible, onClose, title, children,
}: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={ov.bg} onPress={onClose}>
      <Pressable style={ov.box} onPress={e => e.stopPropagation()}>
        <Text style={ov.title}>{title}</Text>
        {children}
      </Pressable>
    </Pressable>
  </Modal>
);
const ov = StyleSheet.create({
  bg:    { flex:1, backgroundColor:'rgba(0,0,0,0.75)', justifyContent:'center', alignItems:'center', padding:24 },
  box:   { backgroundColor:SURFACE, borderRadius:20, padding:24, width:'100%', maxWidth:400, borderWidth:1, borderColor:BORDER },
  title: { fontSize:18, fontWeight:'800', color:GREEN, marginBottom:16, textAlign:'center' },
});

// ══════════════════════════════════════════════════════════════════
const ProfileScreen = ({ navigation }: any) => {
  const user      = useUserStore((s: any) => s.user);
  const setUser   = useUserStore((s: any) => s.setUser);
  const clearUser = useUserStore((s: any) => s.clearUser);

  const [showAvatar,      setShowAvatar]      = useState(false);
  const [showNameConfirm, setShowNameConfirm] = useState(false);
  const [showNameEdit,    setShowNameEdit]    = useState(false);
  const [showGoal,        setShowGoal]        = useState(false);
  const [showAbout,       setShowAbout]       = useState(false);
  const [showContact,     setShowContact]     = useState(false);
  const [showRating,      setShowRating]      = useState(false);
  const [showScanned,     setShowScanned]     = useState(false);
  const [showFavs,        setShowFavs]        = useState(false);
  const [showPwdConfirm,  setShowPwdConfirm]  = useState(false);

  const [newName,       setNewName]       = useState('');
  const [newGoal,       setNewGoal]       = useState('');
  const [previewUri,    setPreviewUri]    = useState(''); // local file:// — แสดง preview
  const [avatarB64,     setAvatarB64]     = useState(''); // data:image/...;base64,... — บันทึก
  const [newRating,     setNewRating]     = useState(0);
  const [newReview,     setNewReview]     = useState('');
  const [saving,        setSaving]        = useState(false);
  const [favProducts,   setFavProducts]   = useState<any[]>([]);
  const [favsLoading,   setFavsLoading]   = useState(false);

  if (!user) return null;

  const uid     = user.uid;
  const userRef = getDbRef(uid);
  const todayScore = user[`คะแนนสุขภาพ${todayKey()}`] ?? 0;

  const getHealthLevel = (score: number) => {
    if (score >= 80) return { label: 'ดีเยี่ยม',     color: GREEN   };
    if (score >= 60) return { label: 'ดี',            color: YELLOW  };
    if (score >= 40) return { label: 'ปกติ',          color: '#f39c12' };
    return               { label: 'ควรปรับปรุง', color: RED     };
  };
  const healthLevel = getHealthLevel(todayScore);

  const persist = async (fields: Record<string, any>) => {
    try {
      console.log('💾 [persist] Updating fields:', Object.keys(fields));
      if (!userRef) {
        console.error('❌ [persist] userRef is null!');
        throw new Error('userRef is null');
      }
      await doUpdateDoc(userRef, fields);
      console.log('✓ [persist] Firestore updated successfully');
      setUser({ ...user, ...fields });
    } catch (e: any) {
      console.error('❌ [persist] Error:', e?.message ?? String(e));
      throw e;
    }
  };

  // ── AVATAR ────────────────────────────────────────────────────────
  // แก้ไขหลัก: อ่านไฟล์เป็น base64 แล้วบันทึก data URI ลง Firestore
  // data URI ไม่หมดอายุเพราะเป็นข้อมูลฝังตรงๆ ไม่ใช่ path ระบบไฟล์
  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('ต้องการสิทธิ์', 'กรุณาอนุญาตการเข้าถึงรูปภาพในการตั้งค่า');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,   // ลด quality → base64 เล็กลง ผ่าน Firestore 1MB limit
    });

    if (!result.canceled && result.assets?.[0]) {
      const localUri = result.assets[0].uri;
      setPreviewUri(localUri); // แสดง preview ทันที

      // แปลง file:// → base64 string
      try {
        const b64 = await FileSystem.readAsStringAsync(localUri, {
          encoding: 'base64',
        });
        setAvatarB64(`data:image/jpeg;base64,${b64}`);
      } catch {
        // fallback ถ้า FileSystem ไม่ได้ install
        setAvatarB64(localUri);
      }
    }
  };

  const cancelAvatar = () => { setPreviewUri(''); setAvatarB64(''); };

  const saveAvatar = async () => {
    if (!avatarB64) return;
    setSaving(true);
    try {
      // บันทึก data URI (base64) → ไม่หายหลัง restart
      await persist({ avatar: avatarB64 });
      cancelAvatar();
      setShowAvatar(false);
      Alert.alert('✓', 'เปลี่ยนรูปโปรไฟล์เรียบร้อย');
    } catch (e: any) {
      Alert.alert('เกิดข้อผิดพลาด', e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── NAME ──────────────────────────────────────────────────────────
  const saveName = async () => {
    if (!newName.trim()) { Alert.alert('กรุณากรอกชื่อ'); return; }
    setSaving(true);
    try { await persist({ name: newName.trim() }); setShowNameEdit(false); }
    catch (e: any) { Alert.alert('เกิดข้อผิดพลาด', e.message); }
    finally { setSaving(false); }
  };

  // ── GOAL ──────────────────────────────────────────────────────────
  const openGoal = () => { setNewGoal(user.healthGoal || ''); setShowGoal(true); };
  const saveGoal = async () => {
    setSaving(true);
    try { await persist({ healthGoal: newGoal.trim() }); setShowGoal(false); }
    catch (e: any) { Alert.alert('เกิดข้อผิดพลาด', e.message); }
    finally { setSaving(false); }
  };

  // ── PASSWORD RESET ────────────────────────────────────────────────
  const doResetPassword = async () => {
    setShowPwdConfirm(false);
    if (!user.email) { Alert.alert('ไม่พบอีเมล'); return; }
    try {
      await doSendResetEmail(user.email);
      Alert.alert('📧 ส่งเมลแล้ว!', `ลิงก์เปลี่ยนรหัสผ่านถูกส่งไปที่\n${user.email}\n\nกรุณาตรวจสอบกล่องขาเข้า`);
    } catch (e: any) { Alert.alert('เกิดข้อผิดพลาด', e.message); }
  };

  // ── RATING ────────────────────────────────────────────────────────
  const openRating = () => {
    setNewRating(user.appRating || 0);
    setNewReview(user.appReview || '');
    setShowRating(true);
  };
  const saveRating = async () => {
    if (newRating === 0) { Alert.alert('กรุณาเลือกจำนวนดาว'); return; }
    setSaving(true);
    try { await persist({ appRating: newRating, appReview: newReview }); setShowRating(false); }
    catch (e: any) { Alert.alert('เกิดข้อผิดพลาด', e.message); }
    finally { setSaving(false); }
  };

  // ── FAVS ──────────────────────────────────────────────────────────
  const openFavs = async () => {
    setShowFavs(true);
    setFavsLoading(true);
    try {
      const names: string[] = user.favorites || [];
      if (!names.length) { setFavProducts([]); return; }
      const all = await doGetDocs(doCollection('สินค้า'));
      setFavProducts(names.map(name =>
        all.find((p: any) => p.ชื่อ === name || p.id === name) || { id: name, ชื่อ: name, รูปภาพ: [] }
      ));
    } catch { setFavProducts([]); }
    finally { setFavsLoading(false); }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────
  const handleLogout = () => {
    console.log('🔓 [handleLogout] Alert opening...');
    Alert.alert('🚪 ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ',
        style: 'destructive',
        onPress: async () => {
          console.log('🔓 [Logout] Starting logout process...');
          console.log('🔓 [Logout] doSignOut function:', typeof doSignOut);
          console.log('🔓 [Logout] clearUser function:', typeof clearUser);
          console.log('🔓 [Logout] navigation:', typeof navigation);

          // 1. Sign out from Firebase
          try {
            console.log('🔓 [Logout] Calling doSignOut()...');
            await doSignOut();
            console.log('✓ [Logout] doSignOut() success');
          } catch (e: any) {
            console.error('❌ [Logout] doSignOut() error:', e);
            throw e;
          }

          // 2. Clear AsyncStorage
          try {
            console.log('🧹 [Logout] Clearing AsyncStorage...');
            await AsyncStorage.multiRemove(['user', 'auth_user', 'upf_user']);
            console.log('✓ [Logout] AsyncStorage cleared');
          } catch (e: any) {
            console.error('❌ [Logout] AsyncStorage error:', e);
          }

          // 3. Clear user store
          try {
            console.log('🧹 [Logout] Calling clearUser()...');
            clearUser();
            console.log('✓ [Logout] clearUser() called');
          } catch (e: any) {
            console.error('❌ [Logout] clearUser error:', e);
          }

          // 4. Reset navigation
          try {
            console.log('🚀 [Logout] Calling navigation.reset()...');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
            console.log('✓ [Logout] navigation.reset() called');
          } catch (e: any) {
            console.error('❌ [Logout] navigation.reset() error:', e);
          }

          console.log('✓ [Logout] Complete');
        },
      },
    ]);
  };

  const todayFoods: string[] = user[`Food${todayKey()}`] || [];
  const scannedPhotos: any[] = user.scannedPhotos || [];

  // ── render ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>โปรไฟล์</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile section */}
        <View style={s.profileSection}>
          <View style={s.profileGlow} />

          {/* Avatar — กดดูรูปใหญ่ + เปลี่ยนรูป */}
          <TouchableOpacity onPress={() => { cancelAvatar(); setShowAvatar(true); }} activeOpacity={0.85}>
            <View style={s.avatarBox}>
              {user.avatar
                ? <Image source={{ uri: user.avatar }} style={s.avatarImg} />
                : <Text style={s.avatarEmoji}>👤</Text>}
            </View>
          </TouchableOpacity>

          {/* Name — กดเพื่อแก้ไข */}
          <TouchableOpacity onPress={() => { setNewName(user.name || ''); setShowNameConfirm(true); }}>
            <Text style={s.userName}>{user.name || '-'}{'  '}<Text style={{ fontSize:14, color:GREEN }}>✎</Text></Text>
          </TouchableOpacity>

          <Text style={s.userEmail}>{user.email}</Text>
          <View style={s.memberBadge}>
            <Text style={s.memberText}>🏅 สมาชิกตั้งแต่ {
              user.memberSince
                ? (typeof user.memberSince === 'string'
                    ? user.memberSince.slice(0,10)
                    : user.memberSince?.seconds
                      ? new Date(user.memberSince.seconds*1000).toLocaleDateString('th-TH')
                      : '-')
                : '-'
            }</Text>
          </View>
        </View>

        {/* Health score */}
        <View style={s.healthCard}>
          <Text style={s.healthTitle}>คะแนนสุขภาพของคุณวันนี้</Text>
          <View style={s.healthScoreBox}>
            <Text style={[s.healthScoreNum, { color: healthLevel.color }]}>{todayScore}</Text>
            <Text style={s.healthScoreMax}>/100</Text>
          </View>
          <View style={s.scoreBarTrack}>
            <View style={[s.scoreBarFill, { width:`${Math.min(todayScore,100)}%` as any, backgroundColor:healthLevel.color }]} />
          </View>
          <View style={[s.healthLevelBadge, { backgroundColor:healthLevel.color+'22', borderColor:healthLevel.color+'55' }]}>
            <Text style={[s.healthLevelText, { color:healthLevel.color }]}>{healthLevel.label}</Text>
          </View>
          <Text style={s.healthDesc}>คะแนนคำนวณจากอาหารที่รับประทานในวันนี้ (รีเซ็ททุกวัน)</Text>
          {todayFoods.length > 0 && (
            <View style={{ marginTop:10 }}>
              <Text style={{ color:MUTED, fontSize:12, marginBottom:4 }}>วันนี้กินไปแล้ว:</Text>
              {todayFoods.map((f,i) => <Text key={i} style={{ color:TEXT, fontSize:12 }}>• {f}</Text>)}
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={s.statsSection}>
          <TouchableOpacity style={s.statCard} onPress={openFavs}>
            <Text style={s.statIcon}>❤️</Text>
            <Text style={s.statValue}>{user.favoriteProducts ?? (user.favorites?.length ?? 0)}</Text>
            <Text style={s.statLabel}>รายการโปรด</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⚙️ ตั้งค่าบัญชี</Text>
          <MenuItem icon="🔒" bg="rgba(254,202,87,0.1)" title="เปลี่ยนรหัสผ่าน"  sub="ส่งลิงก์เปลี่ยนรหัสไปที่อีเมล"     onPress={() => setShowPwdConfirm(true)} />
          <MenuItem icon="🎯" bg="rgba(243,156,18,0.1)" title="เป้าหมายสุขภาพ"   sub={user.healthGoal || 'ยังไม่ได้ตั้งเป้าหมาย'} onPress={openGoal} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>❓ ช่วยเหลือและสนับสนุน</Text>
          <MenuItem icon="📚" bg={GREEN_DIM}              title="เกี่ยวกับ UPF"  sub="ข้อมูลและวิธีใช้งาน"                onPress={() => setShowAbout(true)} />
          <MenuItem icon="💬" bg="rgba(46,204,113,0.07)"  title="ติดต่อเรา"      sub="ส่งความคิดเห็นหรือรายงานปัญหา"     onPress={() => setShowContact(true)} />
          <MenuItem icon="⭐" bg="rgba(254,202,87,0.08)"  title="ให้คะแนนแอป"   sub={user.appRating ? `${user.appRating} ดาว` : 'ช่วยเราพัฒนาให้ดีขึ้น'} onPress={openRating} />
        </View>

        <TouchableOpacity style={s.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={s.logoutButtonText}>🚪 ออกจากระบบ</Text>
        </TouchableOpacity>

        <Text style={s.versionText}>UPF v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══════════ MODALS ══════════ */}

      {/* Avatar modal */}
      <Modal visible={showAvatar} transparent animationType="fade"
        onRequestClose={() => { cancelAvatar(); setShowAvatar(false); }}>
        <Pressable style={ov.bg} onPress={() => { cancelAvatar(); setShowAvatar(false); }}>
          <Pressable style={[ov.box, { alignItems:'center' }]} onPress={e => e.stopPropagation()}>
            <Text style={ov.title}>รูปโปรไฟล์</Text>

            {/* preview: รูปที่เลือกใหม่ (local uri) หรือรูปเดิม (data uri / https) */}
            <View style={s.avatarLarge}>
              {(previewUri || user.avatar)
                ? <Image source={{ uri: previewUri || user.avatar }} style={s.avatarLargeImg} />
                : <Text style={{ fontSize:70 }}>👤</Text>}
            </View>

            <TouchableOpacity style={[s.btnPrimary, { marginTop:20, width:'100%' }]} onPress={handlePickAvatar}>
              <Text style={s.btnPrimaryText}>📷 เลือกรูปจากคลัง</Text>
            </TouchableOpacity>

            {previewUri ? (
              <View style={{ flexDirection:'row', gap:10, marginTop:12, width:'100%' }}>
                <TouchableOpacity style={[s.btnSecondary,{flex:1}]} onPress={cancelAvatar}>
                  <Text style={s.btnSecondaryText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btnPrimary,{flex:1}]} onPress={saveAvatar} disabled={saving}>
                  {saving ? <ActivityIndicator color={BG} /> : <Text style={s.btnPrimaryText}>บันทึก</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[s.btnSecondary,{marginTop:10,width:'100%'}]} onPress={() => setShowAvatar(false)}>
                <Text style={s.btnSecondaryText}>ปิด</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Name confirm */}
      <OverlayModal visible={showNameConfirm} onClose={() => setShowNameConfirm(false)} title="แก้ไขชื่อ">
        <Text style={{ color:MUTED, fontSize:14, marginBottom:20, textAlign:'center' }}>คุณต้องการเปลี่ยนชื่อหรือไม่?</Text>
        <View style={{ flexDirection:'row', gap:10 }}>
          <TouchableOpacity style={[s.btnSecondary,{flex:1}]} onPress={() => setShowNameConfirm(false)}>
            <Text style={s.btnSecondaryText}>ไม่</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary,{flex:1}]}
            onPress={() => { setShowNameConfirm(false); setShowNameEdit(true); }}>
            <Text style={s.btnPrimaryText}>ใช่</Text>
          </TouchableOpacity>
        </View>
      </OverlayModal>

      {/* Name edit */}
      <OverlayModal visible={showNameEdit} onClose={() => setShowNameEdit(false)} title="เปลี่ยนชื่อ">
        <TextInput style={s.input} value={newName} onChangeText={setNewName}
          placeholder="กรอกชื่อใหม่" placeholderTextColor={MUTED} autoFocus />
        <View style={{ flexDirection:'row', gap:10, marginTop:16 }}>
          <TouchableOpacity style={[s.btnSecondary,{flex:1}]} onPress={() => setShowNameEdit(false)}>
            <Text style={s.btnSecondaryText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary,{flex:1}]} onPress={saveName} disabled={saving}>
            {saving ? <ActivityIndicator color={BG} /> : <Text style={s.btnPrimaryText}>บันทึก</Text>}
          </TouchableOpacity>
        </View>
      </OverlayModal>

      {/* Password confirm */}
      <OverlayModal visible={showPwdConfirm} onClose={() => setShowPwdConfirm(false)} title="🔒 เปลี่ยนรหัสผ่าน">
        <Text style={{ color:MUTED, fontSize:14, textAlign:'center', marginBottom:8 }}>ระบบจะส่งลิงก์เปลี่ยนรหัสผ่านไปที่:</Text>
        <View style={{ backgroundColor:SURFACE2, borderRadius:10, padding:12, borderWidth:1, borderColor:BORDER, marginBottom:20 }}>
          <Text style={{ color:GREEN, fontSize:14, fontWeight:'700', textAlign:'center' }}>{user.email || 'ไม่พบอีเมล'}</Text>
        </View>
        <View style={{ flexDirection:'row', gap:10 }}>
          <TouchableOpacity style={[s.btnSecondary,{flex:1}]} onPress={() => setShowPwdConfirm(false)}>
            <Text style={s.btnSecondaryText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary,{flex:1}]} onPress={doResetPassword}>
            <Text style={s.btnPrimaryText}>ส่งเมล</Text>
          </TouchableOpacity>
        </View>
      </OverlayModal>

      {/* Goal */}
      <OverlayModal visible={showGoal} onClose={() => setShowGoal(false)} title="🎯 เป้าหมายสุขภาพ">
        <TextInput style={[s.input,{minHeight:80,textAlignVertical:'top'}]}
          value={newGoal} onChangeText={setNewGoal}
          placeholder="เช่น ลดน้ำหนัก 5 กก. ใน 3 เดือน"
          placeholderTextColor={MUTED} multiline autoFocus />
        <View style={{ flexDirection:'row', gap:10, marginTop:16 }}>
          <TouchableOpacity style={[s.btnSecondary,{flex:1}]} onPress={() => setShowGoal(false)}>
            <Text style={s.btnSecondaryText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary,{flex:1}]} onPress={saveGoal} disabled={saving}>
            {saving ? <ActivityIndicator color={BG} /> : <Text style={s.btnPrimaryText}>บันทึก</Text>}
          </TouchableOpacity>
        </View>
      </OverlayModal>

      {/* About UPF */}
      <OverlayModal visible={showAbout} onClose={() => setShowAbout(false)} title="📚 เกี่ยวกับ UPF">
        <ScrollView style={{ maxHeight:300 }}>
          <Text style={{ color:TEXT, fontSize:14, lineHeight:22 }}>
            <Text style={{ color:GREEN, fontWeight:'800' }}>UPF (Ultra-Processed Food)</Text>
            {' '}หรือ <Text style={{ color:GREEN, fontWeight:'800' }}>อาหารแปรรูปขั้นสูง</Text>
            {' '}คือ ผลิตภัณฑ์อาหารที่ผ่านกระบวนการอุตสาหกรรมหลายขั้นตอน มักมีส่วนผสมสังเคราะห์ สารเติมแต่ง (สี, กลิ่น, รส, สารกันเสีย) สูง และมีสารอาหารน้อย{'\n\n'}
            ส่วนใหญ่มีน้ำตาล โซเดียม และไขมันสูง ทำให้เสพติดง่าย เก็บได้นาน และส่งผลเสียต่อสุขภาพ เช่น โรคอ้วน เบาหวาน และโรคหัวใจ
          </Text>
        </ScrollView>
        <TouchableOpacity style={[s.btnSecondary,{marginTop:16}]} onPress={() => setShowAbout(false)}>
          <Text style={s.btnSecondaryText}>ปิด</Text>
        </TouchableOpacity>
      </OverlayModal>

      {/* Contact */}
      <OverlayModal visible={showContact} onClose={() => setShowContact(false)} title="💬 ติดต่อเรา">
        <Text style={{ color:MUTED, fontSize:14, marginBottom:8, textAlign:'center' }}>ส่งความคิดเห็นหรือรายงานปัญหามาที่:</Text>
        <View style={{ backgroundColor:SURFACE2, borderRadius:10, padding:14, borderWidth:1, borderColor:BORDER }}>
          <Text style={{ color:GREEN, fontSize:15, fontWeight:'700', textAlign:'center' }}>6731503001@lamduan.mfu.ac.th</Text>
        </View>
        <TouchableOpacity style={[s.btnSecondary,{marginTop:16}]} onPress={() => setShowContact(false)}>
          <Text style={s.btnSecondaryText}>ปิด</Text>
        </TouchableOpacity>
      </OverlayModal>

      {/* Rating */}
      <OverlayModal visible={showRating} onClose={() => setShowRating(false)} title="⭐ ให้คะแนนแอป">
        <Text style={{ color:MUTED, fontSize:13, textAlign:'center', marginBottom:12 }}>เลือกจำนวนดาว:</Text>
        <View style={{ flexDirection:'row', justifyContent:'center', marginBottom:16, gap:8 }}>
          {[1,2,3,4,5].map(star => (
            <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
              <Text style={{ fontSize:36, opacity: star<=newRating ? 1 : 0.22, color:YELLOW }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput style={[s.input,{minHeight:80,textAlignVertical:'top'}]}
          value={newReview} onChangeText={t => setNewReview(t.slice(0,500))}
          placeholder="เขียนรีวิวแอปของเรา... (สูงสุด 500 ตัวอักษร)"
          placeholderTextColor={MUTED} multiline />
        <Text style={{ color:MUTED, fontSize:11, textAlign:'right', marginTop:4 }}>{newReview.length}/500</Text>
        <View style={{ flexDirection:'row', gap:10, marginTop:12 }}>
          <TouchableOpacity style={[s.btnSecondary,{flex:1}]} onPress={() => setShowRating(false)}>
            <Text style={s.btnSecondaryText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary,{flex:1}]} onPress={saveRating} disabled={saving||newRating===0}>
            {saving ? <ActivityIndicator color={BG} /> : <Text style={s.btnPrimaryText}>บันทึก</Text>}
          </TouchableOpacity>
        </View>
      </OverlayModal>

      {/* Scanned */}
      <Modal visible={showScanned} transparent animationType="slide" onRequestClose={() => setShowScanned(false)}>
        <Pressable style={ov.bg} onPress={() => setShowScanned(false)}>
          <Pressable style={[ov.box,{maxHeight:'80%'}]} onPress={e => e.stopPropagation()}>
            <Text style={ov.title}>📷 สินค้าที่สแกนแล้ว</Text>
            {scannedPhotos.length === 0 ? (
              <View style={{ alignItems:'center', paddingVertical:24 }}>
                <Text style={{ color:MUTED, fontSize:15, marginBottom:20 }}>คุณยังไม่ได้สแกนสินค้าใดๆ</Text>
                <TouchableOpacity style={s.btnPrimary}
                  onPress={() => { setShowScanned(false); navigation.navigate('Scanner'); }}>
                  <Text style={s.btnPrimaryText}>📷 ไปหน้าสแกน</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList data={scannedPhotos} keyExtractor={(_,i) => String(i)} style={{ maxHeight:400 }}
                renderItem={({ item }) => (
                  <View style={s.listItem}>
                    {item.url
                      ? <Image source={{ uri:item.url }} style={s.listThumb} />
                      : <View style={[s.listThumb,{backgroundColor:SURFACE2,justifyContent:'center',alignItems:'center'}]}>
                          <Text style={{ fontSize:24 }}>🍱</Text></View>}
                    <View style={{ flex:1, marginLeft:12 }}>
                      <Text style={{ color:TEXT, fontWeight:'700', fontSize:14 }}>{item.name||'ไม่มีชื่อ'}</Text>
                      {item.date && <Text style={{ color:MUTED, fontSize:11, marginTop:2 }}>{item.date}</Text>}
                    </View>
                  </View>
                )} />
            )}
            <TouchableOpacity style={[s.btnSecondary,{marginTop:12}]} onPress={() => setShowScanned(false)}>
              <Text style={s.btnSecondaryText}>ปิด</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Favorites */}
      <Modal visible={showFavs} transparent animationType="slide" onRequestClose={() => setShowFavs(false)}>
        <Pressable style={ov.bg} onPress={() => setShowFavs(false)}>
          <Pressable style={[ov.box,{maxHeight:'80%'}]} onPress={e => e.stopPropagation()}>
            <Text style={ov.title}>❤️ รายการโปรด ({user.favorites?.length ?? 0})</Text>
            {favsLoading
              ? <ActivityIndicator color={GREEN} style={{ marginVertical:24 }} />
              : favProducts.length === 0
                ? <Text style={{ color:MUTED, fontSize:14, textAlign:'center', paddingVertical:24 }}>ยังไม่มีรายการโปรด</Text>
                : <FlatList data={favProducts} keyExtractor={(item:any) => item.id} style={{ maxHeight:400 }}
                    renderItem={({ item }:any) => {
                      const img = (item.รูปภาพ||[])[0]||'';
                      return (
                        <View style={s.listItem}>
                          {img
                            ? <Image source={{ uri:img }} style={s.listThumb} />
                            : <View style={[s.listThumb,{backgroundColor:SURFACE2,justifyContent:'center',alignItems:'center'}]}>
                                <Text style={{ fontSize:24 }}>🍱</Text></View>}
                          <View style={{ flex:1, marginLeft:12 }}>
                            <Text style={{ color:TEXT, fontWeight:'700', fontSize:14 }}>{item.ชื่อ||item.id}</Text>
                            <Text style={{ color:MUTED, fontSize:12, marginTop:2 }}>{item.ประเภท||''}</Text>
                            {item.แคลอรี่ ? <Text style={{ color:GREEN, fontSize:12 }}>{item.แคลอรี่}</Text> : null}
                          </View>
                        </View>
                      );
                    }} />}
            <TouchableOpacity style={[s.btnSecondary,{marginTop:12}]} onPress={() => setShowFavs(false)}>
              <Text style={s.btnSecondaryText}>ปิด</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
};

// ── MenuItem ──────────────────────────────────────────────────────
const MenuItem = ({ icon, bg, title, sub, onPress }:
  { icon:string; bg:string; title:string; sub:string; onPress:()=>void }) => (
  <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.8}>
    <View style={s.menuItemLeft}>
      <View style={[s.menuIconBox,{backgroundColor:bg}]}>
        <Text style={s.menuIcon}>{icon}</Text>
      </View>
      <View style={s.menuTextBox}>
        <Text style={s.menuItemTitle}>{title}</Text>
        <Text style={s.menuItemSubtitle} numberOfLines={1}>{sub}</Text>
      </View>
    </View>
    <Text style={s.menuArrow}>›</Text>
  </TouchableOpacity>
);

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:       { flex:1, backgroundColor:BG },
  header:          { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, paddingVertical:12, backgroundColor:SURFACE, borderBottomWidth:1, borderBottomColor:BORDER },
  backBtn:         { width:40, height:40, borderRadius:20, backgroundColor:GREEN_DIM, justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:BORDER },
  backIcon:        { fontSize:28, color:GREEN, fontWeight:'300' },
  headerTitle:     { fontSize:16, fontWeight:'700', color:TEXT },
  profileSection:  { alignItems:'center', paddingVertical:32, backgroundColor:SURFACE, borderBottomWidth:1, borderBottomColor:BORDER, marginBottom:16, overflow:'hidden' },
  profileGlow:     { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:GREEN, opacity:0.05, top:-60 },
  avatarBox:       { width:90, height:90, borderRadius:45, backgroundColor:GREEN_DIM, justifyContent:'center', alignItems:'center', marginBottom:14, borderWidth:2, borderColor:GREEN, overflow:'hidden' },
  avatarImg:       { width:90, height:90, borderRadius:45 },
  avatarEmoji:     { fontSize:44 },
  editBadge:       { position:'absolute', bottom:0, right:0, backgroundColor:GREEN, width:26, height:26, borderRadius:13, justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:BG },
  avatarLarge:     { width:140, height:140, borderRadius:70, backgroundColor:SURFACE2, overflow:'hidden', justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:GREEN },
  avatarLargeImg:  { width:140, height:140, borderRadius:70 },
  userName:        { fontSize:22, fontWeight:'800', color:TEXT, marginBottom:4 },
  userEmail:       { fontSize:13, color:MUTED, marginBottom:12 },
  memberBadge:     { backgroundColor:GREEN_DIM, paddingVertical:6, paddingHorizontal:16, borderRadius:20, borderWidth:1, borderColor:BORDER },
  memberText:      { fontSize:12, color:GREEN, fontWeight:'600' },
  healthCard:      { backgroundColor:SURFACE, marginHorizontal:16, marginBottom:16, borderRadius:18, padding:20, borderWidth:1, borderColor:BORDER },
  healthTitle:     { fontSize:16, fontWeight:'700', color:TEXT, marginBottom:16, textAlign:'center' },
  healthScoreBox:  { flexDirection:'row', alignItems:'baseline', justifyContent:'center', marginBottom:12 },
  healthScoreNum:  { fontSize:52, fontWeight:'800' },
  healthScoreMax:  { fontSize:22, fontWeight:'600', color:MUTED, marginLeft:4 },
  scoreBarTrack:   { height:6, backgroundColor:SURFACE2, borderRadius:3, marginBottom:14, overflow:'hidden' },
  scoreBarFill:    { height:'100%', borderRadius:3 },
  healthLevelBadge:{ alignSelf:'center', paddingVertical:6, paddingHorizontal:20, borderRadius:20, marginBottom:12, borderWidth:1 },
  healthLevelText: { fontSize:13, fontWeight:'700' },
  healthDesc:      { fontSize:12, color:MUTED, textAlign:'center', lineHeight:18 },
  statsSection:    { flexDirection:'row', paddingHorizontal:16, gap:12, marginBottom:20 },
  statCard:        { flex:1, backgroundColor:SURFACE, borderRadius:14, paddingVertical:20, alignItems:'center', borderWidth:1, borderColor:BORDER },
  statIcon:        { fontSize:28, marginBottom:8 },
  statValue:       { fontSize:24, fontWeight:'800', color:GREEN, marginBottom:4 },
  statLabel:       { fontSize:12, color:MUTED, textAlign:'center' },
  section:         { paddingHorizontal:16, marginBottom:20 },
  sectionTitle:    { fontSize:14, fontWeight:'700', color:MUTED, marginBottom:10, letterSpacing:0.5 },
  menuItem:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:SURFACE, paddingVertical:12, paddingHorizontal:14, borderRadius:12, marginBottom:8, borderWidth:1, borderColor:BORDER },
  menuItemLeft:    { flexDirection:'row', alignItems:'center', flex:1 },
  menuIconBox:     { width:40, height:40, borderRadius:10, justifyContent:'center', alignItems:'center' },
  menuIcon:        { fontSize:18 },
  menuTextBox:     { marginLeft:12, flex:1 },
  menuItemTitle:   { fontSize:14, fontWeight:'600', color:TEXT, marginBottom:2 },
  menuItemSubtitle:{ fontSize:11, color:MUTED },
  menuArrow:       { fontSize:22, color:BORDER, fontWeight:'300' },
  logoutButton:    { marginHorizontal:16, marginVertical:16, paddingVertical:14, backgroundColor:RED_DIM, borderRadius:14, alignItems:'center', borderWidth:1, borderColor:'rgba(255,107,107,0.3)' },
  logoutButtonText:{ fontSize:15, fontWeight:'700', color:RED },
  versionText:     { fontSize:11, color:MUTED, textAlign:'center', marginBottom:8 },
  btnPrimary:      { backgroundColor:GREEN, borderRadius:12, paddingVertical:12, paddingHorizontal:20, alignItems:'center', justifyContent:'center' },
  btnPrimaryText:  { color:BG, fontWeight:'700', fontSize:14 },
  btnSecondary:    { backgroundColor:SURFACE2, borderRadius:12, paddingVertical:12, paddingHorizontal:20, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:BORDER },
  btnSecondaryText:{ color:MUTED, fontWeight:'600', fontSize:14 },
  input:           { backgroundColor:SURFACE2, borderWidth:1, borderColor:BORDER, borderRadius:10, padding:12, fontSize:14, color:TEXT, marginTop:4 },
  listItem:        { flexDirection:'row', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'rgba(46,204,113,0.08)' },
  listThumb:       { width:52, height:52, borderRadius:10, flexShrink:0 },
});

export default ProfileScreen;