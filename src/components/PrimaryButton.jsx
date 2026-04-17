import { Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import tokens from '../theme/tokens';

export default function PrimaryButton({
  label,
  onPress,
  variant = 'filled',
  fullWidth,
  iconLeft,
  disabled,
  loading,
  style,
  labelStyle,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && !loading && styles.dimmed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? tokens.colors.white : tokens.colors.primary}
        />
      ) : (
        <>
          {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
          <Text style={[styles.label, styles[`label_${variant}`], labelStyle]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
    borderRadius: tokens.radius.md,
  },
  filled: {
    backgroundColor: tokens.colors.primary,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: tokens.colors.primary,
  },
  text: {},
  dimmed: {
    opacity: 0.45,
  },
  fullWidth: {
    width: '100%',
  },
  iconLeft: {
    marginRight: tokens.spacing.sm,
  },
  label: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    letterSpacing: 0.3,
  },
  label_filled: { color: tokens.colors.white },
  label_outlined: { color: tokens.colors.primary },
  label_text: { color: tokens.colors.primary },
});
