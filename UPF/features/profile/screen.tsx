// features/profile/screen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, TextInput, Image,
  Alert, ActivityIndicator, FlatList, Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// ── Firebase ──────────────────────────────────────────────────
import { auth, db, storage } from '../../core/services/firebase';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc, getDocs, collection, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ── Helpers ───────────────────────────────────────────────────
const getDbRef         = (uid: string) => doc(db, 'users', uid);
const doSignOut        = () => signOut(auth);
const doSendResetEmail = (email: string) => sendPasswordResetEmail(auth, email);
const doGetDocs        = async (col: any) => {
  const snap = await getDocs(col);
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
};
const doCollection = (name: string) => collection(db, name);

let useUserStore: any = (sel: any) =>
  sel({ user: null, setUser: () => {}, clearUser: () => {} });
try { useUserStore = require('../../core/store/userStore').useUserStore; } catch {}

// ── Colors ────────────────────────────────────────────────────
const BG       = '#0a0f0d';
const SURFACE  = '#111a14';
const SURFACE2 = '#162019';
const GREEN    = '#2ecc71';
const GREEN_DIM= 'rgba(46,204,113,0.12)';
const RED      = '#ff6b6b';
const RED_DIM  = 'rgba(255,107,107,0.12)';
const YELLOW   = '#feca57';
const MUTED    = '#7a9982';
const TEXT     = '#e8f5ec';
const BORDER   = 'rgba(46,204,113,0.18)';

const todayStr = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD

// ── Overlay modal ─────────────────────────────────────────────
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

// ═════════════════════════════════════════════════════════════
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
  const [showEatHistory,  setShowEatHistory]  = useState(false);

  const [newName,     setNewName]     = useState('');
  const [newGoal,     setNewGoal]     = useState('');
  const [previewUri,  setPreviewUri]  = useState(''); // local file:// URI สำหรับ preview
  const [newRating,   setNewRating]   = useState(0);
  const [newReview,   setNewReview]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false); // สถานะ upload รูป
  const [favProducts, setFavProducts] = useState<any[]>([]);
  const [favsLoading, setFavsLoading] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);

  if (!user) return null;

  const uid     = user.uid;
  const userRef = getDbRef(uid);

  const today      = todayStr();
  const todayScore: number = user[`healthScore_${today}`] ?? 0;
  const todayFoods: any[]  = (user.eatHistory ?? {})[today] ?? [];

  const getHealthLevel = (score: number) => {
    if (score >= 80) return { label: 'ดีเยี่ยม',     color: GREEN   };
    if (score >= 60) return { label: 'ดี',            color: YELLOW  };
    if (score >= 40) return { label: 'ปกติ',          color: '#f39c12' };
    return               { label: 'ควรปรับปรุง', color: RED     };
  };
  const healthLevel = getHealthLevel(todayScore);

  const persist = async (fields: Record<string, any>) => {
    await updateDoc(userRef, fields);
    setUser({ ...user, ...fields });
  };

  // ── AVATAR: อัปโหลดไป Firebase Storage → เก็บ URL ใน Firestore ──
  // gs://upf001-b206e.firebasestorage.app/profile_photos/{uid}/avatar.jpg
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
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const cancelAvatar = () => setPreviewUri('');

  const saveAvatar = async () => {
    if (!previewUri) { Alert.alert('กรุณาเลือกรูปก่อน'); return; }
    setUploading(true);
    try {
      // 1. fetch local file → ArrayBuffer → Uint8Array (รองรับทั้ง iOS และ Android)
      const fetchResponse = await fetch(previewUri);
      const arrayBuffer   = await fetchResponse.arrayBuffer();
      const uint8Array    = new Uint8Array(arrayBuffer);

      // 2. อัปโหลดไป Firebase Storage
      //    path: profile_photos/{uid}/avatar.jpg
      const storageRef = ref(storage, `profile_photos/${uid}/avatar.jpg`);
      await uploadBytes(storageRef, uint8Array, { contentType: 'image/jpeg' });

      // 3. ดึง download URL (HTTPS URL ถาวร ไม่หมดอายุ)
      const downloadURL = await getDownloadURL(storageRef);

      // 4. บันทึก URL ลง Firestore field "avatar"
      await persist({ avatar: downloadURL });

      cancelAvatar();
      setShowAvatar(false);
      Alert.alert('✅ สำเร็จ', 'เปลี่ยนรูปโปรไฟล์เรียบร้อย');
    } catch (e: any) {
      console.error('[Avatar upload]', e);
      Alert.alert('อัปโหลดไม่สำเร็จ', e.message ?? String(e));
    } finally {
      setUploading(false);
    }
  };

  // ── NAME ─────────────────────────────────────────────────────
  const saveName = async () => {
    if (!newName.trim()) { Alert.alert('กรุณากรอกชื่อ'); return; }
    setSaving(true);
    try { await persist({ name: newName.trim() }); setShowNameEdit(false); }
    catch (e: any) { Alert.alert('เกิดข้อผิดพลาด', e.message); }
    finally { setSaving(false); }
  };

  // ── GOAL ─────────────────────────────────────────────────────
  const openGoal = () => { setNewGoal(user.healthGoal || ''); setShowGoal(true); };
  const saveGoal = async () => {
    setSaving(true);
    try { await persist({ healthGoal: newGoal.trim() }); setShowGoal(false); }
    catch (e: any) { Alert.alert('เกิดข้อผิดพลาด', e.message); }
    finally { setSaving(false); }
  };

  // ── PASSWORD ─────────────────────────────────────────────────
  const doResetPassword = async () => {
    setShowPwdConfirm(false);
    if (!user.email) { Alert.alert('ไม่พบอีเมล'); return; }
    try {
      await doSendResetEmail(user.email);
      Alert.alert('📧 ส่งเมลแล้ว!', `ลิงก์เปลี่ยนรหัสผ่านถูกส่งไปที่\n${user.email}`);
    } catch (e: any) { Alert.alert('เกิดข้อผิดพลาด', e.message); }
  };

  // ── RATING ───────────────────────────────────────────────────
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

  // ── FAVS ─────────────────────────────────────────────────────
  const openFavs = async () => {
    setShowFavs(true);
    setFavsLoading(true);
    try {
      const names: string[] = user.favorites || [];
      if (!names.length) { setFavProducts([]); return; }
      const all = await doGetDocs(doCollection('สินค้า'));
      setFavProducts(names.map(name =>
        all.find((p: any) => p.ชื่อ === name || p.id === name) ||
        { id: name, ชื่อ: name, รูปภาพ: [] }
      ));
    } catch { setFavProducts([]); }
    finally { setFavsLoading(false); }
  };

  // ── DELETE FOOD ───────────────────────────────────────────────
  const handleDeleteFood = (index: number) => {
    const food = todayFoods[index];
    if (!food) return;

    Alert.alert(
      '🗑️ ลบอาหาร',
      `ลบ "${food.productName}" ออกจากรายการวันนี้?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            setDeletingIdx(index);
            try {
              const freshSnap = await getDoc(userRef);
              if (!freshSnap.exists()) throw new Error('ไม่พบข้อมูล user');

              const freshData    = freshSnap.data();
              const freshHistory = (freshData.eatHistory ?? {}) as Record<string, any[]>;
              const freshToday   = [...(freshHistory[today] ?? [])];
              if (index >= freshToday.length) throw new Error('รายการไม่ถูกต้อง');

              const [removed] = freshToday.splice(index, 1);
              const removedScore: number =
                typeof removed.scoreChange === 'number' ? removed.scoreChange
                : typeof removed.score     === 'number' ? removed.score
                : 0;

              const newDayScore = freshToday.reduce((sum: number, f: any) => {
                const sc =
                  typeof f.scoreChange === 'number' ? f.scoreChange
                  : typeof f.score     === 'number' ? f.score : 0;
                return sum + sc;
              }, 0);

              const newTotal = (freshData.healthScore ?? 0) - removedScore;
              const newEatHistory: Record<string, any[]> = { ...freshHistory, [today]: freshToday };
              if (freshToday.length === 0) delete newEatHistory[today];

              await updateDoc(userRef, {
                eatHistory:               newEatHistory,
                [`healthScore_${today}`]: newDayScore,
                healthScore:              newTotal,
              });

              setUser({
                ...user,
                eatHistory:               newEatHistory,
                [`healthScore_${today}`]: newDayScore,
                healthScore:              newTotal,
              });
            } catch (e: any) {
              Alert.alert('เกิดข้อผิดพลาด', e.message ?? String(e));
            } finally {
              setDeletingIdx(null);
            }
          },
        },
      ]
    );
  };

  // ── LOGOUT ───────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [
      { text: 'ไม่', style: 'cancel' },
      {
        text: 'ใช่ ออกจากระบบ',
        style: 'destructive',
        onPress: async () => {
          try { await doSignOut(); } catch {}
          try { await AsyncStorage.clear(); } catch {}
          clearUser();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const scannedPhotos: any[] = user.scannedPhotos || [];

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

        {/* Profile */}
        <View style={s.profileSection}>
          <View style={s.profileGlow} />
          <TouchableOpacity onPress={() => { cancelAvatar(); setShowAvatar(true); }} activeOpacity={0.85}>
            <View style={s.avatarBox}>
              {user.avatar && user.avatar.length > 0
                ? <Image
                    source={{ uri: user.avatar }}
                    style={s.avatarImg}
                    onError={() => setUser({ ...user, avatar: '' })}
                  />
                : <Text style={s.avatarEmoji}>👤</Text>}
            </View>
            <View style={s.editBadge}>
              <Text style={{ fontSize: 10, color: BG }}>✎</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setNewName(user.name || ''); setShowNameConfirm(true); }}
            style={{ marginTop: 4 }}
          >
            <Text style={s.userName}>
              {user.name || '-'}{'  '}
              <Text style={{ fontSize: 14, color: GREEN }}>✎</Text>
            </Text>
          </TouchableOpacity>

          <Text style={s.userEmail}>{user.email}</Text>
          <View style={s.memberBadge}>
            <Text style={s.memberText}>🏅 สมาชิกตั้งแต่ {
              user.memberSince
                ? (typeof user.memberSince === 'string'
                    ? user.memberSince.slice(0, 10)
                    : user.memberSince?.seconds
                      ? new Date(user.memberSince.seconds * 1000).toLocaleDateString('th-TH')
                      : '-')
                : '-'
            }</Text>
          </View>
        </View>

        {/* Health card */}
        <TouchableOpacity style={s.healthCard} onPress={() => setShowEatHistory(true)} activeOpacity={0.85}>
          <Text style={s.healthTitle}>คะแนนสุขภาพวันนี้ ({today})</Text>
          <View style={s.healthScoreBox}>
            <Text style={[s.healthScoreNum, { color: healthLevel.color }]}>{todayScore}</Text>
            <Text style={s.healthScoreMax}>/100</Text>
          </View>
          <View style={s.scoreBarTrack}>
            <View style={[s.scoreBarFill, {
              width: `${Math.min(Math.max(todayScore, 0), 100)}%` as any,
              backgroundColor: healthLevel.color,
            }]} />
          </View>
          <View style={[s.healthLevelBadge, {
            backgroundColor: healthLevel.color + '22',
            borderColor: healthLevel.color + '55',
          }]}>
            <Text style={[s.healthLevelText, { color: healthLevel.color }]}>{healthLevel.label}</Text>
          </View>
          <Text style={s.healthDesc}>คะแนนคำนวณจากอาหารที่กินวันนี้ (รีเซ็ตทุกวัน)</Text>
          <View style={s.historyHint}>
            <Text style={s.historyHintText}>
              🍽️ กดเพื่อดูรายการอาหารวันนี้ ({todayFoods.length} รายการ)
            </Text>
          </View>
        </TouchableOpacity>

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
          <MenuItem icon="🔒" bg="rgba(254,202,87,0.1)" title="เปลี่ยนรหัสผ่าน"
            sub="ส่งลิงก์เปลี่ยนรหัสไปที่อีเมล" onPress={() => setShowPwdConfirm(true)} />
          <MenuItem icon="🎯" bg="rgba(243,156,18,0.1)" title="เป้าหมายสุขภาพ"
            sub={user.healthGoal || 'ยังไม่ได้ตั้งเป้าหมาย'} onPress={openGoal} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>❓ ช่วยเหลือ</Text>
          <MenuItem icon="📚" bg={GREEN_DIM} title="เกี่ยวกับ UPF"
            sub="ข้อมูลและวิธีใช้งาน" onPress={() => setShowAbout(true)} />
          <MenuItem icon="💬" bg="rgba(46,204,113,0.07)" title="ติดต่อเรา"
            sub="ส่งความคิดเห็นหรือรายงานปัญหา" onPress={() => setShowContact(true)} />
          <MenuItem icon="⭐" bg="rgba(254,202,87,0.08)" title="ให้คะแนนแอป"
            sub={user.appRating ? `${user.appRating} ดาว` : 'ช่วยเราพัฒนาให้ดีขึ้น'} onPress={openRating} />
        </View>
        <Text style={s.versionText}>UPF v1.0.3</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══ EAT HISTORY MODAL ══ */}
      <Modal visible={showEatHistory} transparent animationType="slide"
        onRequestClose={() => setShowEatHistory(false)}>
        <Pressable style={ov.bg} onPress={() => setShowEatHistory(false)}>
          <Pressable style={[ov.box, { maxHeight: '85%' }]} onPress={e => e.stopPropagation()}>
            <Text style={ov.title}>🍽️ อาหารวันนี้ ({today})</Text>
            <View style={s.eatSummary}>
              <Text style={s.eatSummaryLabel}>คะแนนรวมวันนี้</Text>
              <Text style={[s.eatSummaryScore, { color: healthLevel.color }]}>{todayScore} / 100</Text>
            </View>
            {todayFoods.length === 0 ? (
              <Text style={{ color: MUTED, fontSize: 14, textAlign: 'center', paddingVertical: 24 }}>
                ยังไม่ได้กินอาหารใดๆ วันนี้
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                {todayFoods.map((food: any, i: number) => {
                  const sc: number =
                    typeof food.scoreChange === 'number' ? food.scoreChange
                    : typeof food.score     === 'number' ? food.score : 0;
                  return (
                    <View key={`${i}-${food.productName}`} style={s.eatItem}>
                      <View style={s.eatItemLeft}>
                        <View style={[s.eatDot, {
                          backgroundColor:
                            food.upfLevel === 'ต่ำ'      ? GREEN
                            : food.upfLevel === 'ปานกลาง' ? YELLOW
                            : food.upfLevel === 'สูง'      ? '#f39c12' : RED,
                        }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.eatName} numberOfLines={1}>{food.productName}</Text>
                          <Text style={s.eatMeta}>UPF {food.upfLevel || '-'}  •  {food.calories || food.แคลอรี่ || '-'}</Text>
                        </View>
                      </View>
                      <View style={s.eatItemRight}>
                        <Text style={[s.eatScore, { color: sc >= 0 ? GREEN : RED }]}>
                          {sc >= 0 ? '+' : ''}{sc}
                        </Text>
                        <TouchableOpacity
                          style={[s.eatDeleteBtn, deletingIdx !== null && { opacity: 0.4 }]}
                          onPress={() => handleDeleteFood(i)}
                          disabled={deletingIdx !== null}
                        >
                          {deletingIdx === i
                            ? <ActivityIndicator size="small" color={RED} />
                            : <Text style={s.eatDeleteIcon}>🗑️</Text>}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity style={[s.btnSecondary, { marginTop: 16 }]}
              onPress={() => setShowEatHistory(false)}>
              <Text style={s.btnSecondaryText}>ปิด</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ══ AVATAR MODAL ══ */}
      <Modal visible={showAvatar} transparent animationType="fade"
        onRequestClose={() => { cancelAvatar(); setShowAvatar(false); }}>
        <Pressable style={ov.bg} onPress={() => { cancelAvatar(); setShowAvatar(false); }}>
          <Pressable style={[ov.box, { alignItems: 'center' }]} onPress={e => e.stopPropagation()}>
            <Text style={ov.title}>รูปโปรไฟล์</Text>

            {/* Preview รูป */}
            <View style={s.avatarLarge}>
              {(previewUri || user.avatar)
                ? <Image
                    source={{ uri: previewUri || user.avatar }}
                    style={s.avatarLargeImg}
                    onError={() => {}}
                  />
                : <Text style={{ fontSize: 70 }}>👤</Text>}
            </View>

            {/* แสดง storage path เพื่อ confirm */}
            {previewUri ? (
              <Text style={{ color: MUTED, fontSize: 11, marginTop: 8, textAlign: 'center' }}>
                จะอัปโหลดไป Firebase Storage{'\n'}
                profile_photos/{uid}/avatar.jpg
              </Text>
            ) : null}

            <TouchableOpacity
              style={[s.btnPrimary, { marginTop: 16, width: '100%' }]}
              onPress={handlePickAvatar}
              disabled={uploading}
            >
              <Text style={s.btnPrimaryText}>📷 เลือกรูปจากคลัง</Text>
            </TouchableOpacity>

            {previewUri ? (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, width: '100%' }}>
                <TouchableOpacity
                  style={[s.btnSecondary, { flex: 1 }]}
                  onPress={cancelAvatar}
                  disabled={uploading}
                >
                  <Text style={s.btnSecondaryText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btnPrimary, { flex: 1 }, uploading && { opacity: 0.6 }]}
                  onPress={saveAvatar}
                  disabled={uploading}
                >
                  {uploading
                    ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <ActivityIndicator color={BG} size="small" />
                        <Text style={[s.btnPrimaryText, { fontSize: 12 }]}>กำลังอัปโหลด...</Text>
                      </View>
                    )
                    : <Text style={s.btnPrimaryText}>☁️ บันทึก</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[s.btnSecondary, { marginTop: 12, width: '100%' }]}
                onPress={() => setShowAvatar(false)}
              >
                <Text style={s.btnSecondaryText}>ปิด</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ══ NAME CONFIRM ══ */}
      <OverlayModal visible={showNameConfirm} onClose={() => setShowNameConfirm(false)} title="แก้ไขชื่อ">
        <Text style={{ color: MUTED, fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
          คุณต้องการเปลี่ยนชื่อหรือไม่?
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={[s.btnSecondary, { flex: 1 }]} onPress={() => setShowNameConfirm(false)}>
            <Text style={s.btnSecondaryText}>ไม่</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]}
            onPress={() => { setShowNameConfirm(false); setShowNameEdit(true); }}>
            <Text style={s.btnPrimaryText}>ใช่</Text>
          </TouchableOpacity>
        </View>
      </OverlayModal>

      {/* ══ NAME EDIT ══ */}
      <OverlayModal visible={showNameEdit} onClose={() => setShowNameEdit(false)} title="เปลี่ยนชื่อ">
        <TextInput style={s.input} value={newName} onChangeText={setNewName}
          placeholder="กรอกชื่อใหม่" placeholderTextColor={MUTED} autoFocus />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <TouchableOpacity style={[s.btnSecondary, { flex: 1 }]} onPress={() => setShowNameEdit(false)}>
            <Text style={s.btnSecondaryText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]} onPress={saveName} disabled={saving}>
            {saving ? <ActivityIndicator color={BG} /> : <Text style={s.btnPrimaryText}>บันทึก</Text>}
          </TouchableOpacity>
        </View>
      </OverlayModal>

      {/* ══ PASSWORD ══ */}
      <OverlayModal visible={showPwdConfirm} onClose={() => setShowPwdConfirm(false)} title="🔒 เปลี่ยนรหัสผ่าน">
        <Text style={{ color: MUTED, fontSize: 14, textAlign: 'center', marginBottom: 8 }}>
          ระบบจะส่งลิงก์เปลี่ยนรหัสผ่านไปที่:
        </Text>
        <View style={{ backgroundColor: SURFACE2, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: BORDER, marginBottom: 20 }}>
          <Text style={{ color: GREEN, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>
            {user.email || 'ไม่พบอีเมล'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={[s.btnSecondary, { flex: 1 }]} onPress={() => setShowPwdConfirm(false)}>
            <Text style={s.btnSecondaryText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]} onPress={doResetPassword}>
            <Text style={s.btnPrimaryText}>ส่งเมล</Text>
          </TouchableOpacity>
        </View>
      </OverlayModal>

      {/* ══ GOAL ══ */}
      <OverlayModal visible={showGoal} onClose={() => setShowGoal(false)} title="🎯 เป้าหมายสุขภาพ">
        <TextInput style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
          value={newGoal} onChangeText={setNewGoal}
          placeholder="เช่น ลดน้ำหนัก 5 กก. ใน 3 เดือน"
          placeholderTextColor={MUTED} multiline autoFocus />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <TouchableOpacity style={[s.btnSecondary, { flex: 1 }]} onPress={() => setShowGoal(false)}>
            <Text style={s.btnSecondaryText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]} onPress={saveGoal} disabled={saving}>
            {saving ? <ActivityIndicator color={BG} /> : <Text style={s.btnPrimaryText}>บันทึก</Text>}
          </TouchableOpacity>
        </View>
      </OverlayModal>

      {/* ══ ABOUT ══ */}
      <OverlayModal visible={showAbout} onClose={() => setShowAbout(false)} title="📚 เกี่ยวกับ UPF">
        <ScrollView style={{ maxHeight: 300 }}>
          <Text style={{ color: TEXT, fontSize: 14, lineHeight: 22 }}>
            <Text style={{ color: GREEN, fontWeight: '800' }}>UPF (Ultra-Processed Food)</Text>
            {' '}คือ อาหารแปรรูปขั้นสูง ผ่านกระบวนการอุตสาหกรรมหลายขั้นตอน มีสารเติมแต่งสูง{'\n\n'}
            {'• '}กลุ่ม 1: ไม่แปรรูป (ผัก ผลไม้){'\n'}
            {'• '}กลุ่ม 2: ส่วนผสมปรุงอาหาร (น้ำมัน เกลือ){'\n'}
            {'• '}กลุ่ม 3: แปรรูปทั่วไป (ผักกระป๋อง){'\n'}
            {'• '}กลุ่ม 4: แปรรูปขั้นสูง UPF (บะหมี่สำเร็จรูป)
          </Text>
        </ScrollView>
        <TouchableOpacity style={[s.btnSecondary, { marginTop: 16 }]} onPress={() => setShowAbout(false)}>
          <Text style={s.btnSecondaryText}>ปิด</Text>
        </TouchableOpacity>
      </OverlayModal>

      {/* ══ CONTACT ══ */}
      <OverlayModal visible={showContact} onClose={() => setShowContact(false)} title="💬 ติดต่อเรา">
        <Text style={{ color: MUTED, fontSize: 14, marginBottom: 8, textAlign: 'center' }}>
          ส่งความคิดเห็นหรือรายงานปัญหามาที่:
        </Text>
        <View style={{ backgroundColor: SURFACE2, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: BORDER }}>
          <Text style={{ color: GREEN, fontSize: 15, fontWeight: '700', textAlign: 'center' }}>
            6731503001@lamduan.mfu.ac.th
          </Text>
        </View>
        <TouchableOpacity style={[s.btnSecondary, { marginTop: 16 }]} onPress={() => setShowContact(false)}>
          <Text style={s.btnSecondaryText}>ปิด</Text>
        </TouchableOpacity>
      </OverlayModal>

      {/* ══ RATING ══ */}
      <OverlayModal visible={showRating} onClose={() => setShowRating(false)} title="⭐ ให้คะแนนแอป">
        <Text style={{ color: MUTED, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>เลือกจำนวนดาว:</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16, gap: 8 }}>
          {[1,2,3,4,5].map(star => (
            <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
              <Text style={{ fontSize: 36, opacity: star <= newRating ? 1 : 0.22, color: YELLOW }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
          value={newReview} onChangeText={t => setNewReview(t.slice(0, 500))}
          placeholder="เขียนรีวิว... (สูงสุด 500 ตัวอักษร)"
          placeholderTextColor={MUTED} multiline />
        <Text style={{ color: MUTED, fontSize: 11, textAlign: 'right', marginTop: 4 }}>{newReview.length}/500</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <TouchableOpacity style={[s.btnSecondary, { flex: 1 }]} onPress={() => setShowRating(false)}>
            <Text style={s.btnSecondaryText}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]} onPress={saveRating} disabled={saving || newRating === 0}>
            {saving ? <ActivityIndicator color={BG} /> : <Text style={s.btnPrimaryText}>บันทึก</Text>}
          </TouchableOpacity>
        </View>
      </OverlayModal>

      {/* ══ SCANNED ══ */}
      <Modal visible={showScanned} transparent animationType="slide" onRequestClose={() => setShowScanned(false)}>
        <Pressable style={ov.bg} onPress={() => setShowScanned(false)}>
          <Pressable style={[ov.box, { maxHeight: '80%' }]} onPress={e => e.stopPropagation()}>
            <Text style={ov.title}>📷 สินค้าที่สแกนแล้ว</Text>
            {scannedPhotos.length === 0
              ? <Text style={{ color: MUTED, fontSize: 14, textAlign: 'center', paddingVertical: 24 }}>ยังไม่ได้สแกนสินค้าใดๆ</Text>
              : <FlatList data={scannedPhotos} keyExtractor={(_, i) => String(i)} style={{ maxHeight: 400 }}
                  renderItem={({ item }) => (
                    <View style={s.listItem}>
                      {item.url
                        ? <Image source={{ uri: item.url }} style={s.listThumb} />
                        : <View style={[s.listThumb, { backgroundColor: SURFACE2, justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 24 }}>🍱</Text>
                          </View>}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ color: TEXT, fontWeight: '700', fontSize: 14 }}>{item.name || 'ไม่มีชื่อ'}</Text>
                      </View>
                    </View>
                  )} />}
            <TouchableOpacity style={[s.btnSecondary, { marginTop: 12 }]} onPress={() => setShowScanned(false)}>
              <Text style={s.btnSecondaryText}>ปิด</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ══ FAVORITES ══ */}
      <Modal visible={showFavs} transparent animationType="slide" onRequestClose={() => setShowFavs(false)}>
        <Pressable style={ov.bg} onPress={() => setShowFavs(false)}>
          <Pressable style={[ov.box, { maxHeight: '80%' }]} onPress={e => e.stopPropagation()}>
            <Text style={ov.title}>❤️ รายการโปรด ({user.favorites?.length ?? 0})</Text>
            {favsLoading
              ? <ActivityIndicator color={GREEN} style={{ marginVertical: 24 }} />
              : favProducts.length === 0
                ? <Text style={{ color: MUTED, fontSize: 14, textAlign: 'center', paddingVertical: 24 }}>ยังไม่มีรายการโปรด</Text>
                : <FlatList data={favProducts} keyExtractor={(item: any) => item.id} style={{ maxHeight: 400 }}
                    renderItem={({ item }: any) => {
                      const img = (item.รูปภาพ || [])[0] || '';
                      return (
                        <View style={s.listItem}>
                          {img
                            ? <Image source={{ uri: img }} style={s.listThumb} />
                            : <View style={[s.listThumb, { backgroundColor: SURFACE2, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ fontSize: 24 }}>🍱</Text>
                              </View>}
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ color: TEXT, fontWeight: '700', fontSize: 14 }}>{item.ชื่อ || item.id}</Text>
                            <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>{item.ประเภท || ''}</Text>
                            {item.แคลอรี่ ? <Text style={{ color: GREEN, fontSize: 12 }}>{item.แคลอรี่}</Text> : null}
                          </View>
                        </View>
                      );
                    }} />}
            <TouchableOpacity style={[s.btnSecondary, { marginTop: 12 }]} onPress={() => setShowFavs(false)}>
              <Text style={s.btnSecondaryText}>ปิด</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
};

// ── MenuItem ──────────────────────────────────────────────────
const MenuItem = ({ icon, bg, title, sub, onPress }:
  { icon: string; bg: string; title: string; sub: string; onPress: () => void }) => (
  <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.8}>
    <View style={s.menuItemLeft}>
      <View style={[s.menuIconBox, { backgroundColor: bg }]}>
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

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: BG },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN_DIM, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  backIcon:         { fontSize: 28, color: GREEN, fontWeight: '300' },
  headerTitle:      { fontSize: 16, fontWeight: '700', color: TEXT },
  profileSection:   { alignItems: 'center', paddingVertical: 32, backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER, marginBottom: 16, overflow: 'hidden' },
  profileGlow:      { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: GREEN, opacity: 0.05, top: -60 },
  avatarBox:        { width: 90, height: 90, borderRadius: 45, backgroundColor: GREEN_DIM, justifyContent: 'center', alignItems: 'center', marginBottom: 4, borderWidth: 2, borderColor: GREEN, overflow: 'hidden' },
  avatarImg:        { width: 90, height: 90, borderRadius: 45 },
  avatarEmoji:      { fontSize: 44 },
  editBadge:        { alignSelf: 'flex-end', marginBottom: 10, backgroundColor: GREEN, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: BG, marginTop: -16, marginRight: -4 },
  avatarLarge:      { width: 140, height: 140, borderRadius: 70, backgroundColor: SURFACE2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: GREEN },
  avatarLargeImg:   { width: 140, height: 140, borderRadius: 70 },
  userName:         { fontSize: 22, fontWeight: '800', color: TEXT, marginBottom: 4 },
  userEmail:        { fontSize: 13, color: MUTED, marginBottom: 12 },
  memberBadge:      { backgroundColor: GREEN_DIM, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  memberText:       { fontSize: 12, color: GREEN, fontWeight: '600' },
  healthCard:       { backgroundColor: SURFACE, marginHorizontal: 16, marginBottom: 16, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: BORDER },
  healthTitle:      { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 16, textAlign: 'center' },
  healthScoreBox:   { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 12 },
  healthScoreNum:   { fontSize: 52, fontWeight: '800' },
  healthScoreMax:   { fontSize: 22, fontWeight: '600', color: MUTED, marginLeft: 4 },
  scoreBarTrack:    { height: 6, backgroundColor: SURFACE2, borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  scoreBarFill:     { height: '100%', borderRadius: 3 },
  healthLevelBadge: { alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1 },
  healthLevelText:  { fontSize: 13, fontWeight: '700' },
  healthDesc:       { fontSize: 12, color: MUTED, textAlign: 'center', lineHeight: 18 },
  historyHint:      { marginTop: 10, backgroundColor: GREEN_DIM, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: BORDER },
  historyHintText:  { fontSize: 12, color: GREEN, textAlign: 'center', fontWeight: '600' },
  eatSummary:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: SURFACE2, borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: BORDER },
  eatSummaryLabel:  { fontSize: 13, color: MUTED, fontWeight: '600' },
  eatSummaryScore:  { fontSize: 20, fontWeight: '800' },
  eatItem:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(46,204,113,0.08)' },
  eatItemLeft:      { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  eatDot:           { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  eatName:          { fontSize: 14, fontWeight: '600', color: TEXT },
  eatMeta:          { fontSize: 11, color: MUTED, marginTop: 2 },
  eatItemRight:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 8 },
  eatScore:         { fontSize: 15, fontWeight: '800', minWidth: 36, textAlign: 'right' },
  eatDeleteBtn:     { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: RED_DIM },
  eatDeleteIcon:    { fontSize: 16 },
  statsSection:     { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  statCard:         { flex: 1, backgroundColor: SURFACE, borderRadius: 14, paddingVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  statIcon:         { fontSize: 28, marginBottom: 8 },
  statValue:        { fontSize: 24, fontWeight: '800', color: GREEN, marginBottom: 4 },
  statLabel:        { fontSize: 12, color: MUTED, textAlign: 'center' },
  section:          { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle:     { fontSize: 14, fontWeight: '700', color: MUTED, marginBottom: 10, letterSpacing: 0.5 },
  menuItem:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: SURFACE, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: BORDER },
  menuItemLeft:     { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconBox:      { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuIcon:         { fontSize: 18 },
  menuTextBox:      { marginLeft: 12, flex: 1 },
  menuItemTitle:    { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 2 },
  menuItemSubtitle: { fontSize: 11, color: MUTED },
  menuArrow:        { fontSize: 22, color: BORDER, fontWeight: '300' },
  logoutButton:     { marginHorizontal: 16, marginVertical: 16, paddingVertical: 14, backgroundColor: RED_DIM, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  logoutButtonText: { fontSize: 15, fontWeight: '700', color: RED },
  versionText:      { fontSize: 11, color: MUTED, textAlign: 'center', marginBottom: 8 },
  btnPrimary:       { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText:   { color: BG, fontWeight: '700', fontSize: 14 },
  btnSecondary:     { backgroundColor: SURFACE2, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BORDER },
  btnSecondaryText: { color: MUTED, fontWeight: '600', fontSize: 14 },
  input:            { backgroundColor: SURFACE2, borderWidth: 1, borderColor: BORDER, borderRadius: 10, padding: 12, fontSize: 14, color: TEXT, marginTop: 4 },
  listItem:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(46,204,113,0.08)' },
  listThumb:        { width: 52, height: 52, borderRadius: 10, flexShrink: 0 },
});

export default ProfileScreen;