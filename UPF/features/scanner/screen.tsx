import React, { useState, useRef, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  StyleSheet, Alert, Modal, Image,
} from 'react-native';
import { useUserStore } from '../../core/store/userStore';

// ─── Dark Theme Colors ───────────────────────────────────────
const BG      = '#0a0f0d';
const SURFACE = '#111a14';
const SURFACE2= '#162019';
const GREEN   = '#2ecc71';
const GREEN_DIM = 'rgba(46,204,113,0.15)';
const MUTED   = '#7a9982';
const TEXT    = '#e8f5ec';
const BORDER  = 'rgba(46,204,113,0.25)';

const ScannerScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<React.ElementRef<typeof CameraView>>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showPreview, setShowPreview]     = useState(false);
  const { incrementScans } = useUserStore();

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) requestPermission();
  }, [permission]);

  const handleTakePicture = async () => {
    try {
      if (cameraRef.current) {
        const photo = await (cameraRef.current as any).takePictureAsync({ quality: 0.8, base64: false });
        setCapturedPhoto(photo.uri);
        setShowPreview(true);
      }
    } catch {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถถ่ายรูปได้ กรุณาลองใหม่');
    }
  };

  const handleConfirmScan = () => {
    Alert.alert(
      'ยืนยันการสแกน', 'บันทึกการสแกนนี้ลงในบันทึก?',
      [
        { text: 'ยกเลิก', onPress: () => { setCapturedPhoto(null); setShowPreview(false); }, style: 'cancel' },
        {
          text: 'ยืนยัน', onPress: () => {
            incrementScans();
            Alert.alert('สำเร็จ!', 'บันทึกการสแกนเรียบร้อยแล้ว 📸');
            setCapturedPhoto(null); setShowPreview(false);
            setTimeout(() => navigation.goBack(), 500);
          },
        },
      ]
    );
  };

  const handleRetake = () => { setCapturedPhoto(null); setShowPreview(false); };

  // ── Loading ──
  if (!permission) {
    return (
      <SafeAreaView style={s.container}>
        <Text style={{ color: MUTED, textAlign: 'center', marginTop: 40 }}>กำลังโหลด...</Text>
      </SafeAreaView>
    );
  }

  // ── Permission denied ──
  if (!permission.granted) {
    return (
      <SafeAreaView style={s.permContainer}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <View style={s.permInner}>
          {/* Glow */}
          <View style={s.permGlow} />
          <View style={s.permIconBox}>
            <Text style={{ fontSize: 36 }}>📷</Text>
          </View>
          <Text style={s.permTitle}>ขออนุญาตการเข้าถึงกล้อง</Text>
          <Text style={s.permText}>
            เราต้องการเข้าถึงกล้องของคุณเพื่อสแกนฉลากอาหารและตรวจหา UPF
          </Text>
          <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
            <Text style={s.permBtnText}>อนุญาต</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={s.cancelBtnText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <CameraView style={s.camera} ref={cameraRef} facing={'back' as CameraType}>

        {/* ── Camera Header ── */}
        <View style={s.camHeader}>
          <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={s.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={s.camTitle}>ถ่ายรูปสินค้า</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ── Focus Guide ── */}
        <View style={s.focusGuide}>
          {/* Corner markers */}
          <View style={s.focusBox}>
            <View style={[s.corner, s.tl]} />
            <View style={[s.corner, s.tr]} />
            <View style={[s.corner, s.bl]} />
            <View style={[s.corner, s.br]} />
          </View>
          <Text style={s.focusHint}>จัดให้ฉลากอาหารอยู่ในกรอบ</Text>
        </View>

        {/* ── Controls ── */}
        <View style={s.controls}>
          <View style={s.controlsRow}>
            {/* Placeholder left */}
            <View style={{ width: 56 }} />

            {/* Capture */}
            <TouchableOpacity style={s.captureBtn} onPress={handleTakePicture} activeOpacity={0.8}>
              <View style={s.captureBtnRing}>
                <View style={s.captureBtnInner} />
              </View>
            </TouchableOpacity>

            {/* Gallery placeholder */}
            <View style={{ width: 56 }} />
          </View>
          <Text style={s.captureLabel}>กดเพื่อถ่ายรูปฉลาก</Text>
        </View>
      </CameraView>

      {/* ── Preview Modal ── */}
      <Modal visible={showPreview} transparent animationType="fade" onRequestClose={handleRetake}>
        <View style={s.previewContainer}>
          {capturedPhoto && <Image source={{ uri: capturedPhoto }} style={s.previewImage} />}

          <View style={s.previewOverlay}>
            {/* Top line glow */}
            <View style={s.previewTopLine} />

            <Text style={s.previewTitle}>ตรวจสอบรูปภาพ</Text>

            <View style={s.previewInfo}>
              <Text style={s.previewLabel}>🔍 ตรวจสอบให้ฉลากชัดเจน</Text>
              <Text style={s.previewDesc}>
                ตรวจสอบให้แน่ใจว่าฉลากอาหารในรูปมีความชัดเจนและอ่านได้ง่าย
              </Text>
            </View>

            <View style={s.previewButtons}>
              <TouchableOpacity style={s.retakeBtn} onPress={handleRetake}>
                <Text style={s.retakeBtnText}>🔄 ถ่ายใหม่</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={handleConfirmScan}>
                <Text style={s.confirmBtnText}>✓ ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#000' },
  permContainer:{ flex: 1, backgroundColor: BG },
  camera:       { flex: 1 },

  // Permission
  permInner: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 28, overflow: 'hidden',
  },
  permGlow: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: GREEN, opacity: 0.06, top: -50,
  },
  permIconBox: {
    width: 90, height: 90, borderRadius: 26, backgroundColor: GREEN_DIM,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER, marginBottom: 24,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  permTitle: { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 12, textAlign: 'center' },
  permText:  { fontSize: 14, color: MUTED, lineHeight: 22, marginBottom: 28, textAlign: 'center' },
  permBtn: {
    backgroundColor: GREEN, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 48, marginBottom: 12,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  permBtnText: { fontSize: 16, fontWeight: '700', color: BG },
  cancelBtn:   { paddingVertical: 14, paddingHorizontal: 48, borderRadius: 14, borderWidth: 1, borderColor: BORDER },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: MUTED },

  // Camera
  camHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'rgba(10,15,13,0.85)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(46,204,113,0.15)',
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(46,204,113,0.15)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)',
  },
  closeIcon: { fontSize: 18, color: TEXT, fontWeight: 'bold' },
  camTitle:  { fontSize: 16, fontWeight: '700', color: TEXT },

  // Focus
  focusGuide: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  focusBox: {
    width: 260, height: 260, position: 'relative',
    justifyContent: 'center', alignItems: 'center',
  },
  corner: {
    position: 'absolute', width: 28, height: 28,
    borderColor: GREEN, borderWidth: 3,
  },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  focusHint: { color: 'rgba(46,204,113,0.7)', fontSize: 13, marginTop: 20, fontWeight: '500' },

  // Controls
  controls: {
    alignItems: 'center', paddingVertical: 28,
    backgroundColor: 'rgba(10,15,13,0.85)',
    borderTopWidth: 1, borderTopColor: 'rgba(46,204,113,0.15)',
  },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 14 },
  captureBtn: { alignItems: 'center', justifyContent: 'center' },
  captureBtnRing: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 3, borderColor: GREEN,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 8,
  },
  captureBtnInner: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: GREEN,
  },
  captureLabel: { fontSize: 13, color: MUTED, fontWeight: '500' },

  // Preview
  previewContainer: { flex: 1, backgroundColor: '#000' },
  previewImage:     { flex: 1, width: '100%', height: '100%' },
  previewOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,15,13,0.95)',
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 36,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: 'rgba(46,204,113,0.2)',
    overflow: 'hidden',
  },
  previewTopLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    backgroundColor: GREEN, opacity: 0.6,
  },
  previewTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 16 },
  previewInfo: {
    backgroundColor: GREEN_DIM, borderLeftWidth: 3, borderLeftColor: GREEN,
    borderRadius: 10, padding: 14, marginBottom: 22,
    borderWidth: 1, borderColor: BORDER,
  },
  previewLabel: { fontSize: 13, fontWeight: '600', color: GREEN, marginBottom: 4 },
  previewDesc:  { fontSize: 12, color: MUTED, lineHeight: 18 },
  previewButtons: { flexDirection: 'row', gap: 12 },
  retakeBtn: {
    flex: 1, backgroundColor: SURFACE, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  retakeBtnText:  { fontSize: 15, fontWeight: '700', color: TEXT },
  confirmBtn: {
    flex: 1, backgroundColor: GREEN, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: BG },
});

export default ScannerScreen;