import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, shadow, spacing } from '../theme';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'soft' | 'ghost' | 'dark';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  size?: 'md' | 'lg';
  style?: ViewStyle;
};

export function Button({ title, variant = 'primary', icon, loading, size = 'md', style, ...rest }: ButtonProps) {
  const pad = size === 'lg' ? { paddingVertical: 16, paddingHorizontal: 24 } : { paddingVertical: 12, paddingHorizontal: 18 };
  const content = (
    <View style={styles.btnRow}>
      {loading ? (
        <ActivityIndicator color={variant === 'soft' || variant === 'ghost' ? colors.primary : colors.white} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'lg' ? 20 : 18}
              color={variant === 'soft' ? colors.primaryDark : variant === 'ghost' ? colors.primary : colors.white}
            />
          )}
          <Text
            style={[
              styles.btnText,
              size === 'lg' && { fontSize: 17 },
              (variant === 'soft' || variant === 'ghost') && { color: variant === 'soft' ? colors.primaryDark : colors.primary },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <Pressable {...rest} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, style]}>
        <LinearGradient
          colors={[colors.gradientA, colors.gradientB]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btnBase, pad, shadow.soft]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  const bg =
    variant === 'soft' ? colors.blush : variant === 'dark' ? colors.ink : 'transparent';
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [styles.btnBase, pad, { backgroundColor: bg, opacity: pressed ? 0.85 : 1 }, variant === 'ghost' && styles.ghostBorder, style]}
    >
      {content}
    </Pressable>
  );
}

export function Chip({
  label,
  emoji,
  active,
  onPress,
}: {
  label: string;
  emoji?: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: colors.primary, borderColor: colors.primary },
        pressed && { opacity: 0.85 },
      ]}
    >
      {emoji ? <Text style={{ fontSize: 15 }}>{emoji}</Text> : null}
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ text, tint = colors.primary }: { text: string; tint?: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: tint }]}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btnBase: { borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: colors.white, fontWeight: '800', fontSize: 15 } as TextStyle,
  ghostBorder: { borderWidth: 2, borderColor: colors.blush },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: radii.pill,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line,
  },
  chipText: { fontWeight: '700', color: colors.ink, fontSize: 13.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.ink },
  sectionAction: { fontSize: 14, fontWeight: '700', color: colors.primary },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.lg, ...shadow.card },
  pill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radii.pill, alignSelf: 'flex-start' },
  pillText: { color: colors.white, fontWeight: '800', fontSize: 11, letterSpacing: 0.3 },
});
