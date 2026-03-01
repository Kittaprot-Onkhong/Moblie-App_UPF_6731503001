import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useLanguage } from '../../core/i18n';

const GREEN = '#3BAD45';
const GREEN_LIGHT = '#E8F7E9';
const GREEN_DARK = '#2E9438';
const ORANGE = '#F5821F';
const ORANGE_LIGHT = '#FFF3E8';
const TEXT_DARK = '#1A1A1A';
const TEXT_MID = '#666';
const TEXT_LIGHT = '#999';
const WHITE = '#fff';
const BG_GRAY = '#F8F9FA';

const AboutUPFScreen = ({ navigation }: any) => {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aboutUPF')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={styles.emoji}>🚫</Text>
          <Text style={styles.mainTitle}>{t('upfTitle')}</Text>
        </View>

        {/* Definition */}
        <View style={styles.card}>
          <Text style={styles.paragraph}>{t('upfDef')}</Text>
        </View>

        {/* Important Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('upfImportantInfo')}</Text>

          {/* Definition */}
          <View style={styles.infoItem}>
            <View style={[styles.dot, { backgroundColor: ORANGE }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{t('upfDef2')}</Text>
              <Text style={styles.infoDesc}>{t('upfDef2Desc')}</Text>
            </View>
          </View>

          {/* Indicators */}
          <View style={styles.infoItem}>
            <View style={[styles.dot, { backgroundColor: ORANGE }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{t('upfIndicators')}</Text>
              <Text style={styles.infoDesc}>{t('upfIndicatorsDesc')}</Text>
            </View>
          </View>

          {/* Examples */}
          <View style={styles.infoItem}>
            <View style={[styles.dot, { backgroundColor: ORANGE }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{t('upfExamples')}</Text>
              <Text style={styles.infoDesc}>{t('upfExamplesDesc')}</Text>
            </View>
          </View>

          {/* Health Impact */}
          <View style={[styles.infoItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.dot, { backgroundColor: '#E74C3C' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{t('upfImpact')}</Text>
              <Text style={[styles.infoDesc, { color: '#C0392B' }]}>
                {t('upfImpactDesc')}
              </Text>
            </View>
          </View>
        </View>

        {/* Ways to Reduce */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('upfReduction')}</Text>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>1</Text>
            <Text style={styles.tipText}>{t('upfReduction1')}</Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>2</Text>
            <Text style={styles.tipText}>{t('upfReduction2')}</Text>
          </View>

          <View style={[styles.tipItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.tipNumber}>3</Text>
            <Text style={styles.tipText}>{t('upfReduction3')}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_GRAY },

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
    backgroundColor: GREEN_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 28, color: GREEN, fontWeight: '300' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },

  content: { paddingHorizontal: 16, paddingTop: 16 },

  titleSection: { alignItems: 'center', marginBottom: 24 },
  emoji: { fontSize: 60, marginBottom: 12 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: TEXT_DARK, textAlign: 'center' },

  card: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  paragraph: { fontSize: 14, color: TEXT_MID, lineHeight: 22 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginBottom: 12 },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12, marginTop: 4 },

  infoLabel: { fontSize: 13, fontWeight: '700', color: TEXT_DARK, marginBottom: 4 },
  infoDesc: { fontSize: 13, color: TEXT_MID, lineHeight: 20 },

  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  tipNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: GREEN_LIGHT,
    color: GREEN_DARK,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 12,
    marginTop: 2,
  },

  tipText: { fontSize: 13, color: TEXT_MID, lineHeight: 20, flex: 1 },
});

export default AboutUPFScreen;
