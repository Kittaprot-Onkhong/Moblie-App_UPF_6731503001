import React, { useState, useRef, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useUserStore } from '../../core/store/userStore';

const GREEN = '#3BAD45';
const GREEN_LIGHT = '#E8F7E9';
const ORANGE = '#F5821F';
const RED = '#E74C3C';
const TEXT_DARK = '#1A1A1A';
const TEXT_MID = '#666';
const WHITE = '#fff';

const ScannerScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { incrementScans } = useUserStore();

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleTakePicture = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedPhoto(photo.uri);
        setShowPreview(true);
      }
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถถ่ายรูปได้ กรุณาลองใหม่');
    }
  };

  const handleConfirmScan = () => {
    Alert.alert(
      'ยืนยันการสแกน',
      'บันทึกการสแกนนี้ลงในบันทึก?',
      [
        {
          text: 'ยกเลิก',
          onPress: () => {
            setCapturedPhoto(null);
            setShowPreview(false);
          },
          style: 'cancel',
        },
        {
          text: 'ยืนยัน',
          onPress: () => {
            incrementScans();
            Alert.alert('สำเร็จ!', 'บันทึกการสแกนเรียบร้อยแล้ว 📸');
            setCapturedPhoto(null);
            setShowPreview(false);
            setTimeout(() => {
              navigation.goBack();
            }, 500);
          },
        },
      ]
    );
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setShowPreview(false);
  };

  if (!permission) {
    return (
      <SafeAreaView style={s.container}>
        <Text>กำลังโหลด...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.permissionContainer}>
          <Text style={s.permissionIcon}>📷</Text>
          <Text style={s.permissionTitle}>ขออนุญาตการเข้าถึงกล้อง</Text>
          <Text style={s.permissionText}>
            เราต้องการเข้าถึงกล้องของคุณเพื่อสแกนฉลากอาหารและตรวจหา UPF
          </Text>
          <TouchableOpacity style={s.permissionBtn} onPress={requestPermission}>
            <Text style={s.permissionBtnText}>อนุญาต</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.cancelBtnText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <CameraView style={s.camera} ref={cameraRef} facing="back">
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={s.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>ถ่ายรูปสินค้า</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Focus Guide */}
        <View style={s.focusGuide}>
          <View style={s.focusBox} />
        </View>

        {/* Controls */}
        <View style={s.controls}>
          <TouchableOpacity
            style={s.captureBtn}
            onPress={handleTakePicture}
          >
            <View style={s.captureBtnInner} />
          </TouchableOpacity>
          <Text style={s.captureLabel}>กดเพื่อถ่ายรูป</Text>
        </View>
      </CameraView>

      <Modal
        visible={showPreview}
        transparent={true}
        animationType="fade"
        onRequestClose={handleRetake}
      >
        <View style={s.previewContainer}>
          {capturedPhoto && (
            <Image source={{ uri: capturedPhoto }} style={s.previewImage} />
          )}

          <View style={s.previewOverlay}>
            <View style={s.previewHeader}>
              <Text style={s.previewTitle}>ตรวจสอบรูปภาพ</Text>
            </View>

            <View style={s.previewInfo}>
              <Text style={s.previewLabel}>🔍 ตรวจสอบให้ฉลากชัดเจน</Text>
              <Text style={s.previewDesc}>
                ตรวจสอบให้แน่ใจว่าฉลากอาหารในรูปมีความชัดเจนและอ่านได้ง่าย
              </Text>
            </View>

            <View style={s.previewButtons}>
              <TouchableOpacity
                style={s.retakeBtn}
                onPress={handleRetake}
              >
                <Text style={s.retakeBtnText}>🔄 ถ่ายใหม่</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.confirmBtn}
                onPress={handleConfirmScan}
              >
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
  container: { flex: 1, backgroundColor: '#000' },

  camera: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: { fontSize: 20, color: WHITE, fontWeight: 'bold' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: WHITE },

  focusGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: ORANGE,
    borderRadius: 10,
    opacity: 0.7,
  },

  controls: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 3,
    borderColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  captureBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: WHITE,
  },
  captureLabel: { fontSize: 14, color: WHITE, fontWeight: '600' },

  previewContainer: { flex: 1, backgroundColor: '#000' },
  previewImage: { flex: 1, width: '100%', height: '100%' },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  previewHeader: { marginBottom: 16 },
  previewTitle: { fontSize: 18, fontWeight: '700', color: WHITE },
  previewInfo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderLeftWidth: 4,
    borderLeftColor: ORANGE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  previewLabel: { fontSize: 13, fontWeight: '600', color: ORANGE, marginBottom: 4 },
  previewDesc: { fontSize: 12, color: '#CCC', lineHeight: 18 },
  previewButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  retakeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  retakeBtnText: { fontSize: 15, fontWeight: '700', color: WHITE },
  confirmBtn: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: WHITE },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F8F9FA',
  },
  permissionIcon: { fontSize: 60, marginBottom: 20 },
  permissionTitle: { fontSize: 20, fontWeight: '700', color: TEXT_DARK, marginBottom: 12, textAlign: 'center' },
  permissionText: { fontSize: 14, color: TEXT_MID, lineHeight: 22, marginBottom: 24, textAlign: 'center' },
  permissionBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  permissionBtnText: { fontSize: 16, fontWeight: '700', color: WHITE },
  cancelBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: TEXT_MID },
});

export default ScannerScreen;
