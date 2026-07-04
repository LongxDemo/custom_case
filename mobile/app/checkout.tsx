import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui';
import { formatPrice, useCart } from '../src/store/cart';
import { colors, radii, shadow, spacing } from '../src/theme';

export default function Checkout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotalCents());
  const clear = useCart((s) => s.clear);

  const needsShipping = items.some((i) => i.fulfillment === 'ship');
  const shipping = needsShipping ? 499 : 0;
  const total = subtotal + shipping;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [card, setCard] = useState('');
  const [paying, setPaying] = useState(false);

  const valid = useMemo(() => {
    if (!name.trim() || !email.includes('@')) return false;
    if (needsShipping && address.trim().length < 6) return false;
    if (card.replace(/\s/g, '').length < 12) return false;
    return true;
  }, [name, email, address, card, needsShipping]);

  const pay = async () => {
    setPaying(true);
    // TODO: replace with Stripe PaymentSheet — create a PaymentIntent on the
    // backend (Supabase Edge Function), then present the sheet here.
    await new Promise((r) => setTimeout(r, 1200));
    setPaying(false);
    clear();
    router.replace({ pathname: '/order-confirmed', params: { total: String(total), email } });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.topbar, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Checkout 💳</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Section title="Contact">
          <Field label="Full name" value={name} onChangeText={setName} placeholder="Casey Bunny" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" />
        </Section>

        {needsShipping && (
          <Section title="Shipping address">
            <Field label="Address" value={address} onChangeText={setAddress} placeholder="123 K-Pop Lane, Seoul" multiline />
          </Section>
        )}

        <Section title="Payment">
          <View style={styles.cardBrands}>
            <Ionicons name="card" size={20} color={colors.primaryDark} />
            <Text style={styles.cardBrandsText}>Secured by Stripe</Text>
          </View>
          <Field label="Card number" value={card} onChangeText={(t: string) => setCard(t.replace(/[^0-9 ]/g, ''))} placeholder="4242 4242 4242 4242" keyboardType="number-pad" />
          <Text style={styles.testHint}>Test mode — use 4242 4242 4242 4242</Text>
        </Section>

        <View style={styles.summaryCard}>
          <Row label="Subtotal" value={formatPrice(subtotal)} />
          <Row label="Shipping" value={shipping === 0 ? 'Free (pickup)' : formatPrice(shipping)} />
          <View style={styles.divider} />
          <Row label="Total" value={formatPrice(total)} bold />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Button
          title={paying ? 'Processing…' : `Pay ${formatPrice(total)}`}
          icon="lock-closed"
          size="lg"
          loading={paying}
          disabled={!valid || paying}
          onPress={pay}
          style={{ opacity: valid ? 1 : 0.5 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function Field({ label, ...props }: any) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.inkFaint}
        style={[styles.input, props.multiline && { minHeight: 56, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && { color: colors.ink, fontWeight: '800', fontSize: 16 }]}>{label}</Text>
      <Text style={[styles.rowValue, bold && { fontSize: 18, color: colors.primaryDark }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  title: { fontSize: 18, fontWeight: '900', color: colors.ink },

  section: { backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.lg, ...shadow.soft },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: colors.ink, marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: colors.inkSoft, marginBottom: 5 },
  input: { backgroundColor: colors.petal, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: colors.ink },
  cardBrands: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  cardBrandsText: { fontSize: 12, fontWeight: '700', color: colors.inkSoft },
  testHint: { fontSize: 11, color: colors.inkFaint, marginTop: 6, fontWeight: '600' },

  summaryCard: { backgroundColor: colors.petal, borderRadius: radii.lg, padding: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  rowLabel: { color: colors.inkSoft, fontWeight: '600', fontSize: 14 },
  rowValue: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 8 },

  footer: { backgroundColor: colors.white, padding: spacing.lg, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, ...shadow.float },
});
