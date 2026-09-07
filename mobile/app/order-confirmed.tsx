import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui';
import { formatPrice } from '../src/store/cart';
import { colors, radii, shadow, spacing } from '../src/theme';

export default function OrderConfirmed() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { total, email } = useLocalSearchParams<{ total?: string; email?: string }>();
  const orderNo = React.useMemo(() => `CK-${Math.floor(100000 + Math.random() * 900000)}`, []);

  return (
    <LinearGradient colors={colors.gradientCool as [string, string]} style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.badge}>
          <Text style={{ fontSize: 70 }}>🐰</Text>
          <View style={styles.check}>
            <Ionicons name="checkmark" size={22} color={colors.white} />
          </View>
        </View>

        <Text style={styles.title}>Yay! Order placed 💗</Text>
        <Text style={styles.sub}>Your Casey case is on its way to being printed.</Text>

        <View style={styles.card}>
          <Row label="Order number" value={orderNo} />
          <View style={styles.divider} />
          <Row label="Total paid" value={total ? formatPrice(Number(total)) : '—'} />
          <View style={styles.divider} />
          <Row label="Receipt sent to" value={email ?? '—'} />
        </View>

        <Text style={styles.tip}>We'll email you tracking + a QR pickup code. Share your case with #CASEYCASE 🎀</Text>

        <View style={{ flex: 1 }} />

        <Button title="Design another case" icon="add" variant="soft" onPress={() => router.replace('/editor')} style={{ width: '100%' }} />
        <Button title="Back to home" variant="ghost" onPress={() => router.replace('/')} style={{ width: '100%', marginTop: 10, borderColor: 'rgba(255,255,255,0.5)' }} />
      </View>
    </LinearGradient>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl, alignItems: 'center' },
  badge: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', ...shadow.float },
  check: { position: 'absolute', bottom: 8, right: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.white },
  title: { fontSize: 26, fontWeight: '900', color: colors.white, marginTop: 20 },
  sub: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 6, textAlign: 'center' },
  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.lg, width: '100%', marginTop: 24, ...shadow.card },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLabel: { color: colors.inkSoft, fontWeight: '600', fontSize: 14 },
  rowValue: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  divider: { height: 1, backgroundColor: colors.line },
  tip: { color: 'rgba(255,255,255,0.95)', fontWeight: '600', textAlign: 'center', marginTop: 20, lineHeight: 20 },
});
