// features/home/screen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Animated, Easing,
  ActivityIndicator, Image, TextInput,
} from 'react-native';
import { db } from '../../core/services/firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';

let useUserStore: any = (sel: any) => sel({ user: null });
try { useUserStore = require('../../core/store/userStore').useUserStore; } catch {}

// ─── Types ────────────────────────────────────────────────────
interface FoodProduct {
  id: string;
  ชื่อ: string;
  ประเภท: string;
  แคลอรี่: string;
  ระดับUPF: string;
  ส่วนผสมหลัก: string;
  ข้อมูลโภชนาการ: string;
  ข้อควรระวัง: string;
  รูปภาพ?: string[];
  ปริมาณ?: string;
  score?: number;
}

// ─── Colors ──────────────────────────────────────────────────
const BG = '#0a0f0d', SURFACE = '#111a14', SURFACE2 = '#162019';
const GREEN = '#2ecc71', GREEN_DIM = 'rgba(46,204,113,0.15)', GREEN_MID = '#1a9e52';
const RED = '#ff6b6b', YELLOW = '#feca57', MUTED = '#7a9982', TEXT = '#e8f5ec';
const BORDER = 'rgba(46,204,113,0.18)';

const upfColor = (level: string) => ({
  'ต่ำ': GREEN, 'ปานกลาง': YELLOW, 'สูง': '#f39c12', 'สูงมาก': RED,
}[level] ?? MUTED);

// ─── Featured Card ────────────────────────────────────────────
const FeaturedCard = ({
  item, index, onPress, isFav,
}: { item: FoodProduct; index: number; onPress: () => void; isFav: boolean }) => {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 400, delay: index * 120, useNativeDriver: true }).start();
  }, []);
  const img = item.รูปภาพ?.[0];
  const c = upfColor(item.ระดับUPF);
  return (
    <Animated.View style={{ flex: 1, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }] }}>
      <TouchableOpacity style={st.featuredCard} onPress={onPress} activeOpacity={0.85}>
        {/* หัวใจมุมบนขวา */}
        {isFav && (
          <View style={st.featuredHeart}>
            <Text style={{ fontSize: 12 }}>❤️</Text>
          </View>
        )}
        <View style={st.featuredImageBox}>
          {img
            ? <Image source={{ uri: img }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            : <Text style={{ fontSize: 28 }}>🍱</Text>
          }
        </View>
        <Text style={st.featuredName} numberOfLines={1}>{item.ชื่อ}</Text>
        <View style={[st.upfBadge, { backgroundColor: c + '22', borderColor: c + '66' }]}>
          <Text style={[st.upfBadgeText, { color: c }]}>UPF {item.ระดับUPF}</Text>
        </View>
        <Text style={st.featuredCal} numberOfLines={1}>{item.แคลอรี่ || '-'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Product Card ─────────────────────────────────────────────
const ProductCard = ({
  item, index, onPress, isFav,
}: { item: FoodProduct; index: number; onPress: () => void; isFav: boolean }) => {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }).start();
  }, []);
  const img = item.รูปภาพ?.[0];
  const c = upfColor(item.ระดับUPF);
  const score = item.score ?? 0;

  return (
    <Animated.View style={{ opacity: a, transform: [{ translateX: a.interpolate({ inputRange: [0,1], outputRange: [-20,0] }) }] }}>
      <TouchableOpacity style={st.productCard} onPress={onPress} activeOpacity={0.85}>
        <View style={st.productImageBox}>
          {img
            ? <Image source={{ uri: img }} style={{ width: 76, height: 76, borderRadius: 10 }} resizeMode="cover" />
            : <Text style={{ fontSize: 32 }}>🍱</Text>
          }
        </View>
        <View style={st.productDetails}>
          <Text style={st.productName}>{item.ชื่อ}</Text>
          <Text style={st.productCat}>{item.ประเภท || '-'}</Text>
          <Text style={st.productCal}>{item.แคลอรี่ || '-'}</Text>
          <View style={[st.productBadge, { backgroundColor: c + '22', borderColor: c + '55' }]}>
            <Text style={[st.productBadgeText, { color: c }]}>UPF {item.ระดับUPF}</Text>
          </View>
        </View>

        {/* ── Score / Favorite indicator ── */}
        <View style={st.scoreBox}>
          {isFav ? (
            // ถ้า favorite → แสดง ❤️ แทนคะแนน
            <Text style={{ fontSize: 22 }}>❤️</Text>
          ) : (
            // ถ้าไม่ favorite → แสดงคะแนน
            <>
              <Text style={st.scoreNum}>{score.toFixed(1)}</Text>
              <Text style={st.scoreStar}>⭐</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── HomeScreen ───────────────────────────────────────────────
const HomeScreen = ({ navigation }: any) => {
  const user = useUserStore((s: any) => s.user);

  const [products, setProducts]         = useState<FoodProduct[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchText, setSearchText]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [isNavLoading, setIsNavLoading] = useState(false);
  // favorites ดึงจาก Firestore realtime
  const [favIds, setFavIds]             = useState<string[]>([]);

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(30)).current;
  const scanPulse   = useRef(new Animated.Value(1)).current;
  const headerScale = useRef(new Animated.Value(0.95)).current;
  const loadRot     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,    { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim,   { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }),
      Animated.spring(headerScale, { toValue: 1, tension: 15, friction: 5, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.timing(loadRot, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);

  // ── Firestore: สินค้า ─────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'สินค้า'), (snap) => {
      const data: FoodProduct[] = snap.docs.map(d => ({
        id: d.id,
        ชื่อ: d.data().ชื่อ || d.id,
        ประเภท: d.data().ประเภท || '',
        แคลอรี่: d.data().แคลอรี่ || '',
        ระดับUPF: d.data().ระดับUPF || '',
        ส่วนผสมหลัก: d.data().ส่วนผสมหลัก || '',
        ข้อมูลโภชนาการ: d.data().ข้อมูลโภชนาการ || '',
        ข้อควรระวัง: d.data().ข้อควรระวัง || '',
        รูปภาพ: d.data().รูปภาพ || [],
        ปริมาณ: d.data().ปริมาณ || '',
        score: d.data().score ?? 0,
      }));
      setProducts(data);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  // ── Firestore: favorites ของ user ─────────────────────────
  useEffect(() => {
    if (!user?.uid || user.uid === 'guest') return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const favs: string[] = snap.data().favorites || [];
        setFavIds(favs);
      }
    });
    return () => unsub();
  }, [user?.uid]);

  const loadRotInterp = loadRot.interpolate({ inputRange: [0,1], outputRange: ['0deg','360deg'] });
  const categories = ['ทั้งหมด', ...Array.from(new Set(products.map(p => p.ประเภท).filter(Boolean)))];

  const filtered = products.filter(p => {
    const matchSearch = !searchText.trim() ||
      p.ชื่อ.toLowerCase().includes(searchText.toLowerCase()) ||
      (p.ประเภท || '').toLowerCase().includes(searchText.toLowerCase());
    const matchCat = selectedCategory === 'ทั้งหมด' || p.ประเภท === selectedCategory;
    return matchSearch && matchCat;
  });

  const suggestions = searchText.trim().length > 0
    ? products.filter(p =>
        p.ชื่อ.toLowerCase().includes(searchText.toLowerCase()) ||
        (p.ประเภท || '').toLowerCase().includes(searchText.toLowerCase())
      ).slice(0, 5)
    : [];
  const showSuggestions = suggestions.length > 0;

  const handleScan = () => {
    Animated.sequence([
      Animated.timing(scanPulse, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scanPulse, { toValue: 1,    duration: 100, useNativeDriver: true }),
    ]).start();
    navigation.navigate('Scanner');
  };

  const handleProduct = (item: FoodProduct) => {
    setIsNavLoading(true);
    setTimeout(() => {
      setIsNavLoading(false);
      navigation.navigate('ProductDetail', { productId: item.id });
    }, 300);
  };

  return (
    <SafeAreaView style={st.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {isNavLoading && (
        <View style={st.loadOverlay}>
          <View style={st.loadBox}>
            <Animated.View style={{ transform: [{ rotate: loadRotInterp }] }}>
              <View style={st.loadSpinner}><View style={st.spinA} /><View style={st.spinB} /></View>
            </Animated.View>
            <Text style={st.loadText}>กำลังโหลด...</Text>
          </View>
        </View>
      )}

      <View style={st.blob1} pointerEvents="none" />
      <View style={st.blob2} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <Animated.View style={[st.header, { opacity: fadeAnim, transform: [{ scale: headerScale }] }]}>
          <View>
            <Text style={st.greeting}>สวัสดี! 👋</Text>
            <Text style={st.subGreeting}>ตรวจสอบอาหารของคุณวันนี้</Text>
          </View>
          <View style={st.headerRight}>
            <TouchableOpacity style={st.iconBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Search */}
        <Animated.View style={[{ paddingHorizontal: 20, paddingTop: 16, zIndex: 10 }, { opacity: fadeAnim }]}>
          <View style={st.searchWrap}>
            <Text style={st.searchIcon}>🔍</Text>
            <TextInput
              style={st.searchInput}
              placeholder="ค้นหาชื่อสินค้า..."
              placeholderTextColor={MUTED}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={{ padding: 4 }}>
                <Text style={{ color: MUTED, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {showSuggestions && (
            <View style={st.suggestionBox}>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={st.suggestionItem}
                  onPress={() => { setSearchText(item.ชื่อ); handleProduct(item); }}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {favIds.includes(item.id) && <Text style={{ fontSize: 12 }}>❤️</Text>}
                    <Text style={st.suggestionText}>{item.ชื่อ}</Text>
                  </View>
                  <Text style={st.suggestionCat}>{item.ประเภท}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>

        {loading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={GREEN} />
            <Text style={{ color: MUTED, marginTop: 12, fontSize: 13 }}>กำลังโหลดสินค้า...</Text>
          </View>
        ) : (
          <>
            {/* Featured */}
            {!searchText && selectedCategory === 'ทั้งหมด' && products.length > 0 && (
              <Animated.View style={[st.section, { opacity: fadeAnim }]}>
                <Text style={st.sectionTitle}>🔥 สินค้ายอดนิยม</Text>
                <View style={st.featuredRow}>
                  {products.slice(0, 4).map((item, i) => (
                    <FeaturedCard
                      key={item.id} item={item} index={i}
                      isFav={favIds.includes(item.id)}
                      onPress={() => handleProduct(item)}
                    />
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Categories */}
            <Animated.View style={[st.section, { opacity: fadeAnim }]}>
              <Text style={st.sectionTitle}>🏷️ หมวดหมู่</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={st.catRow}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[st.catBtn, selectedCategory === cat && st.catBtnActive]}
                      onPress={() => setSelectedCategory(cat)} activeOpacity={0.8}
                    >
                      <Text style={[st.catText, selectedCategory === cat && st.catTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Animated.View>

            {/* Products */}
            <Animated.View style={[st.section, { opacity: fadeAnim }]}>
              <Text style={st.sectionTitle}>
                🛒 ผลิตภัณฑ์ ({filtered.length}){searchText ? ` · "${searchText}"` : ''}
              </Text>
              {filtered.length === 0 ? (
                <View style={st.emptyBox}>
                  <Text style={{ fontSize: 40 }}>🔍</Text>
                  <Text style={st.emptyText}>ไม่พบสินค้าที่ค้นหา</Text>
                </View>
              ) : (
                <View style={st.productList}>
                  {filtered.map((product, i) => (
                    <ProductCard
                      key={product.id} item={product} index={i}
                      isFav={favIds.includes(product.id)}
                      onPress={() => handleProduct(product)}
                    />
                  ))}
                </View>
              )}
            </Animated.View>
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  container:   { flex: 1, backgroundColor: BG },
  loadOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  loadBox:     { backgroundColor: SURFACE, borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  loadSpinner: { width: 60, height: 60, borderRadius: 30, marginBottom: 15 },
  spinA: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 5, borderColor: GREEN, borderRightColor: 'transparent', borderBottomColor: 'transparent' },
  spinB: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 5, borderColor: GREEN_MID, borderLeftColor: 'transparent', borderTopColor: 'transparent' },
  loadText:    { fontSize: 15, fontWeight: '600', color: TEXT },
  blob1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: GREEN, opacity: 0.05, top: -80, right: -80, zIndex: 0 },
  blob2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: GREEN, opacity: 0.03, bottom: 200, left: -60, zIndex: 0 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER },
  greeting:    { fontSize: 22, fontWeight: '700', color: GREEN },
  subGreeting: { fontSize: 12, color: MUTED, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN_DIM, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  searchWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: SURFACE, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, height: 48 },
  searchIcon:     { fontSize: 16, marginRight: 8 },
  searchInput:    { flex: 1, fontSize: 14, color: TEXT },
  suggestionBox:  { backgroundColor: SURFACE, borderRadius: 12, borderWidth: 1, borderColor: BORDER, marginTop: 4, overflow: 'hidden' },
  suggestionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(46,204,113,0.08)' },
  suggestionText: { fontSize: 14, color: TEXT, fontWeight: '500' },
  suggestionCat:  { fontSize: 11, color: MUTED },
  scanSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  scanBtn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: GREEN, borderRadius: 16, padding: 18, shadowColor: GREEN, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  scanIconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  scanTextBox: { flex: 1, marginLeft: 16 },
  scanTitle:   { fontSize: 17, fontWeight: '700', color: BG, marginBottom: 2 },
  scanSub:     { fontSize: 12, color: 'rgba(0,0,0,0.65)' },
  scanArrow:   { fontSize: 30, color: BG },
  section:      { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 14 },
  featuredRow:  { flexDirection: 'row', gap: 8 },
  featuredCard: { flex: 1, backgroundColor: SURFACE, borderRadius: 14, padding: 8, borderWidth: 1, borderColor: BORDER, position: 'relative' },
  featuredHeart:{ position: 'absolute', top: 6, right: 6, zIndex: 2 },
  featuredImageBox: { height: 80, borderRadius: 10, marginBottom: 6, overflow: 'hidden', backgroundColor: SURFACE2, justifyContent: 'center', alignItems: 'center' },
  featuredName: { fontSize: 10, fontWeight: '600', color: TEXT, marginBottom: 4 },
  upfBadge:     { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginBottom: 4, alignSelf: 'flex-start', borderWidth: 1 },
  upfBadgeText: { fontSize: 9, fontWeight: '700' },
  featuredCal:  { fontSize: 9, color: MUTED },
  catRow:       { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  catBtn:       { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER },
  catBtnActive: { backgroundColor: GREEN, borderColor: GREEN_MID },
  catText:      { fontSize: 13, fontWeight: '600', color: MUTED },
  catTextActive:{ color: BG, fontWeight: '700' },
  productList:  { gap: 10 },
  productCard:  { flexDirection: 'row', backgroundColor: SURFACE, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  productImageBox: { width: 76, height: 76, borderRadius: 10, backgroundColor: SURFACE2, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  productDetails:  { flex: 1, marginLeft: 12, justifyContent: 'center' },
  productName:  { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 3 },
  productCat:   { fontSize: 11, color: MUTED, marginBottom: 4 },
  productCal:   { fontSize: 12, color: GREEN, fontWeight: '600', marginBottom: 6 },
  productBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  productBadgeText: { fontSize: 10, fontWeight: '700' },
  // Score box
  scoreBox:   { alignItems: 'center', justifyContent: 'center', paddingLeft: 12, minWidth: 44 },
  scoreNum:   { fontSize: 18, fontWeight: '700', color: GREEN },
  scoreStar:  { fontSize: 12, marginTop: 2 },
  emptyBox:    { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText:   { fontSize: 16, color: TEXT, fontWeight: '600' },
});

export default HomeScreen;