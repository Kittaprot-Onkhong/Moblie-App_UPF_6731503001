// features/product_detail/screen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Image, ActivityIndicator,
  Modal, TextInput, Alert, Share, Platform,
} from 'react-native';
import { db } from '../../core/services/firebase';
import {
  doc, getDoc, updateDoc, arrayUnion, serverTimestamp, increment,arrayRemove
} from 'firebase/firestore';

let useUserStore: any = (sel: any) => sel({ user: null });
try { useUserStore = require('../../core/store/userStore').useUserStore; } catch {}

// ─── Colors ──────────────────────────────────────────────────
const BG = '#0a0f0d', SURFACE = '#111a14', SURFACE2 = '#162019';
const GREEN = '#2ecc71', GREEN_MID = '#1a9e52', GREEN_DIM = 'rgba(46,204,113,0.12)';
const RED = '#ff6b6b', RED_DIM = 'rgba(255,107,107,0.12)';
const YELLOW = '#feca57', MUTED = '#7a9982', TEXT = '#e8f5ec';
const BORDER = 'rgba(46,204,113,0.18)';

const upfColor = (level: string) => ({
  'ต่ำ': GREEN, 'ปานกลาง': YELLOW, 'สูง': '#f39c12', 'สูงมาก': RED,
}[level] ?? MUTED);

const upfBg = (level: string) => ({
  'ต่ำ': 'rgba(46,204,113,0.1)', 'ปานกลาง': 'rgba(254,202,87,0.1)',
  'สูง': 'rgba(243,156,18,0.1)', 'สูงมาก': 'rgba(255,107,107,0.1)',
}[level] ?? SURFACE2);

const upfDesc = (level: string) => ({
  'ต่ำ': 'อาหารแปรรูปน้อยหรือไม่แปรรูป ปลอดภัยและมีประโยชน์ต่อสุขภาพ',
  'ปานกลาง': 'อาหารแปรรูประดับกลาง บริโภคได้แต่ควรควบคุมปริมาณ',
  'สูง': 'อาหารแปรรูปสูง มีสารเติมแต่งหลายชนิด ควรบริโภคแต่น้อย',
  'สูงมาก': 'อาหารแปรรูปสูงมาก เสี่ยงต่อสุขภาพ ควรหลีกเลี่ยง',
}[level] ?? 'ไม่มีข้อมูล');

// ─── Report Modal ─────────────────────────────────────────────
const ReportModal = ({ visible, onClose, productId, productName, uid }: {
  visible: boolean; onClose: () => void;
  productId: string; productName: string; uid: string;
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [existingReport, setExistingReport] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  
  
  useEffect(() => {
    if (!visible || !uid) return;
    // ดึง report ที่มีอยู่ของ user นี้
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) {
        const reports = snap.data().reports || {};
        if (reports[productId]) setExistingReport(reports[productId]);
      }
    });
  }, [visible, uid, productId]);

  const handleSend = async () => {
    if (!message.trim()) { Alert.alert('กรุณากรอกข้อความ'); return; }
    setSending(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        [`reports.${productId}`]: {
          message: message.trim(),
          images: [],
          productName,
          createdAt: new Date().toISOString(),
          replies: existingReport?.replies || [],
        },
      });
      Alert.alert('✅ ส่งรายงานเรียบร้อย', 'ผู้ดูแลระบบจะตรวจสอบและตอบกลับโดยเร็ว');
      setMessage('');
      onClose();
    } catch (e: any) {
      Alert.alert('เกิดข้อผิดพลาด', e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ms.bg}>
        <View style={ms.sheet}>
          <View style={ms.handle} />
          <Text style={ms.title}>⚠️ รายงานข้อมูลผิดพลาด</Text>
          <Text style={ms.subtitle}>{productName}</Text>

          {/* ถ้ามีรายงานเดิม แสดงให้เห็น */}
          {existingReport && (
            <View style={ms.existingBox}>
              <Text style={ms.existingLabel}>รายงานของคุณ:</Text>
              <Text style={ms.existingMsg}>{existingReport.message}</Text>

              {/* replies จาก admin */}
              <Text style={ms.replyLabel}>การตอบกลับจากผู้ดูแล:</Text>
              {(existingReport.replies || []).length > 0 ? (
                existingReport.replies.map((r: any, i: number) => (
                  <View key={i} style={ms.replyItem}>
                    <Text style={ms.replyAdmin}>👨‍💼 Admin</Text>
                    <Text style={ms.replyMsg}>{r.message}</Text>
                    <Text style={ms.replyDate}>{r.date || ''}</Text>
                  </View>
                ))
              ) : (
                <Text style={ms.pendingText}>⏳ รอดำเนินการ</Text>
              )}
            </View>
          )}

          <Text style={ms.label}>ข้อความรายงาน</Text>
          <TextInput
            style={ms.input}
            placeholder="อธิบายปัญหาที่พบ..."
            placeholderTextColor={MUTED}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />

          <View style={ms.footer}>
            <TouchableOpacity style={ms.cancelBtn} onPress={onClose}>
              <Text style={ms.cancelText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ms.sendBtn, (!message.trim() || sending) && ms.btnDisabled]}
              onPress={handleSend} disabled={!message.trim() || sending}
            >
              {sending ? <ActivityIndicator color={BG} size="small" /> : <Text style={ms.sendText}>📤 ส่งรายงาน</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ms = StyleSheet.create({
  bg:           { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: SURFACE, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: BORDER },
  handle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: BORDER, alignSelf: 'center', marginBottom: 16 },
  title:        { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 4 },
  subtitle:     { fontSize: 13, color: MUTED, marginBottom: 20 },
  existingBox:  { backgroundColor: SURFACE2, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  existingLabel:{ fontSize: 11, color: MUTED, marginBottom: 4, fontWeight: '600' },
  existingMsg:  { fontSize: 13, color: TEXT, lineHeight: 20, marginBottom: 12 },
  replyLabel:   { fontSize: 11, color: GREEN, fontWeight: '600', marginBottom: 8 },
  replyItem:    { backgroundColor: GREEN_DIM, borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: BORDER },
  replyAdmin:   { fontSize: 11, color: GREEN, fontWeight: '600', marginBottom: 2 },
  replyMsg:     { fontSize: 13, color: TEXT, lineHeight: 18 },
  replyDate:    { fontSize: 10, color: MUTED, marginTop: 4 },
  pendingText:  { fontSize: 12, color: YELLOW, fontStyle: 'italic' },
  label:        { fontSize: 12, color: MUTED, fontWeight: '600', marginBottom: 8 },
  input:        { backgroundColor: SURFACE2, borderRadius: 12, borderWidth: 1, borderColor: BORDER, color: TEXT, padding: 14, fontSize: 14, textAlignVertical: 'top', minHeight: 100, marginBottom: 20 },
  footer:       { flexDirection: 'row', gap: 10 },
  cancelBtn:    { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  cancelText:   { color: MUTED, fontWeight: '600' },
  sendBtn:      { flex: 2, height: 48, borderRadius: 12, backgroundColor: RED, justifyContent: 'center', alignItems: 'center' },
  btnDisabled:  { opacity: 0.4 },
  sendText:     { color: '#fff', fontWeight: '700', fontSize: 15 },
});

// ─── ProductDetailScreen ──────────────────────────────────────
const ProductDetailScreen = ({ navigation, route }: any) => {
  const productId = route?.params?.productId;
  const user = useUserStore((s: any) => s.user);
  const setUser = useUserStore((s: any) => s.setUser);

  const [product, setProduct]         = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [isFavorite, setIsFavorite]   = useState(false);
  const [showReport, setShowReport]   = useState(false);
  const [eatLoading, setEatLoading]   = useState(false);
  const [ateToday, setAteToday]       = useState(false);

  useEffect(() => {
    if (!productId) { setLoading(false); return; }
    getDoc(doc(db, 'สินค้า', productId)).then(snap => {
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
  }, [productId]);

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.emptyContainer}>
          <Text style={s.emptyIcon}>📦</Text>
          <Text style={s.emptyText}>ไม่พบข้อมูลสินค้า</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.goBack()}>
            <Text style={s.emptyBtnText}>กลับหน้าหลัก</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const c    = upfColor(product.ระดับUPF);
  const bg   = upfBg(product.ระดับUPF);
  const desc = upfDesc(product.ระดับUPF);
  const imgs: string[] = product.รูปภาพ || [];

  // parse ส่วนผสม / โภชนาการ / ข้อควรระวัง (string หรือ array)
  const parseLines = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return String(val).split('\n').filter(Boolean);
  };

  const ingredients = parseLines(product.ส่วนผสมหลัก);
  const nutritions  = parseLines(product.ข้อมูลโภชนาการ);
  const warnings    = parseLines(product.ข้อควรระวัง);

  // ── Share ────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      const msg = `🥗 ${product.ชื่อ}\n` +
        `ประเภท: ${product.ประเภท || '-'}\n` +
        `ระดับ UPF: ${product.ระดับUPF}\n` +
        `แคลอรี่: ${product.แคลอรี่ || '-'}\n` +
        `${desc}\n\n` +
        `ข้อควรระวัง: ${warnings.join(', ') || '-'}\n\n` +
        `📱 ดาวน์โหลดแอพ UPF เพื่อตรวจสอบอาหารของคุณ`;
      await Share.share({ message: msg, title: product.ชื่อ });
    } catch (e: any) {
      Alert.alert('เกิดข้อผิดพลาด', e.message);
    }
  };

  // ── Eat button ───────────────────────────────────────────
  const handleEat = async () => {
    if (!user?.uid || user.uid === 'guest') {
      Alert.alert('กรุณาเข้าสู่ระบบ', 'ต้องเข้าสู่ระบบก่อนบันทึกการกิน');
      return;
    }
    setEatLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const score = product.score ?? 0;

      // คะแนน UPF สูง = ลดคะแนนสุขภาพ, ต่ำ = เพิ่ม
      const scoreChange = product.ระดับUPF === 'ต่ำ' ? 2
        : product.ระดับUPF === 'ปานกลาง' ? 0
        : product.ระดับUPF === 'สูง' ? -3 : -5;

      await updateDoc(doc(db, 'users', user.uid), {
        // บันทึกประวัติการกิน
        [`eatHistory.${today}`]: arrayUnion({
          productId: product.id,
          productName: product.ชื่อ,
          calories: product.แคลอรี่ || '-',
          upfLevel: product.ระดับUPF,
          eatenAt: new Date().toISOString(),
        }),
        // อัปเดต healthScore (min 0, max 100)
        healthScore: increment(scoreChange),
      });

      setAteToday(true);
      Alert.alert(
        '🍽️ บันทึกการกินแล้ว!',
        `${product.ชื่อ}\n` +
        `คะแนนสุขภาพ ${scoreChange >= 0 ? '+' : ''}${scoreChange}`,
      );
    } catch (e: any) {
      Alert.alert('เกิดข้อผิดพลาด', e.message);
    } finally {
      setEatLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>รายละเอียดสินค้า</Text>
        <TouchableOpacity style={s.favBtn} onPress={() => setIsFavorite(!isFavorite)}>
          <Text style={s.favIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Image */}
        <View style={s.imageSection}>
          <View style={s.imageBox}>
            {imgs[0]
              ? <Image source={{ uri: imgs[0] }} style={s.productImage} resizeMode="cover" />
              : <Text style={s.productEmoji}>📦</Text>
            }
          </View>
          <View style={[s.upfBadgeLarge, { backgroundColor: c + '22', borderColor: c + '55' }]}>
            <Text style={s.upfBadgeTitle}>ระดับ UPF</Text>
            <Text style={[s.upfBadgeLevel, { color: c }]}>{product.ระดับUPF || '-'}</Text>
          </View>
        </View>

        <View style={s.content}>

          {/* Name */}
          <View style={s.nameSection}>
            <Text style={s.productName}>{product.ชื่อ || 'ไม่มีข้อมูล ต้องขออภัย'}</Text>
            <View style={s.categoryBadge}>
              <Text style={s.categoryText}>🏷️ {product.ประเภท || '-'}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statLabel}>แคลอรี่</Text>
              <Text style={[s.calNum, { color: c }]}>{product.แคลอรี่ || 'ไม่มีข้อมูล'}</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statLabel}>ปริมาณ</Text>
              <Text style={[s.calNum, { color: MUTED }]}>{product.ปริมาณ || 'ไม่มีข้อมูล ต้องขออภัย'}</Text>
            </View>
          </View>

          {/* UPF Info */}
          <View style={[s.upfInfoCard, { backgroundColor: bg, borderLeftColor: c }]}>
            <View style={s.upfInfoHeader}>
              <Text style={s.upfInfoIcon}>ℹ️</Text>
              <Text style={s.upfInfoTitle}>เกี่ยวกับระดับ UPF {product.ระดับUPF}</Text>
            </View>
            <Text style={s.upfInfoDesc}>{desc}</Text>
          </View>

          {/* Ingredients */}
          <View style={s.card}>
            <Text style={s.cardTitle}>🧪 ส่วนผสมหลัก</Text>
            {ingredients.length > 0
              ? ingredients.map((ing, i) => (
                  <View style={s.ingredientItem} key={i}>
                    <Text style={[s.ingredientBullet, { color: GREEN }]}>•</Text>
                    <Text style={s.ingredientText}>{ing}</Text>
                  </View>
                ))
              : <Text style={s.noData}>ไม่มีข้อมูล ต้องขออภัย</Text>
            }
          </View>

          {/* Nutrition */}
          <View style={s.card}>
            <Text style={s.cardTitle}>📊 ข้อมูลโภชนาการ (ต่อหนึ่งหน่วย)</Text>
            {nutritions.length > 0
              ? nutritions.map((row, i) => (
                  <View style={s.nutritionRow} key={i}>
                    <Text style={s.nutritionLabel}>{row}</Text>
                  </View>
                ))
              : <Text style={s.noData}>ไม่มีข้อมูล ต้องขออภัย</Text>
            }
          </View>

          {/* Warnings */}
          <View style={s.warningCard}>
            <Text style={s.warningIcon}>⚠️</Text>
            <View style={s.warningContent}>
              <Text style={s.warningTitle}>ข้อควรระวัง</Text>
              {warnings.length > 0
                ? warnings.map((w, i) => <Text key={i} style={s.warningText}>• {w}</Text>)
                : <Text style={s.noData}>ไม่มีข้อมูล ต้องขออภัย</Text>
              }
            </View>
          </View>

          {/* 🍽️ Eat Button */}
          <TouchableOpacity
            style={[s.eatBtn, ateToday && s.eatBtnDone]}
            onPress={handleEat}
            disabled={eatLoading}
            activeOpacity={0.85}
          >
            {eatLoading
              ? <ActivityIndicator color={BG} />
              : <Text style={s.eatBtnText}>{ateToday ? '✅ บันทึกแล้ว' : '🍽️ กิน'}</Text>
            }
          </TouchableOpacity>

          
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Report Modal */}
      <ReportModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        productId={product.id}
        productName={product.ชื่อ}
        uid={user?.uid || ''}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN_DIM, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  backIcon: { fontSize: 28, color: GREEN, fontWeight: '300' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  favBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: SURFACE2, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  favIcon: { fontSize: 20 },
  imageSection: { backgroundColor: SURFACE, paddingVertical: 28, alignItems: 'center', position: 'relative', borderBottomWidth: 1, borderBottomColor: BORDER },
  imageBox: { width: 200, height: 200, borderRadius: 20, backgroundColor: SURFACE2, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  productImage: { width: 200, height: 200 },
  productEmoji: { fontSize: 90 },
  upfBadgeLarge: { position: 'absolute', top: 20, right: 20, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  upfBadgeTitle: { fontSize: 10, color: MUTED, fontWeight: '600', marginBottom: 2 },
  upfBadgeLevel: { fontSize: 16, fontWeight: '800' },
  content: { paddingHorizontal: 16 },
  nameSection: { marginTop: 20, marginBottom: 16 },
  productName: { fontSize: 24, fontWeight: '800', color: TEXT, marginBottom: 10 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: GREEN_DIM, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  categoryText: { fontSize: 13, color: GREEN, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: SURFACE, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  statLabel: { fontSize: 12, color: MUTED, marginBottom: 6 },
  calNum: { fontSize: 16, fontWeight: '700' },
  upfInfoCard: { borderRadius: 14, padding: 16, marginBottom: 16, borderLeftWidth: 3 },
  upfInfoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  upfInfoIcon: { fontSize: 18 },
  upfInfoTitle: { fontSize: 15, fontWeight: '700', color: TEXT },
  upfInfoDesc: { fontSize: 13, color: MUTED, lineHeight: 20 },
  card: { backgroundColor: SURFACE, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  cardTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 12 },
  ingredientItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  ingredientBullet: { fontSize: 16, marginRight: 8 },
  ingredientText: { fontSize: 14, color: MUTED, flex: 1 },
  nutritionRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
  nutritionLabel: { fontSize: 13, color: MUTED },
  warningCard: { flexDirection: 'row', backgroundColor: 'rgba(254,202,87,0.08)', borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: YELLOW, borderWidth: 1, borderColor: 'rgba(254,202,87,0.2)' },
  warningIcon: { fontSize: 24, marginRight: 12 },
  warningContent: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 6 },
  warningText: { fontSize: 12, color: MUTED, lineHeight: 20 },
  noData: { fontSize: 13, color: MUTED, fontStyle: 'italic' },
  // Eat button
  eatBtn: { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12, shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  eatBtnDone: { backgroundColor: GREEN_MID },
  eatBtnText: { fontSize: 16, fontWeight: '700', color: BG },
  // Actions
  actionSection: { gap: 10, marginBottom: 16 },
  shareBtn: { backgroundColor: SURFACE, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: BORDER, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: TEXT },
  reportBtn: { backgroundColor: RED_DIM, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  reportBtnText: { fontSize: 14, fontWeight: '600', color: RED },
  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 80, marginBottom: 16 },
  emptyText: { fontSize: 18, color: MUTED, marginBottom: 24, textAlign: 'center' },
  emptyBtn: { backgroundColor: GREEN, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: BG },
});

export default ProductDetailScreen;