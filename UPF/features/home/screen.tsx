import React, { useState, useEffect, useRef } from 'react';
import { Images } from '../../assets/images';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

// ─── Mock Data ────────────────────────────
interface NutritionRow { label: string; value: string; high?: boolean; }
interface Specs { brand: string; size: string; origin: string; shelfLife: string; }

const FOOD_PRODUCTS: Array<{
  id: string;
  name: string;
  image: string;
  upfLevel: string;
  score: number;
  category: string;
  calories: string;
  ingredients?: string[];
  nutrition?: NutritionRow[];
  warnings?: string[];
  specs?: Specs;
}> = [
  {
    id: '1',
    name: 'เลย์รสดั้งเดิม',
    image: 'lays1',
    upfLevel: 'สูง',
    score: 4.2,
    category: 'ขนม',
    calories: '160 แคล/ชิ้น',
    ingredients: [
      'มันฝรั่ง 60%',
      'น้ำมันปาล์ม',
      'เกลือ',
      'สารปรุงแต่ง (MSG)',
    ],
    nutrition: [
      { label: 'พลังงาน', value: '160 กิโลแคลอรี' },
      { label: 'ไขมัน', value: '10 กรัม' },
      { label: 'คาร์โบไฮเดรต', value: '15 กรัม' },
      { label: 'โปรตีน', value: '2 กรัม' },
      { label: 'โซเดียม', value: '220 มก.', high: true },
    ],
    warnings: [
      'มีโซเดียมสูง ผู้ป่วยโรคความดันควรหลีกเลี่ยง',
      'มี MSG อาจทำให้แพ้ในบางคน',
      'ไม่เหมาะสำหรับเด็กเล็กและผู้สูงอายุ',
    ],
    specs: {
      brand: "Lay's",
      size: '48 กรัม',
      origin: 'ประเทศไทย',
      shelfLife: '6 เดือน',
    },
  },
  {
    id: '2',
    name: 'มาม่าต้มยำกุ้ง',
    image: 'lays2',
    upfLevel: 'สูงมาก',
    score: 4.6,
    category: 'บะหมี่สำเร็จรูป',
    calories: '380 แคล/ซอง',
    ingredients: [
      'เส้นก๋วยเตี๋ยว',
      'ผงปรุงรสต้มยำกุ้ง',
      'น้ำมันปาล์ม',
      'พริกไทย',
    ],
    nutrition: [
      { label: 'พลังงาน', value: '380 กิโลแคลอรี' },
      { label: 'ไขมัน', value: '14 กรัม' },
      { label: 'คาร์โบไฮเดรต', value: '50 กรัม' },
      { label: 'โปรตีน', value: '7 กรัม' },
      { label: 'โซเดียม', value: '1350 มก.', high: true },
    ],
    warnings: [
      'ปริมาณโซเดียมสูง',
      'ไม่ควรบริโภคเป็นประจำ',
    ],
    specs: {
      brand: 'มาม่า',
      size: '60 กรัม',
      origin: 'ประเทศไทย',
      shelfLife: '12 เดือน',
    },
  },
  {
    id: '3',
    name: 'น้ำผลไม้ 100%',
    image: 'lays3',
    upfLevel: 'ปานกลาง',
    score: 2.8,
    category: 'เครื่องดื่ม',
    calories: '120 แคล/กล่อง',
    ingredients: ['น้ำผลไม้ 100%', 'น้ำตาล', 'วิตามิน C'],
    nutrition: [
      { label: 'พลังงาน', value: '120 กิโลแคลอรี' },
      { label: 'น้ำตาล', value: '25 กรัม', high: true },
      { label: 'วิตามิน C', value: '30 มก.' },
    ],
    warnings: ['มีน้ำตาลสูง', 'ผู้ป่วยเบาหวานควรระวัง'],
    specs: {
      brand: 'Tipco',
      size: '1 ล.',
      origin: 'ประเทศไทย',
      shelfLife: '9 เดือน',
    },
  },
  {
    id: '5',
    name: 'มันฝรั่งทอด',
    image: 'lays5',
    upfLevel: 'สูง',
    score: 4.1,
    category: 'ขนม',
    calories: '220 แคล/ชิ้น',
    ingredients: ['มันฝรั่ง', 'น้ำมันพืช', 'เกลือ'],
    nutrition: [
      { label: 'พลังงาน', value: '220 กิโลแคลอรี' },
      { label: 'ไขมัน', value: '15 กรัม' },
      { label: 'โซเดียม', value: '300 มก.', high: true },
    ],
    warnings: ['มีไขมันและโซเดียมสูง'],
    specs: {
      brand: 'Crispy',
      size: '50 กรัม',
      origin: 'สหรัฐอเมริกา',
      shelfLife: '8 เดือน',
    },
  },
  {
    id: '4',
    name: 'นมกล่อง UHT',
    image: 'lays4',
    upfLevel: 'ต่ำ',
    score: 1.5,
    category: 'เครื่องดื่ม',
    calories: '150 แคล/กล่อง',
    ingredients: ['นมโค', 'วิตามิน D'],
    nutrition: [
      { label: 'พลังงาน', value: '150 กิโลแคลอรี' },
      { label: 'ไขมัน', value: '8 กรัม' },
      { label: 'โปรตีน', value: '8 กรัม' },
    ],
    warnings: ['ผู้ป่วยแพ้นมวัวควรหลีกเลี่ยง'],
    specs: {
      brand: 'DairyPure',
      size: '200 มล.',
      origin: 'นิวซีแลนด์',
      shelfLife: '12 เดือน',
    },
  },
  {
    id: '6',
    name: 'ขนมปังโฮลวีท',
    image: 'lays6',
    upfLevel: 'ต่ำ',
    score: 1.8,
    category: 'ขนมปัง',
    calories: '80 แคล/แผ่น',
    ingredients: ['แป้งโฮลวีท', 'ยีสต์', 'น้ำ', 'เกลือ'],
    nutrition: [
      { label: 'พลังงาน', value: '80 กิโลแคลอรี' },
      { label: 'ใยอาหาร', value: '3 กรัม' },
    ],
    warnings: ['มีเกลือพอประมาณ'],
    specs: {
      brand: 'WholeGrain',
      size: '30 กรัมต่อแผ่น',
      origin: 'เยอรมัน',
      shelfLife: '5 วันหลังเปิด',
    },
  },
];

// ─── Colors ─────────────────────────────────
const GREEN = '#3BAD45';
const GREEN_LIGHT = '#E8F7E9';
const GREEN_MID = '#2E9438';
const ORANGE = '#F5821F';
const ORANGE_LIGHT = '#FFF3E8';
const ORANGE_MID = '#E67317';
const RED = '#E74C3C';
const YELLOW = '#F39C12';
const TEXT_DARK = '#1A1A1A';
const TEXT_MID = '#666';
const WHITE = '#fff';

const getUPFColor = (level: string) => {
  switch (level) {
    case 'ต่ำ': return GREEN;
    case 'ปานกลาง': return YELLOW;
    case 'สูง': return ORANGE;
    case 'สูงมาก': return RED;
    default: return TEXT_MID;
  }
};

// ─── Component: Featured Card ────────────────
const FeaturedCard = ({ item, index, onPress }: any) => {
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{
      flex: 1,
      opacity: cardAnim,
      transform: [{
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      }],
    }}>
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.featuredImageBox}>
          {Images[item.image] ? (
            <Image
              source={Images[item.image]}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.upfBadge, { backgroundColor: getUPFColor(item.upfLevel) }]}>
          <Text style={styles.upfBadgeText}>UPF {item.upfLevel}</Text>
        </View>
        <Text style={styles.featuredCal} numberOfLines={1}>{item.calories}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Component: Product Card ────────────────
const ProductCard = ({ item, index, onPress }: any) => {
  const itemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: itemAnim,
      transform: [{
        translateX: itemAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 0],
        }),
      }],
    }}>
      <TouchableOpacity
        style={styles.productCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.productImageBox}>
          {Images[item.image] ? (
            <Image
              source={Images[item.image]}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCat}>{item.category}</Text>
          <Text style={styles.productCal}>{item.calories}</Text>
          <View style={[styles.productBadge, { backgroundColor: getUPFColor(item.upfLevel) }]}>
            <Text style={styles.productBadgeText}>UPF {item.upfLevel}</Text>
          </View>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreNum}>{item.score}</Text>
          <Text style={styles.scoreStar}>⭐</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Component ────────────────────────────
const HomeScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [isLoading, setIsLoading] = useState(false);
  const categories = ['ทั้งหมด', 'ขนม', 'เครื่องดื่ม', 'บะหมี่สำเร็จรูป', 'ขนมปัง'];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scanPulse = useRef(new Animated.Value(1)).current;
  const headerScale = useRef(new Animated.Value(0.95)).current;
  const loadingRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        tension: 15,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(loadingRotate, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const loadingRotateInterpolate = loadingRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const filteredProducts =
    selectedCategory === 'ทั้งหมด'
      ? FOOD_PRODUCTS
      : FOOD_PRODUCTS.filter((p) => p.category === selectedCategory);

  const handleOpenScanner = () => {
    Animated.sequence([
      Animated.timing(scanPulse, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scanPulse, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate('Scanner');
  };

  const handleProductPress = (item: any) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('ProductDetail', { product: item });
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <Animated.View style={{ transform: [{ rotate: loadingRotateInterpolate }] }}>
              <View style={styles.loadingSpinner}>
                <View style={styles.spinnerSegmentGreen} />
                <View style={styles.spinnerSegmentOrange} />
              </View>
            </Animated.View>
            <Text style={styles.loadingText}>กำลังโหลด...</Text>
          </View>
        </View>
      )}

      {/* Decorative blobs */}
      <View style={styles.blobGreen} pointerEvents="none" />
      <View style={styles.blobOrange} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View style={[styles.header, {
          opacity: fadeAnim,
          transform: [{ scale: headerScale }],
        }]}>
          <View>
            <Text style={styles.greeting}>สวัสดี! 👋</Text>
            <Text style={styles.subGreeting}>ตรวจสอบอาหารของคุณวันนี้</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Scan Button */}
        <Animated.View style={[styles.scanSection, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          <Animated.View style={{ transform: [{ scale: scanPulse }] }}>
            <TouchableOpacity style={styles.scanBtn} onPress={handleOpenScanner} activeOpacity={0.9}>
              <View style={styles.scanIconBox}>
                <Text style={styles.scanIcon}>📷</Text>
              </View>
              <View style={styles.scanTextBox}>
                <Text style={styles.scanTitle}>สแกนฉลากอาหาร</Text>
                <Text style={styles.scanSub}>รู้ทันระดับ UPF ในทันที</Text>
              </View>
              <Text style={styles.scanArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardGreen]}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>สินค้าสแกนแล้ว</Text>
            </View>
            <View style={[styles.statCard, styles.statCardOrange]}>
              <Text style={styles.statNumOrange}>0</Text>
              <Text style={styles.statLabel}>ในรายการโปรด</Text>
            </View>
          </View>
        </Animated.View>

        {/* ✅ Featured Products — แสดง 4 การ์ดพอดีหน้าจอ ไม่ต้องเลื่อน */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 สินค้ายอดนิยม</Text>
          </View>
          <View style={styles.featuredRow}>
            {FOOD_PRODUCTS.slice(0, 4).map((item, index) => (
              <FeaturedCard
                key={item.id}
                item={item}
                index={index}
                onPress={() => handleProductPress(item)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>🏷️ หมวดหมู่</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catBtn,
                    selectedCategory === cat && styles.catBtnActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.catText,
                      selectedCategory === cat && styles.catTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
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
              <ProductCard
                key={product.id}
                item={product}
                index={index}
                onPress={() => handleProductPress(product)}
              />
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingBox: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingSpinner: {
    width: 60, height: 60,
    borderRadius: 30,
    marginBottom: 15,
  },
  spinnerSegmentGreen: {
    position: 'absolute',
    width: 60, height: 60,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: GREEN,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  spinnerSegmentOrange: {
    position: 'absolute',
    width: 60, height: 60,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: ORANGE,
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },

  blobGreen: {
    position: 'absolute',
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: GREEN_LIGHT,
    opacity: 0.6,
    top: -50, right: -50,
    zIndex: 0,
  },
  blobOrange: {
    position: 'absolute',
    width: 150, height: 150,
    borderRadius: 75,
    backgroundColor: ORANGE_LIGHT,
    opacity: 0.7,
    bottom: 200, left: -40,
    zIndex: 0,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: WHITE,
    borderBottomWidth: 3,
    borderBottomColor: GREEN_LIGHT,
    zIndex: 1,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: GREEN },
  subGreeting: { fontSize: 13, color: TEXT_MID, marginTop: 2 },
  profileBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: ORANGE_LIGHT,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: ORANGE,
  },
  profileIcon: { fontSize: 20 },

  scanSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, zIndex: 1 },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: GREEN_MID,
  },
  scanIconBox: {
    width: 56, height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  scanIcon: { fontSize: 28 },
  scanTextBox: { flex: 1, marginLeft: 16 },
  scanTitle: { fontSize: 18, fontWeight: '700', color: WHITE, marginBottom: 2 },
  scanSub: { fontSize: 13, color: 'rgba(255,255,255,0.95)' },
  scanArrow: { fontSize: 32, color: WHITE, fontWeight: '300' },

  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statCardGreen: { borderColor: GREEN, backgroundColor: GREEN_LIGHT },
  statCardOrange: { borderColor: ORANGE, backgroundColor: ORANGE_LIGHT },
  statNum: { fontSize: 22, fontWeight: '800', color: GREEN, marginBottom: 2 },
  statNumOrange: { fontSize: 22, fontWeight: '800', color: ORANGE, marginBottom: 2 },
  statLabel: { fontSize: 11, color: TEXT_MID, fontWeight: '600' },

  section: { paddingHorizontal: 20, marginTop: 20, zIndex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: TEXT_DARK, marginBottom: 12 },
  seeAll: { fontSize: 13, color: ORANGE, fontWeight: '700' },

  // ✅ แถว 4 การ์ดพอดีหน้าจอ
  featuredRow: {
    flexDirection: 'row',
    gap: 8,
  },

  featuredCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 8,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: GREEN_LIGHT,
  },
  featuredImageBox: {
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  featuredName: { fontSize: 10, fontWeight: '600', color: TEXT_DARK, marginBottom: 4 },
  featuredInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upfBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, marginBottom: 4, alignSelf: 'flex-start' },
  upfBadgeText: { fontSize: 9, fontWeight: '700', color: WHITE },
  featuredCal: { fontSize: 9, color: ORANGE, fontWeight: '700' },

  categoryRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  catBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  catBtnActive: { backgroundColor: ORANGE, borderColor: ORANGE_MID },
  catText: { fontSize: 13, fontWeight: '600', color: TEXT_MID },
  catTextActive: { color: WHITE, fontWeight: '700' },

  productList: { gap: 10 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 12,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: ORANGE_LIGHT,
  },
  productImageBox: {
    width: 80, height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GREEN_LIGHT,
  },
  productImage: { fontSize: 40 },
  productDetails: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  productName: { fontSize: 14, fontWeight: '600', color: TEXT_DARK, marginBottom: 3 },
  productCat: { fontSize: 11, color: TEXT_MID, marginBottom: 4 },
  productCal: { fontSize: 12, color: ORANGE, fontWeight: '700', marginBottom: 6 },
  productBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  productBadgeText: { fontSize: 10, fontWeight: '700', color: WHITE },
  scoreBox: { alignItems: 'center', justifyContent: 'center', paddingLeft: 8 },
  scoreNum: { fontSize: 18, fontWeight: '700', color: GREEN },
  scoreStar: { fontSize: 14 },
});

export default HomeScreen;