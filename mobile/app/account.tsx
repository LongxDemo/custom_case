import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui';
import { hasSupabase, supabase } from '../src/lib/supabase';
import { colors, radii, shadow, spacing } from '../src/theme';

export default function Account() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async () => {
    if (!supabase) {
      Alert.alert('Backend not connected', 'Add your Supabase keys to enable accounts. You can keep designing as a guest!');
      return;
    }
    setLoading(true);
    const fn = mode === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert('Oops', error.message);
    else if (mode === 'signup') Alert.alert('Check your email 💌', 'Confirm your address to finish signing up.');
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setUserEmail(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 6 }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.hero}>
          <View style={styles.avatar}><Text style={{ fontSize: 34 }}>🐰</Text></View>
          <Text style={styles.heroName}>{userEmail ?? 'Guest cutie'}</Text>
          <Text style={styles.heroSub}>{userEmail ? 'Signed in — designs are saved to your account' : 'Browsing as a guest'}</Text>
        </View>

        {userEmail ? (
          <View style={{ gap: 12 }}>
            <MenuItem icon="heart" label="Saved designs" />
            <MenuItem icon="cube" label="My orders" />
            <MenuItem icon="settings" label="Settings" />
            <Button title="Sign out" variant="soft" icon="log-out" onPress={signOut} style={{ marginTop: 8 }} />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{mode === 'signin' ? 'Welcome back 💗' : 'Join Casey 💗'}</Text>
            <Text style={styles.cardSub}>Save designs & track orders. Optional — you can order as a guest too.</Text>
            {!hasSupabase && (
              <View style={styles.notice}>
                <Ionicons name="information-circle" size={16} color={colors.primaryDark} />
                <Text style={styles.noticeText}>Backend not connected yet. Accounts activate once Supabase keys are added.</Text>
              </View>
            )}
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.inkFaint} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
            <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.inkFaint} secureTextEntry style={styles.input} />
            <Button title={mode === 'signin' ? 'Sign in' : 'Create account'} loading={loading} onPress={submit} style={{ marginTop: 6 }} />
            <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ marginTop: 12, alignSelf: 'center' }}>
              <Text style={styles.switchText}>
                {mode === 'signin' ? "New here? Create an account" : 'Already have an account? Sign in'}
              </Text>
            </Pressable>
          </View>
        )}

        <Button title="Continue designing" icon="brush" variant="ghost" onPress={() => router.replace('/editor')} style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.menuItem}>
      <View style={styles.menuIcon}><Ionicons name={icon} size={18} color={colors.primaryDark} /></View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  title: { fontSize: 18, fontWeight: '900', color: colors.ink },

  hero: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center', ...shadow.soft },
  heroName: { fontSize: 20, fontWeight: '900', color: colors.ink, marginTop: 12 },
  heroSub: { fontSize: 13, fontWeight: '600', color: colors.inkFaint, marginTop: 2 },

  card: { backgroundColor: colors.white, borderRadius: radii.xl, padding: spacing.xl, ...shadow.card },
  cardTitle: { fontSize: 20, fontWeight: '900', color: colors.ink },
  cardSub: { fontSize: 13, fontWeight: '600', color: colors.inkSoft, marginTop: 4, marginBottom: 14 },
  notice: { flexDirection: 'row', gap: 6, backgroundColor: colors.petal, padding: 10, borderRadius: radii.md, marginBottom: 12, alignItems: 'center' },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.primaryDark },
  input: { backgroundColor: colors.petal, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: colors.ink, marginBottom: 10 },
  switchText: { color: colors.primary, fontWeight: '700', fontSize: 13 },

  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.md, ...shadow.soft },
  menuIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.ink },
});
