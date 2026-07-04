import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CasePreview } from '../src/components/CasePreview';
import { Button } from '../src/components/ui';
import { phoneModels } from '../src/data/catalog';
import { formatPrice, useCart } from '../src/store/cart';
import { colors, radii, shadow, spacing } from '../src/theme';

export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotalCents());

  const shipping = items.some((i) => i.fulfillment === 'ship') ? 499 : 0;
  const total = subtotal + shipping;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Your bag 🛍️</Text>
        <View style={{ width: 40 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>🐰</Text>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptySub}>Design a cutie case to get started.</Text>
          <Button title="Start designing" icon="brush" onPress={() => router.replace('/editor')} style={{ marginTop: 16 }} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 20, gap: 14 }}>
            {items.map((item) => {
              const model = phoneModels.find((m) => m.id === item.modelId);
              return (
                <View key={item.id} style={styles.card}>
                  <CasePreview
                    modelId={item.modelId}
                    background={item.design.background}
                    layers={item.design.layers}
                    width={72}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>Custom Casey Case</Text>
                    <Text style={styles.itemModel}>{model?.brand} {model?.name}</Text>

                    <View style={styles.fulfillRow}>
                      <FulfillChip label="Ship" icon="cube-outline" active={item.fulfillment === 'ship'} onPress={() => useCart.setState((s) => ({ items: s.items.map((i) => i.id === item.id ? { ...i, fulfillment: 'ship' } : i) }))} />
                      <FulfillChip label="Pickup" icon="storefront-outline" active={item.fulfillment === 'pickup'} onPress={() => useCart.setState((s) => ({ items: s.items.map((i) => i.id === item.id ? { ...i, fulfillment: 'pickup' } : i) }))} />
                    </View>

                    <View style={styles.itemBottom}>
                      <View style={styles.qtyRow}>
                        <Pressable style={styles.qtyBtn} onPress={() => setQty(item.id, item.quantity - 1)}>
                          <Ionicons name="remove" size={16} color={colors.primaryDark} />
                        </Pressable>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <Pressable style={styles.qtyBtn} onPress={() => setQty(item.id, item.quantity + 1)}>
                          <Ionicons name="add" size={16} color={colors.primaryDark} />
                        </Pressable>
                      </View>
                      <Text style={styles.itemPrice}>{formatPrice(item.priceCents * item.quantity)}</Text>
                    </View>
                  </View>
                  <Pressable style={styles.removeBtn} onPress={() => remove(item.id)}>
                    <Ionicons name="close" size={16} color={colors.inkFaint} />
                  </Pressable>
                </View>
              );
            })}

            <Pressable style={styles.addMore} onPress={() => router.replace('/editor')}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={styles.addMoreText}>Design another case</Text>
            </Pressable>
          </ScrollView>

          <View style={[styles.summary, { paddingBottom: insets.bottom + 14 }]}>
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? 'Free (pickup)' : formatPrice(shipping)} />
            <View style={styles.divider} />
            <Row label="Total" value={formatPrice(total)} bold />
            <Button title="Checkout" icon="card" size="lg" onPress={() => router.push('/checkout')} style={{ marginTop: 12 }} />
          </View>
        </>
      )}
    </View>
  );
}

function FulfillChip({ label, icon, active, onPress }: { label: string; icon: any; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.fChip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={onPress}>
      <Ionicons name={icon} size={14} color={active ? colors.white : colors.inkSoft} />
      <Text style={[styles.fChipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && { color: colors.ink, fontWeight: '800', fontSize: 16 }]}>{label}</Text>
      <Text style={[styles.rowValue, bold && { fontSize: 18 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  title: { fontSize: 18, fontWeight: '900', color: colors.ink },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: colors.ink, marginTop: 8 },
  emptySub: { color: colors.inkSoft, fontWeight: '600', marginTop: 4 },

  card: { flexDirection: 'row', gap: 12, backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.md, ...shadow.soft },
  itemName: { fontSize: 15, fontWeight: '800', color: colors.ink },
  itemModel: { fontSize: 12, fontWeight: '600', color: colors.inkFaint, marginTop: 1 },
  fulfillRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  fChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: radii.pill, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white },
  fChipText: { fontSize: 12, fontWeight: '700', color: colors.inkSoft },
  itemBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 15, fontWeight: '800', color: colors.ink, minWidth: 16, textAlign: 'center' },
  itemPrice: { fontSize: 16, fontWeight: '900', color: colors.primaryDark },
  removeBtn: { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.petal, alignItems: 'center', justifyContent: 'center' },

  addMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: radii.lg, borderWidth: 2, borderColor: colors.blush, borderStyle: 'dashed' },
  addMoreText: { color: colors.primary, fontWeight: '800' },

  summary: { backgroundColor: colors.white, padding: spacing.lg, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, ...shadow.float },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  rowLabel: { color: colors.inkSoft, fontWeight: '600', fontSize: 14 },
  rowValue: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 8 },
});
