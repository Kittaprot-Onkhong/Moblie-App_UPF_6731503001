import React, { useState } from 'react';
import { Image } from 'react-native';
import { Images } from '../../assets/images';
import {
  getUPFColor,
  getUPFBgColor,
  getUPFDescription,
} from './utils';



import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// ─── Colors ─────────────────────────────────────────────────
const GREEN = '#3BAD45';
const GREEN_LIGHT = '#E8F7E9';
const GREEN_DARK = '#2E9438';
const ORANGE = '#F5821F';
const ORANGE_LIGHT = '#FFF3E8';
const RED = '#E74C3C';
const YELLOW = '#F39C12';
const TEXT_DARK = '#1A1A1A';
const TEXT_MID = '#666';
const TEXT_LIGHT = '#999';
const WHITE = '#fff';
const BG_GRAY = '#F8F9FA';

type NutritionRow = { label: string; value: string; high?: boolean };

type Specs = {
  brand: string;
  size: string;
  origin: string;
  shelfLife: string;
};

type Product = {
  name: string;
  category: string;
  score: number;
  calories: string;
  upfLevel: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'สูงมาก';
  image: string;
  ingredients?: string[];
  nutrition?: NutritionRow[];
  warnings?: string[];
  specs?: Specs;
};

type Props = {
  navigation: any;
  route: {
    params?: {
      product?: Product;
    };
  };
};

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

  // ฟังก์ชันกำหนดสีตาม UPF Level
  

  

  // คำอธิบาย UPF
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายละเอียดสินค้า</Text>
        <TouchableOpacity 
          style={styles.favBtn}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Text style={styles.favIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── รูปสินค้า + UPF Badge ── */}
        <View style={styles.imageSection}>
          <View style={styles.imageBox}>
            {Images[product.image] ? (
              <Image
                source={Images[product.image]}
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.productEmoji}>📦</Text>
            )}
          </View>
          <View style={[styles.upfBadgeLarge, { backgroundColor: getUPFColor(product.upfLevel) }]}>
            <Text style={styles.upfBadgeTitle}>ระดับ UPF</Text>
            <Text style={styles.upfBadgeLevel}>{product.upfLevel}</Text>
          </View>
        </View>

        {/* ── ข้อมูลสินค้า ── */}
        <View style={styles.content}>
          
          {/* ชื่อสินค้า */}
          <View style={styles.nameSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>🏷️ {product.category}</Text>
            </View>
          </View>

          {/* คะแนน + แคลอรี่ */}
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
              <Text style={styles.calNum}>{product.calories}</Text>
            </View>
          </View>

          {/* คำอธิบาย UPF Level */}
          <View style={[styles.upfInfoCard, { backgroundColor: getUPFBgColor(product.upfLevel) }]}>
            <View style={styles.upfInfoHeader}>
              <Text style={styles.upfInfoIcon}>ℹ️</Text>
              <Text style={styles.upfInfoTitle}>เกี่ยวกับระดับ UPF {product.upfLevel}</Text>
            </View>
            <Text style={styles.upfInfoDesc}>{getUPFDescription(product.upfLevel)}</Text>
          </View>

          {/* ส่วนผสม */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧪 ส่วนผสมหลัก</Text>
            {product.ingredients && product.ingredients.length > 0 ? (
              <View style={styles.ingredientList}>
                {product.ingredients.map((ing, idx) => (
                  <View style={styles.ingredientItem} key={idx}>
                    <Text style={styles.ingredientBullet}>•</Text>
                    <Text style={styles.ingredientText}>{ing}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.ingredientText}>ไม่มีข้อมูลส่วนผสม</Text>
            )}
          </View>

          {/* ข้อมูลโภชนาการ */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 ข้อมูลโภชนาการ (ต่อหนึ่งหน่วย)</Text>
            {product.nutrition && product.nutrition.length > 0 ? (
              <View style={styles.nutritionList}>
                {product.nutrition.map((row, idx) => (
                  <View style={styles.nutritionRow} key={idx}>
                    <Text style={styles.nutritionLabel}>{row.label}</Text>
                    <Text
                      style={[
                        styles.nutritionValue,
                        row.high && styles.nutritionHigh,
                      ]}
                    >
                      {row.value}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.ingredientText}>ไม่มีข้อมูลโภชนาการ</Text>
            )}
          </View>

          {/* คำเตือน */}
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>ข้อควรระวัง</Text>
              <Text style={styles.warningText}>
                • มีโซเดียมสูง ผู้ป่วยโรคความดันควรหลีกเลี่ยง{'\n'}
                • มี MSG อาจทำให้แพ้ในบางคน{'\n'}
                • ไม่เหมาะสำหรับเด็กเล็กและผู้สูงอายุ
              </Text>
            </View>
          </View>

          {/* ข้อมูลผลิตภัณฑ์ */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📦 ข้อมูลผลิตภัณฑ์</Text>
            {product.specs ? (
              <View style={styles.specList}>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>ยี่ห้อ</Text>
                  <Text style={styles.specValue}>{product.specs.brand}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>ขนาดบรรจุ</Text>
                  <Text style={styles.specValue}>{product.specs.size}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>ผลิตที่</Text>
                  <Text style={styles.specValue}>{product.specs.origin}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>อายุการเก็บ</Text>
                  <Text style={styles.specValue}>{product.specs.shelfLife}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.ingredientText}>ไม่มีข้อมูลผลิตภัณฑ์</Text>
            )}
          </View>

          {/* ปุ่มดำเนินการ */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>🔗 แชร์ข้อมูลนี้</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportBtn}>
              <Text style={styles.reportBtnText}>⚠️ รายงานข้อมูลผิดพลาด</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* เผื่อล่าง */}
        <View style={{ height: 30 }} />
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
  favBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
  },
  favIcon: { fontSize: 20 },

  // ── image section ──
  imageSection: {
    backgroundColor: WHITE,
    paddingVertical: 24,
    alignItems: 'center',
    position: 'relative',
  },
  imageBox: {
    width: 200, height: 200, borderRadius: 20,
    backgroundColor: BG_GRAY, justifyContent: 'center', alignItems: 'center',
  },
  productImage: { width: 180, height: 180 },
  productEmoji: { fontSize: 100 },
  upfBadgeLarge: {
    position: 'absolute',
    top: 20, right: 20,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  upfBadgeTitle: { fontSize: 10, color: WHITE, fontWeight: '600', marginBottom: 2 },
  upfBadgeLevel: { fontSize: 16, color: WHITE, fontWeight: '800' },

  // ── content ──
  content: { paddingHorizontal: 16 },

  // ชื่อ
  nameSection: { marginTop: 16, marginBottom: 16 },
  productName: { fontSize: 26, fontWeight: '800', color: TEXT_DARK, marginBottom: 8 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: ORANGE_LIGHT,
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20,
  },
  categoryText: { fontSize: 13, color: ORANGE, fontWeight: '600' },

  // สถิติ
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statLabel: { fontSize: 12, color: TEXT_MID, marginBottom: 6 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreNum: { fontSize: 24, fontWeight: '800', color: TEXT_DARK },
  scoreStar: { fontSize: 18 },
  calNum: { fontSize: 20, fontWeight: '700', color: ORANGE },

  // UPF info
  upfInfoCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: ORANGE,
  },
  upfInfoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  upfInfoIcon: { fontSize: 18 },
  upfInfoTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  upfInfoDesc: { fontSize: 13, color: TEXT_MID, lineHeight: 20 },

  // card
  card: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginBottom: 12 },

  // ingredients
  ingredientList: { gap: 8 },
  ingredientItem: { flexDirection: 'row', alignItems: 'flex-start' },
  ingredientBullet: { fontSize: 16, color: ORANGE, marginRight: 8, marginTop: -2 },
  ingredientText: { fontSize: 14, color: TEXT_MID, flex: 1 },

  // nutrition
  nutritionList: { gap: 10 },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  nutritionLabel: { fontSize: 13, color: TEXT_MID },
  nutritionValue: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  nutritionHigh: { color: RED },

  // warning
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: YELLOW,
  },
  warningIcon: { fontSize: 24, marginRight: 12 },
  warningContent: { flex: 1 },
  warningTitle: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, marginBottom: 6 },
  warningText: { fontSize: 12, color: TEXT_MID, lineHeight: 18 },

  // specs
  specList: { gap: 8 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  specLabel: { fontSize: 13, color: TEXT_MID },
  specValue: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },

  // actions
  actionSection: { gap: 10, marginBottom: 16 },
  shareBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: WHITE },
  reportBtn: {
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  reportBtnText: { fontSize: 14, fontWeight: '600', color: TEXT_MID },

  // empty state
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 80, marginBottom: 16 },
  emptyText: { fontSize: 18, color: TEXT_MID, marginBottom: 24, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: GREEN,
    paddingVertical: 12, paddingHorizontal: 32,
    borderRadius: 12,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: WHITE },
});

const mockProduct: Product = {
  name: 'Lay’s Original',
  category: 'ขนมขบเคี้ยว',
  score: 2.5,
  calories: '160 kcal',
  upfLevel: 'สูง',
  image: 'lays1', // ชื่อ key ของรูป
  ingredients: ['มันฝรั่ง', 'น้ำมัน', 'เกลือ'],
  nutrition: [
    { label: 'พลังงาน', value: '160 กิโลแคลอรี' },
  ],
  warnings: ['ข้อมูลจำลอง'],
  specs: { brand: "Lay's", size: '48 กรัม', origin: 'ไทย', shelfLife: '6 เดือน' },
};

export default ProductDetailScreen;