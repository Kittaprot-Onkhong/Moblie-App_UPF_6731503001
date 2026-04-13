import React, { useState } from 'react';
import { Image } from 'react-native';
import { Images, type ImageKey } from '../../assets/images';
import { getUPFColor, getUPFBgColor, getUPFDescription } from './utils';
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
const YELLOW   = '#feca57';
const MUTED    = '#7a9982';
const TEXT     = '#e8f5ec';
const BORDER   = 'rgba(46,204,113,0.18)';
const WHITE    = '#fff';

// Override utils with dark-compatible colors
const getDarkUPFColor = (level: string) => {
  switch (level) {
    case 'ต่ำ':      return GREEN;
    case 'ปานกลาง': return YELLOW;
    case 'สูง':      return '#f39c12';
    case 'สูงมาก':  return RED;
    default:         return MUTED;
  }
};
const getDarkUPFBg = (level: string) => {
  switch (level) {
    case 'ต่ำ':      return 'rgba(46,204,113,0.1)';
    case 'ปานกลาง': return 'rgba(254,202,87,0.1)';
    case 'สูง':      return 'rgba(243,156,18,0.1)';
    case 'สูงมาก':  return 'rgba(255,107,107,0.1)';
    default:         return SURFACE2;
  }
};
const getDarkUPFDesc = (level: string) => {
  switch (level) {
    case 'ต่ำ':      return 'อาหารแปรรูปน้อยหรือไม่แปรรูป ปลอดภัยและมีประโยชน์ต่อสุขภาพ';
    case 'ปานกลาง': return 'อาหารแปรรูประดับกลาง บริโภคได้แต่ควรควบคุมปริมาณ';
    case 'สูง':      return 'อาหารแปรรูปสูง มีสารเติมแต่งหลายชนิด ควรบริโภคแต่น้อย';
    case 'สูงมาก':  return 'อาหารแปรรูปสูงมาก เสี่ยงต่อสุขภาพ ควรหลีกเลี่ยง';
    default:         return 'ไม่มีข้อมูล';
  }
};

type NutritionRow = { label: string; value: string; high?: boolean };
type Specs = { brand: string; size: string; origin: string; shelfLife: string };
type Product = {
  name: string; category: string; score: number; calories: string;
  upfLevel: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'สูงมาก';
  image: ImageKey;
  ingredients?: string[]; nutrition?: NutritionRow[];
  warnings?: string[]; specs?: Specs;
};
type Props = { navigation: any; route: { params?: { product?: Product } } };

const ProductDetailScreen = ({ navigation, route }: Props) => {
  const product: Product = route.params?.product ?? mockProduct;
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>ไม่พบข้อมูลสินค้า</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.emptyBtnText}>กลับหน้าหลัก</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const upfColor = getDarkUPFColor(product.upfLevel);
  const upfBg    = getDarkUPFBg(product.upfLevel);
  const upfDesc  = getDarkUPFDesc(product.upfLevel);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายละเอียดสินค้า</Text>
        <TouchableOpacity style={styles.favBtn} onPress={() => setIsFavorite(!isFavorite)}>
          <Text style={styles.favIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Image + Badge ── */}
        <View style={styles.imageSection}>
          <View style={styles.imageBox}>
            {Images[product.image]
              ? <Image source={Images[product.image]} style={styles.productImage} resizeMode="contain" />
              : <Text style={styles.productEmoji}>📦</Text>
            }
          </View>
          {/* Glow ring */}
          <View style={[styles.imageGlow, { shadowColor: upfColor }]} />
          <View style={[styles.upfBadgeLarge, { backgroundColor: upfColor + '22', borderColor: upfColor + '55' }]}>
            <Text style={styles.upfBadgeTitle}>ระดับ UPF</Text>
            <Text style={[styles.upfBadgeLevel, { color: upfColor }]}>{product.upfLevel}</Text>
          </View>
        </View>

        <View style={styles.content}>

          {/* Name */}
          <View style={styles.nameSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>🏷️ {product.category}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>คะแนน</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreNum}>{product.score}</Text>
                <Text style={styles.scoreStar}>⭐</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>แคลอรี่</Text>
              <Text style={[styles.calNum, { color: upfColor }]}>{product.calories}</Text>
            </View>
          </View>

          {/* UPF Info */}
          <View style={[styles.upfInfoCard, { backgroundColor: upfBg, borderLeftColor: upfColor }]}>
            <View style={styles.upfInfoHeader}>
              <Text style={styles.upfInfoIcon}>ℹ️</Text>
              <Text style={styles.upfInfoTitle}>เกี่ยวกับระดับ UPF {product.upfLevel}</Text>
            </View>
            <Text style={styles.upfInfoDesc}>{upfDesc}</Text>
          </View>

          {/* Ingredients */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧪 ส่วนผสมหลัก</Text>
            {product.ingredients && product.ingredients.length > 0 ? (
              <View style={styles.ingredientList}>
                {product.ingredients.map((ing, idx) => (
                  <View style={styles.ingredientItem} key={idx}>
                    <Text style={[styles.ingredientBullet, { color: GREEN }]}>•</Text>
                    <Text style={styles.ingredientText}>{ing}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.ingredientText}>ไม่มีข้อมูลส่วนผสม</Text>
            )}
          </View>

          {/* Nutrition */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 ข้อมูลโภชนาการ (ต่อหนึ่งหน่วย)</Text>
            {product.nutrition && product.nutrition.length > 0 ? (
              <View style={styles.nutritionList}>
                {product.nutrition.map((row, idx) => (
                  <View style={styles.nutritionRow} key={idx}>
                    <Text style={styles.nutritionLabel}>{row.label}</Text>
                    <Text style={[styles.nutritionValue, row.high && styles.nutritionHigh]}>{row.value}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.ingredientText}>ไม่มีข้อมูลโภชนาการ</Text>
            )}
          </View>

          {/* Warnings */}
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>ข้อควรระวัง</Text>
              {product.warnings && product.warnings.length > 0
                ? product.warnings.map((w, i) => (
                    <Text key={i} style={styles.warningText}>• {w}</Text>
                  ))
                : <Text style={styles.warningText}>• ไม่มีข้อมูลคำเตือน</Text>
              }
            </View>
          </View>

          {/* Specs */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📦 ข้อมูลผลิตภัณฑ์</Text>
            {product.specs ? (
              <View style={styles.specList}>
                {[
                  ['ยี่ห้อ', product.specs.brand],
                  ['ขนาดบรรจุ', product.specs.size],
                  ['ผลิตที่', product.specs.origin],
                  ['อายุการเก็บ', product.specs.shelfLife],
                ].map(([label, value], i) => (
                  <View style={styles.specRow} key={i}>
                    <Text style={styles.specLabel}>{label}</Text>
                    <Text style={styles.specValue}>{value}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.ingredientText}>ไม่มีข้อมูลผลิตภัณฑ์</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>🔗 แชร์ข้อมูลนี้</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportBtn}>
              <Text style={styles.reportBtnText}>⚠️ รายงานข้อมูลผิดพลาด</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  favBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: SURFACE2, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  favIcon: { fontSize: 20 },

  // Image
  imageSection: {
    backgroundColor: SURFACE, paddingVertical: 28,
    alignItems: 'center', position: 'relative',
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  imageBox: {
    width: 200, height: 200, borderRadius: 20,
    backgroundColor: SURFACE2, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  imageGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 20,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30,
  },
  productImage: { width: 180, height: 180 },
  productEmoji: { fontSize: 90 },
  upfBadgeLarge: {
    position: 'absolute', top: 20, right: 20,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 12, alignItems: 'center',
    borderWidth: 1,
  },
  upfBadgeTitle: { fontSize: 10, color: MUTED, fontWeight: '600', marginBottom: 2 },
  upfBadgeLevel: { fontSize: 16, fontWeight: '800' },

  // Content
  content: { paddingHorizontal: 16 },
  nameSection: { marginTop: 20, marginBottom: 16 },
  productName: { fontSize: 24, fontWeight: '800', color: TEXT, marginBottom: 10 },
  categoryBadge: {
    alignSelf: 'flex-start', backgroundColor: GREEN_DIM,
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER,
  },
  categoryText: { fontSize: 13, color: GREEN, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: SURFACE, borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: BORDER,
  },
  statLabel: { fontSize: 12, color: MUTED, marginBottom: 6 },
  scoreRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreNum:  { fontSize: 24, fontWeight: '800', color: TEXT },
  scoreStar: { fontSize: 18 },
  calNum:    { fontSize: 18, fontWeight: '700' },

  // UPF info
  upfInfoCard: {
    borderRadius: 14, padding: 16, marginBottom: 16, borderLeftWidth: 3,
  },
  upfInfoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  upfInfoIcon:   { fontSize: 18 },
  upfInfoTitle:  { fontSize: 15, fontWeight: '700', color: TEXT },
  upfInfoDesc:   { fontSize: 13, color: MUTED, lineHeight: 20 },

  // Card
  card: {
    backgroundColor: SURFACE, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: BORDER,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 12 },

  // Ingredients
  ingredientList: { gap: 8 },
  ingredientItem: { flexDirection: 'row', alignItems: 'flex-start' },
  ingredientBullet: { fontSize: 16, marginRight: 8, marginTop: -2 },
  ingredientText:   { fontSize: 14, color: MUTED, flex: 1 },

  // Nutrition
  nutritionList: { gap: 10 },
  nutritionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  nutritionLabel: { fontSize: 13, color: MUTED },
  nutritionValue: { fontSize: 13, fontWeight: '600', color: TEXT },
  nutritionHigh:  { color: RED },

  // Warning
  warningCard: {
    flexDirection: 'row', backgroundColor: 'rgba(254,202,87,0.08)',
    borderRadius: 14, padding: 16, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: YELLOW,
    borderWidth: 1, borderColor: 'rgba(254,202,87,0.2)',
  },
  warningIcon:    { fontSize: 24, marginRight: 12 },
  warningContent: { flex: 1 },
  warningTitle:   { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 6 },
  warningText:    { fontSize: 12, color: MUTED, lineHeight: 20 },

  // Specs
  specList: { gap: 8 },
  specRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  specLabel: { fontSize: 13, color: MUTED },
  specValue: { fontSize: 13, fontWeight: '600', color: TEXT },

  // Actions
  actionSection: { gap: 10, marginBottom: 16, marginTop: 4 },
  shareBtn: {
    backgroundColor: GREEN, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  shareBtnText:  { fontSize: 15, fontWeight: '700', color: BG },
  reportBtn: {
    backgroundColor: SURFACE, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  reportBtnText: { fontSize: 14, fontWeight: '600', color: MUTED },

  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon:      { fontSize: 80, marginBottom: 16 },
  emptyText:      { fontSize: 18, color: MUTED, marginBottom: 24, textAlign: 'center' },
  emptyBtn:       { backgroundColor: GREEN, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
  emptyBtnText:   { fontSize: 15, fontWeight: '700', color: BG },
});

const mockProduct: Product = {
  name: "Lay's Original", category: 'ขนมขบเคี้ยว', score: 2.5, calories: '160 kcal', upfLevel: 'สูง',
  image: 'lays1', ingredients: ['มันฝรั่ง', 'น้ำมัน', 'เกลือ'],
  nutrition: [{ label: 'พลังงาน', value: '160 กิโลแคลอรี' }],
  warnings: ['ข้อมูลจำลอง'],
  specs: { brand: "Lay's", size: '48 กรัม', origin: 'ไทย', shelfLife: '6 เดือน' },
};

export default ProductDetailScreen;