import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, SafeAreaView, StatusBar, Animated, Easing, Image,
  ActivityIndicator,
} from 'react-native';

let useLanguage: any = () => ({ language: 'th', setLanguage: () => {} });
let useUserStore: any = (sel: any) => sel({ user: null, isFavorite: () => false, favorites: [] });
try { useLanguage = require('../../core/i18n').useLanguage; } catch {}
try { useUserStore = require('../../core/store/userStore').useUserStore; } catch {}

const { width } = Dimensions.get('window');

// ─── Types ─────────────────────────────────────────────────────
interface NutritionRow { label: string; value: string; high?: boolean; }
interface Specs { brand: string; size: string; origin: string; shelfLife: string; }
interface FoodProduct {
  id: string; name: string;
  wikimediaTitle: string;   // ชื่อไฟล์จริงบน Wikimedia Commons
  fallbackEmoji: string;    // emoji สำรองถ้าโหลดรูปไม่ได้
  upfLevel: string; score: number; category: string; calories: string;
  ingredients?: string[]; nutrition?: NutritionRow[];
  warnings?: string[]; specs?: Specs;
}

// ─── Mock Data — ชื่อไฟล์ Wikimedia ที่ตรวจสอบแล้วว่ามีอยู่จริง ──
const FOOD_PRODUCTS: FoodProduct[] = [
  {
    id: '1', name: 'เลย์รสดั้งเดิม',
    // ✅ ไฟล์นี้มีอยู่จริงใน Wikimedia Commons
    wikimediaTitle: 'Pepsico_-_Lays_-_Spanish_Tomato_Tango_-_Potato_Chips_-_Howrah_2015-04-26_8488.JPG',
    fallbackEmoji: '🥔',
    upfLevel: 'สูง', score: 4.2, category: 'ขนม', calories: '160 แคล/ชิ้น',
    ingredients: ['มันฝรั่ง 60%', 'น้ำมันปาล์ม', 'เกลือ', 'สารปรุงแต่ง (MSG)'],
    nutrition: [
      { label: 'พลังงาน', value: '160 กิโลแคลอรี' },
      { label: 'ไขมัน', value: '10 กรัม' },
      { label: 'คาร์โบไฮเดรต', value: '15 กรัม' },
      { label: 'โปรตีน', value: '2 กรัม' },
      { label: 'โซเดียม', value: '220 มก.', high: true },
    ],
    warnings: ['มีโซเดียมสูง', 'มี MSG อาจทำให้แพ้ในบางคน'],
    specs: { brand: "Lay's", size: '48 กรัม', origin: 'ประเทศไทย', shelfLife: '6 เดือน' },
  },
  {
    id: '2', name: 'มาม่าต้มยำกุ้ง',
    // ✅ ไฟล์ instant ramen ที่มีอยู่จริง
    wikimediaTitle: 'Instant_ramen_with_gy%C5%8Dza.jpg',
    fallbackEmoji: '🍜',
    upfLevel: 'สูงมาก', score: 4.6, category: 'บะหมี่สำเร็จรูป', calories: '380 แคล/ซอง',
    ingredients: ['เส้นก๋วยเตี๋ยว', 'ผงปรุงรสต้มยำกุ้ง', 'น้ำมันปาล์ม', 'พริกไทย'],
    nutrition: [
      { label: 'พลังงาน', value: '380 กิโลแคลอรี' },
      { label: 'ไขมัน', value: '14 กรัม' },
      { label: 'คาร์โบไฮเดรต', value: '50 กรัม' },
      { label: 'โปรตีน', value: '7 กรัม' },
      { label: 'โซเดียม', value: '1350 มก.', high: true },
    ],
    warnings: ['ปริมาณโซเดียมสูง', 'ไม่ควรบริโภคเป็นประจำ'],
    specs: { brand: 'มาม่า', size: '60 กรัม', origin: 'ประเทศไทย', shelfLife: '12 เดือน' },
  },
  {
    id: '3', name: 'น้ำผลไม้ 100%',
    // ✅ ไฟล์นี้ขึ้นได้อยู่แล้ว
    wikimediaTitle: 'Orange_juice_1_edit1.jpg',
    fallbackEmoji: '🧃',
    upfLevel: 'ปานกลาง', score: 2.8, category: 'เครื่องดื่ม', calories: '120 แคล/กล่อง',
    ingredients: ['น้ำผลไม้ 100%', 'น้ำตาล', 'วิตามิน C'],
    nutrition: [
      { label: 'พลังงาน', value: '120 กิโลแคลอรี' },
      { label: 'น้ำตาล', value: '25 กรัม', high: true },
      { label: 'วิตามิน C', value: '30 มก.' },
    ],
    warnings: ['มีน้ำตาลสูง', 'ผู้ป่วยเบาหวานควรระวัง'],
    specs: { brand: 'Tipco', size: '1 ล.', origin: 'ประเทศไทย', shelfLife: '9 เดือน' },
  },
  {
    id: '4', name: 'นมกล่อง UHT',
    // ✅ ไฟล์นี้ขึ้นได้อยู่แล้ว
    wikimediaTitle: 'Milk_glass.jpg',
    fallbackEmoji: '🥛',
    upfLevel: 'ต่ำ', score: 1.5, category: 'เครื่องดื่ม', calories: '150 แคล/กล่อง',
    ingredients: ['นมโค', 'วิตามิน D'],
    nutrition: [
      { label: 'พลังงาน', value: '150 กิโลแคลอรี' },
      { label: 'ไขมัน', value: '8 กรัม' },
      { label: 'โปรตีน', value: '8 กรัม' },
    ],
    warnings: ['ผู้ป่วยแพ้นมวัวควรหลีกเลี่ยง'],
    specs: { brand: 'DairyPure', size: '200 มล.', origin: 'นิวซีแลนด์', shelfLife: '12 เดือน' },
  },
  {
    id: '5', name: 'มันฝรั่งทอด',
    // ✅ ไฟล์ French Fries ที่ตรวจสอบแล้ว
    wikimediaTitle: 'French_Fries.JPG',
    fallbackEmoji: '🍟',
    upfLevel: 'สูง', score: 4.1, category: 'ขนม', calories: '220 แคล/ชิ้น',
    ingredients: ['มันฝรั่ง', 'น้ำมันพืช', 'เกลือ'],
    nutrition: [
      { label: 'พลังงาน', value: '220 กิโลแคลอรี' },
      { label: 'ไขมัน', value: '15 กรัม' },
      { label: 'โซเดียม', value: '300 มก.', high: true },
    ],
    warnings: ['มีไขมันและโซเดียมสูง'],
    specs: { brand: 'Crispy', size: '50 กรัม', origin: 'สหรัฐอเมริกา', shelfLife: '8 เดือน' },
  },
  {
    id: '6', name: 'ขนมปังโฮลวีท',
    // ✅ ไฟล์ Wwbread.JPG — whole wheat bread ที่มีอยู่จริง
    wikimediaTitle: 'Wwbread.JPG',
    fallbackEmoji: '🍞',
    upfLevel: 'ต่ำ', score: 1.8, category: 'ขนมปัง', calories: '80 แคล/แผ่น',
    ingredients: ['แป้งโฮลวีท', 'ยีสต์', 'น้ำ', 'เกลือ'],
    nutrition: [
      { label: 'พลังงาน', value: '80 กิโลแคลอรี' },
      { label: 'ใยอาหาร', value: '3 กรัม' },
    ],
    warnings: ['มีเกลือพอประมาณ'],
    specs: { brand: 'WholeGrain', size: '30 กรัมต่อแผ่น', origin: 'เยอรมัน', shelfLife: '5 วันหลังเปิด' },
  },
];

// ─── Wikimedia Hook — ดึง thumbnail URL ─────────────────────────
// วิธีการ: เรียก Wikimedia Commons API → ขอ imageinfo → ได้ thumburl
// ถ้า title มี %xx อยู่แล้วจะ decode ก่อน แล้ว encode ใหม่ให้ถูกต้อง
const useWikimediaImage = (rawTitle: string, thumbWidth = 200) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rawTitle) { setLoading(false); return; }
    let cancelled = false;

    const fetchImage = async () => {
      try {
        // decode ก่อนเผื่อมี %xx แล้ว encode ใหม่ให้สม่ำเสมอ
        const decodedTitle = decodeURIComponent(rawTitle);
        const encodedTitle = encodeURIComponent(`File:${decodedTitle}`);
        const apiUrl =
          `https://commons.wikimedia.org/w/api.php` +
          `?action=query` +
          `&titles=${encodedTitle}` +
          `&prop=imageinfo` +
          `&iiprop=url` +
          `&iiurlwidth=${thumbWidth}` +
          `&format=json` +
          `&origin=*`;

        const res  = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();

        // Wikimedia คืน pages object; key คือ page id (ติดลบถ้าไม่เจอ)
        const pages    = data?.query?.pages ?? {};
        const page     = Object.values(pages)[0] as any;
        const thumbUrl = page?.imageinfo?.[0]?.thumburl ?? null;

        if (!cancelled) setUrl(thumbUrl);
      } catch (e) {
        if (!cancelled) {
          console.warn(`[Wikimedia] fetch failed for "${rawTitle}":`, e);
          setUrl(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchImage();
    return () => { cancelled = true; };
  }, [rawTitle, thumbWidth]);

  return { url, loading };
};

// ─── WikiImage Component ─────────────────────────────────────────
// skeleton → รูปจริง → emoji fallback
interface WikiImageProps {
  title: string;
  style?: any;
  thumbWidth?: number;
  fallbackEmoji?: string;
}

const WikiImage = ({ title, style, thumbWidth = 200, fallbackEmoji = '🍱' }: WikiImageProps) => {
  const { url, loading } = useWikimediaImage(title, thumbWidth);
  const [imgError, setImgError] = useState(false);

  if (loading) {
    return (
      <View style={[style, styles.skeleton]}>
        <ActivityIndicator size="small" color={GREEN} />
      </View>
    );
  }

  if (url && !imgError) {
    return (
      <Image
        source={{ uri: url }}
        style={style}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <View style={[style, styles.fallbackBox]}>
      <Text style={{ fontSize: (style?.height ?? 72) * 0.45 }}>{fallbackEmoji}</Text>
    </View>
  );
};

// ─── Colors ─────────────────────────────────────────────────────
const BG        = '#0a0f0d';
const SURFACE   = '#111a14';
const SURFACE2  = '#162019';
const GREEN     = '#2ecc71';
const GREEN_DIM = 'rgba(46,204,113,0.15)';
const GREEN_MID = '#1a9e52';
const RED       = '#ff6b6b';
const YELLOW    = '#feca57';
const MUTED     = '#7a9982';
const TEXT      = '#e8f5ec';
const BORDER    = 'rgba(46,204,113,0.18)';

const getUPFColor = (level: string) => {
  switch (level) {
    case 'ต่ำ':      return GREEN;
    case 'ปานกลาง': return YELLOW;
    case 'สูง':      return '#f39c12';
    case 'สูงมาก':  return RED;
    default:         return MUTED;
  }
};

// ─── Featured Card ───────────────────────────────────────────────
const FeaturedCard = ({ item, index, onPress }: { item: FoodProduct; index: number; onPress: () => void }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(cardAnim, { toValue: 1, duration: 400, delay: index * 120, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{
      flex: 1,
      opacity: cardAnim,
      transform: [{ translateY: cardAnim.interpolate({ inputRange: [0,1], outputRange: [24,0] }) }],
    }}>
      <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.85}>
        <WikiImage
          title={item.wikimediaTitle}
          style={styles.featuredImageBox}
          thumbWidth={160}
          fallbackEmoji={item.fallbackEmoji}
        />
        <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.upfBadge, {
          backgroundColor: getUPFColor(item.upfLevel) + '22',
          borderColor:     getUPFColor(item.upfLevel) + '66',
        }]}>
          <Text style={[styles.upfBadgeText, { color: getUPFColor(item.upfLevel) }]}>
            UPF {item.upfLevel}
          </Text>
        </View>
        <Text style={styles.featuredCal} numberOfLines={1}>{item.calories}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Product Card ────────────────────────────────────────────────
const ProductCard = ({ item, index, onPress }: { item: FoodProduct; index: number; onPress: () => void }) => {
  const itemAnim  = useRef(new Animated.Value(0)).current;
  const isFavorite = useUserStore((s: any) => s.isFavorite);
  const fav = typeof isFavorite === 'function' ? isFavorite(item.name) : false;

  useEffect(() => {
    Animated.timing(itemAnim, { toValue: 1, duration: 300, delay: index * 80, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: itemAnim,
      transform: [{ translateX: itemAnim.interpolate({ inputRange: [0,1], outputRange: [-24,0] }) }],
    }}>
      <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.85}>
        <WikiImage
          title={item.wikimediaTitle}
          style={styles.productImageBox}
          thumbWidth={120}
          fallbackEmoji={item.fallbackEmoji}
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCat}>{item.category}</Text>
          <Text style={styles.productCal}>{item.calories}</Text>
          <View style={[styles.productBadge, {
            backgroundColor: getUPFColor(item.upfLevel) + '22',
            borderColor:     getUPFColor(item.upfLevel) + '55',
          }]}>
            <Text style={[styles.productBadgeText, { color: getUPFColor(item.upfLevel) }]}>
              UPF {item.upfLevel}
            </Text>
          </View>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreNum}>{item.score}</Text>
          <Text style={styles.scoreStar}>⭐</Text>
          {fav && <Text style={styles.favBadge}>โปรด</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── HomeScreen ──────────────────────────────────────────────────
const HomeScreen = ({ navigation }: any) => {
  const { language, setLanguage } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [isLoading, setIsLoading] = useState(false);
  const categories = ['ทั้งหมด', 'ขนม', 'เครื่องดื่ม', 'บะหมี่สำเร็จรูป', 'ขนมปัง'];

  const fadeAnim      = useRef(new Animated.Value(0)).current;
  const slideAnim     = useRef(new Animated.Value(30)).current;
  const scanPulse     = useRef(new Animated.Value(1)).current;
  const headerScale   = useRef(new Animated.Value(0.95)).current;
  const loadingRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,    { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim,   { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, tension: 15, friction: 5, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.timing(loadingRotate, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const loadingRotateInterp = loadingRotate.interpolate({ inputRange: [0,1], outputRange: ['0deg','360deg'] });
  const filteredProducts = selectedCategory === 'ทั้งหมด'
    ? FOOD_PRODUCTS
    : FOOD_PRODUCTS.filter(p => p.category === selectedCategory);

  const handleOpenScanner = () => {
    Animated.sequence([
      Animated.timing(scanPulse, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scanPulse, { toValue: 1,    duration: 100, useNativeDriver: true }),
    ]).start();
    navigation.navigate('Scanner');
  };

  const handleProductPress = (item: FoodProduct) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('ProductDetail', { product: item });
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <Animated.View style={{ transform: [{ rotate: loadingRotateInterp }] }}>
              <View style={styles.loadingSpinner}>
                <View style={styles.spinnerA} />
                <View style={styles.spinnerB} />
              </View>
            </Animated.View>
            <Text style={styles.loadingText}>กำลังโหลด...</Text>
          </View>
        </View>
      )}

      <View style={styles.blobGreen}  pointerEvents="none" />
      <View style={styles.blobGreen2} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: headerScale }] }]}>
          <View>
            <Text style={styles.greeting}>สวัสดี! 👋</Text>
            <Text style={styles.subGreeting}>ตรวจสอบอาหารของคุณวันนี้</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}
              onPress={() => setLanguage(language === 'th' ? 'en' : 'th')} activeOpacity={0.8}>
              <Text style={{ fontSize: 18 }}>{language === 'th' ? '🇹🇭' : '🇬🇧'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}
              onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Scan Button */}
        <Animated.View style={[styles.scanSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Animated.View style={{ transform: [{ scale: scanPulse }] }}>
            <TouchableOpacity style={styles.scanBtn} onPress={handleOpenScanner} activeOpacity={0.9}>
              <View style={styles.scanIconBox}>
                <Text style={{ fontSize: 26 }}>📷</Text>
              </View>
              <View style={styles.scanTextBox}>
                <Text style={styles.scanTitle}>สแกนฉลากอาหาร</Text>
                <Text style={styles.scanSub}>รู้ทันระดับ UPF ในทันที</Text>
              </View>
              <Text style={styles.scanArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>สินค้าสแกนแล้ว</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>ในรายการโปรด</Text>
            </View>
          </View>
        </Animated.View>

        {/* Featured */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>🔥 สินค้ายอดนิยม</Text>
          <View style={styles.featuredRow}>
            {FOOD_PRODUCTS.slice(0, 4).map((item, index) => (
              <FeaturedCard key={item.id} item={item} index={index} onPress={() => handleProductPress(item)} />
            ))}
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>🏷️ หมวดหมู่</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]}
                  onPress={() => setSelectedCategory(cat)} activeOpacity={0.8}
                >
                  <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Product List */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>🛒 ผลิตภัณฑ์ ({filteredProducts.length})</Text>
          <View style={styles.productList}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} item={product} index={index} onPress={() => handleProductPress(product)} />
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  skeleton:    { backgroundColor: SURFACE2, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  fallbackBox: { backgroundColor: SURFACE2, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },

  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
  },
  loadingBox: { backgroundColor: SURFACE, borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  loadingSpinner: { width: 60, height: 60, borderRadius: 30, marginBottom: 15 },
  spinnerA: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 5, borderColor: GREEN, borderRightColor: 'transparent', borderBottomColor: 'transparent' },
  spinnerB: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 5, borderColor: GREEN_MID, borderLeftColor: 'transparent', borderTopColor: 'transparent' },
  loadingText: { fontSize: 15, fontWeight: '600', color: TEXT },

  blobGreen:  { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: GREEN, opacity: 0.06, top: -80, right: -80, zIndex: 0 },
  blobGreen2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: GREEN, opacity: 0.04, bottom: 200, left: -60, zIndex: 0 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER, zIndex: 1 },
  greeting: { fontSize: 22, fontWeight: '700', color: GREEN },
  subGreeting: { fontSize: 12, color: MUTED, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN_DIM, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },

  scanSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, zIndex: 1 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: GREEN, borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: GREEN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 16, elevation: 8 },
  scanIconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  scanTextBox: { flex: 1, marginLeft: 16 },
  scanTitle: { fontSize: 17, fontWeight: '700', color: '#0a0f0d', marginBottom: 2 },
  scanSub: { fontSize: 12, color: 'rgba(0,0,0,0.65)' },
  scanArrow: { fontSize: 30, color: '#0a0f0d', fontWeight: '300' },

  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: SURFACE, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  statNum: { fontSize: 22, fontWeight: '800', color: GREEN, marginBottom: 2 },
  statLabel: { fontSize: 11, color: MUTED, fontWeight: '500' },

  section: { paddingHorizontal: 20, marginTop: 24, zIndex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 14 },

  featuredRow: { flexDirection: 'row', gap: 8 },
  featuredCard: { flex: 1, backgroundColor: SURFACE, borderRadius: 14, padding: 8, borderWidth: 1, borderColor: BORDER },
  featuredImageBox: { height: 80, borderRadius: 10, marginBottom: 6, overflow: 'hidden' },
  featuredName: { fontSize: 10, fontWeight: '600', color: TEXT, marginBottom: 4 },
  upfBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginBottom: 4, alignSelf: 'flex-start', borderWidth: 1 },
  upfBadgeText: { fontSize: 9, fontWeight: '700' },
  featuredCal: { fontSize: 9, color: MUTED, fontWeight: '500' },

  categoryRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER },
  catBtnActive: { backgroundColor: GREEN, borderColor: GREEN_MID },
  catText: { fontSize: 13, fontWeight: '600', color: MUTED },
  catTextActive: { color: '#0a0f0d', fontWeight: '700' },

  productList: { gap: 10 },
  productCard: { flexDirection: 'row', backgroundColor: SURFACE, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: BORDER },
  productImageBox: { width: 76, height: 76, borderRadius: 10, overflow: 'hidden', flexShrink: 0 },
  productDetails: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  productName: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 3 },
  productCat: { fontSize: 11, color: MUTED, marginBottom: 4 },
  productCal: { fontSize: 12, color: GREEN, fontWeight: '600', marginBottom: 6 },
  productBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  productBadgeText: { fontSize: 10, fontWeight: '700' },
  scoreBox: { alignItems: 'center', justifyContent: 'center', paddingLeft: 8 },
  scoreNum: { fontSize: 18, fontWeight: '700', color: GREEN },
  scoreStar: { fontSize: 13 },
  favBadge: { fontSize: 10, fontWeight: '700', color: GREEN, backgroundColor: GREEN_DIM, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 4, borderWidth: 1, borderColor: BORDER },
});

export default HomeScreen;