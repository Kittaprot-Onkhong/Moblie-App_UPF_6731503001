import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

const GREEN = '#3BAD45';
const TEXT_DARK = '#1A1A1A';
const TEXT_MID = '#666';
const WHITE = '#fff';

const ScannerScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สแกนบาร์โค้ด</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.title}>เปิดกล้องสแกน</Text>
        <Text style={styles.description}>
          ชี้กล้องไปที่บาร์โค้ดหรือ QR code บนฉลากสินค้า
        </Text>
        
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderText}>📸 พื้นที่กล้อง</Text>
        </View>

        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanButtonText}>เริ่มสแกน</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F7E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 28, color: GREEN, fontWeight: '300' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  icon: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: TEXT_DARK, marginBottom: 8 },
  description: {
    fontSize: 14,
    color: TEXT_MID,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },

  cameraPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  placeholderText: { fontSize: 48, color: TEXT_MID },

  scanButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: GREEN,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonText: { fontSize: 16, fontWeight: '700', color: WHITE },
});

export default ScannerScreen;
