import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import tokens from '../theme/tokens';

export default function TopBar({ leftIcon, title, rightIcon, onLeftPress, onRightPress }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.side} onPress={onLeftPress} disabled={!onLeftPress}>
        {leftIcon}
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.side} onPress={onRightPress} disabled={!onRightPress}>
        {rightIcon}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.colors.bg,
  },
  side: {
    width: 40,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
});
