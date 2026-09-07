import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CasePreview } from '../src/components/CasePreview';
import { Button, Chip, Pill, SectionHeader } from '../src/components/ui';
import { backgrounds, phoneModels, platformOf, stickerPacks, templates as staticTemplates, Platform as PhonePlatform } from '../src/data/catalog';
import { Layer, Template } from '../src/data/types';
import { fetchTemplates, recordTemplateUse } from '../src/lib/templates';
import { useCart } from '../src/store/cart';
import { useDesign } from '../src/store/design';
import { colors, radii, shadow, spacing } from '../src/theme';

const STEPS = [
  { icon: '📱', label: 'Choose\nmodel' },
  { icon: '🖼️', label: 'Upload\n& design' },
  { icon: '💳', label: 'Pay' },
  { icon: '📦', label: 'Ship or\npickup' },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cartCount = useCart((s) => s.count());
  const startBlank = useDesign((s) => s.startBlank);
  const startFromTemplate = useDesign((s) => s.startFromTemplate);

  const [platform, setPlatform] = React.useState<PhonePlatform>('ios');
  const modelsForPlatform = phoneModels.filter((m) => platformOf(m) === platform);

  // Gallery starts with the bundled defaults (works with zero backend) and
  // is replaced with the live, admin-curated set once Supabase answers.
  const [galleryTemplates, setGalleryTemplates] = React.useState<Template[]>(staticTemplates);
  React.useEffect(() => {
    fetchTemplates().then((remote) => {
      if (remote && remote.length) setGalleryTemplates(remote);
    });
  }, []);

  const openBlank = () => {
    startBlank();
    router.push('/editor');
  };

  const openWithModel = (modelId: string) => {
    startBlank(modelId);
    router.push('/editor');
  };

  const openTemplate = (t: Template) => {
    recordTemplateUse(t.id);
    startFromTemplate(t);
    router.push('/editor');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.brandRow}>
            <View style={styles.logoDot}>
              <Text style={{ fontSize: 20 }}>🐰</Text>
            </View>
            <Text style={styles.wordmark}>casey</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/account')}>
              <Ionicons name="person-outline" size={20} color={colors.primaryDark} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/cart')}>
              <Ionicons name="bag-outline" size={20} color={colors.primaryDark} />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Hero */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <LinearGradient
            colors={[colors.gradientA, colors.gradientB]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, shadow.float]}
          >
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(123,97,255,0.5)', 'rgba(123,97,255,0)']}
              style={styles.heroBlob}
            />
            <View style={{ flex: 1 }}>
              <Pill text="DIY PHONE CASE" tint="rgba(255,255,255,0.25)" />
              <Text style={styles.heroTitle}>Design it.{'\n'}Print it.{'\n'}Love it.</Text>
              <Text style={styles.heroSub}>100% you, 100% Casey 💗</Text>
              <Button title="Start designing" icon="sparkles" variant="soft" onPress={openBlank} style={{ marginTop: 14, alignSelf: 'flex-start' }} />
            </View>
            <Text style={styles.heroBunny}>🐰</Text>
          </LinearGradient>
        </View>

        {/* How it works */}
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s.label} style={styles.step}>
              <View style={styles.stepBubble}>
                <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
              </View>
              <Text style={styles.stepLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Featured templates */}
        <View style={styles.section}>
          <SectionHeader title="Casey Case Gallery ✨" action="Blank case" onAction={openBlank} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: spacing.lg }}>
            {galleryTemplates.map((t) => (
              <Pressable key={t.id} style={styles.tplCard} onPress={() => openTemplate(t)}>
                <CasePreview
                  modelId={phoneModels[0].id}
                  background={t.background}
                  layers={t.layers.map((l, i) => ({ ...l, id: `${t.id}_${i}`, z: (l as Layer).z ?? i + 1 })) as Layer[]}
                  width={150}
                />
                <View style={{ marginTop: 10 }}>
                  {t.tag ? <Pill text={t.tag} tint={t.accent} /> : null}
                  <Text style={styles.tplName}>{t.name}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Sticker packs */}
        <View style={styles.section}>
          <SectionHeader title="Sticker packs 🎀" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: spacing.lg }}>
            {stickerPacks.map((p) => (
              <Pressable key={p.id} style={styles.packCard} onPress={openBlank}>
                <Text style={{ fontSize: 34 }}>{p.cover}</Text>
                <Text style={styles.packName}>{p.name}</Text>
                <Text style={styles.packCount}>{p.stickers.length} stickers</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Models */}
        <View style={styles.section}>
          <SectionHeader title="Pick your phone 📱" />
          <View style={styles.segRow}>
            <Pressable style={[styles.seg, platform === 'ios' && styles.segActive]} onPress={() => setPlatform('ios')}>
              <Ionicons name="logo-apple" size={16} color={platform === 'ios' ? colors.white : colors.inkSoft} />
              <Text style={[styles.segText, platform === 'ios' && { color: colors.white }]}>iPhone</Text>
            </Pressable>
            <Pressable style={[styles.seg, platform === 'android' && styles.segActive]} onPress={() => setPlatform('android')}>
              <Ionicons name="logo-android" size={16} color={platform === 'android' ? colors.white : colors.inkSoft} />
              <Text style={[styles.segText, platform === 'android' && { color: colors.white }]}>Android</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {modelsForPlatform.map((m) => (
              <Chip key={m.id} label={`${m.brand} ${m.name}`} onPress={() => openWithModel(m.id)} />
            ))}
          </View>
        </View>

        {/* Colors teaser */}
        <View style={styles.section}>
          <SectionHeader title="Base colors 🎨" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {backgrounds.map((b) => (
              <View key={b.id} style={{ alignItems: 'center', width: 64 }}>
                <LinearGradient colors={b.colors as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.swatch} />
                <Text style={styles.swatchName} numberOfLines={1}>{b.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>Love. Print. Stan. Repeat. 🐰{'\n'}#CASEYCASE #DIYKC</Text>
      </ScrollView>

      {/* Floating CTA */}
      <View style={[styles.fab, { bottom: insets.bottom + 16 }]}>
        <Button title="Design your case" icon="brush" size="lg" tone="cool" onPress={openBlank} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoDot: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontSize: 28, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  topActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.primary, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },

  hero: { flexDirection: 'row', borderRadius: radii.xl, padding: spacing.xl, marginTop: 6, overflow: 'hidden' },
  heroBlob: { position: 'absolute', width: 220, height: 220, borderRadius: 110, right: -70, top: -80 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: colors.white, marginTop: 10, lineHeight: 36 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginTop: 8, fontSize: 14 },
  heroBunny: { fontSize: 90, alignSelf: 'flex-end', marginBottom: -6 },

  steps: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  step: { alignItems: 'center', gap: 8, flex: 1 },
  stepBubble: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  stepNum: { position: 'absolute', top: -4, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  stepLabel: { fontSize: 12, fontWeight: '700', color: colors.inkSoft, textAlign: 'center' },

  section: { paddingHorizontal: spacing.lg, paddingLeft: spacing.lg, marginTop: spacing.xxl },
  segRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  seg: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: radii.pill, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  segActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segText: { fontWeight: '800', color: colors.inkSoft, fontSize: 14 },
  tplCard: { width: 150 },
  tplName: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: 4 },

  packCard: { width: 104, backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.md, alignItems: 'center', gap: 2, ...shadow.soft },
  packName: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: 4 },
  packCount: { fontSize: 11, fontWeight: '600', color: colors.inkFaint },

  swatch: { width: 56, height: 56, borderRadius: radii.md, borderWidth: 2, borderColor: colors.white, ...shadow.soft },
  swatchName: { fontSize: 11, fontWeight: '600', color: colors.inkSoft, marginTop: 4 },

  footer: { textAlign: 'center', color: colors.primarySoft, fontWeight: '800', marginTop: spacing.xxl, lineHeight: 20 },
  fab: { position: 'absolute', left: spacing.lg, right: spacing.lg },
});
