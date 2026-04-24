import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../../src/theme/tokens';
import TopBar from '../../src/components/TopBar';
import useAuthStore from '../../src/stores/authStore';
import useSubscriptionStore from '../../src/stores/subscriptionStore';

const AVATAR_PLACEHOLDER = 'https://placehold.co/56x56/EFEFEF/6B6B66?text=MS';

const BASE_MENU_ITEMS = [
  { icon: 'truck',        label: 'My Garage',        route: '/(tabs)/garage' },
  { icon: 'package',      label: 'Orders',            route: '/orders' },
  { icon: 'star',         label: 'Your plan',         route: null },
  { icon: 'bookmark',     label: 'Saved items',       route: '/(tabs)/saved' },
  { icon: 'trending-down', label: 'Watchlist',         route: '/watchlist' },
  { icon: 'map-pin',      label: 'Addresses',         route: '/addresses' },
  { icon: 'credit-card',  label: 'Payment methods',   route: '/payment-methods' },
  { icon: 'bell',         label: 'Notifications',     route: '/notifications' },
  { icon: 'help-circle',  label: 'Help & support',    route: null },
  { icon: 'shield',       label: 'Privacy',           route: null },
  { icon: 'file-text',    label: 'Terms of service',  route: null },
];

function MenuRow({ icon, label, onPress, danger, last }) {
  return (
    <Pressable
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      android_ripple={{ color: tokens.colors.surface }}
    >
      <Feather
        name={icon}
        size={22}
        color={danger ? tokens.colors.danger : tokens.colors.textMuted}
        style={styles.rowIcon}
      />
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {!danger && (
        <Feather name="chevron-right" size={16} color={tokens.colors.textMuted} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { tier } = useSubscriptionStore();

  const menuItems = BASE_MENU_ITEMS.map((item) =>
    item.label === 'Your plan'
      ? { ...item, route: tier === 'free' ? '/subscription' : '/subscription-manage' }
      : item
  );

  const name = user?.name ?? 'Guest';
  const email = user?.email ?? '';
  const avatarUri = user?.avatarUri ?? AVATAR_PLACEHOLDER;

  function handleSignOut() {
    Alert.alert('Sign out?', 'You will be signed out of CarLens.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/sign-in');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="user" size={22} color={tokens.colors.text} />}
        titleNode={<Text style={styles.wordmark}>CarLens</Text>}
        rightIcon={<Feather name="share-2" size={22} color={tokens.colors.text} />}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, idx) => (
            <MenuRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              last={idx === menuItems.length - 1}
              onPress={item.route ? () => router.push(item.route) : () => {}}
            />
          ))}
        </View>

        <View style={styles.signOutSection}>
          <MenuRow
            icon="log-out"
            label="Sign out"
            danger
            last
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  wordmark: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
  },
  scroll: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: tokens.spacing.xl,
  },
  headerText: {
    flex: 1,
    marginRight: tokens.spacing.lg,
  },
  name: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.text,
    fontStyle: 'italic',
  },
  email: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.colors.surface,
  },
  menu: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  rowIcon: {
    marginRight: tokens.spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  rowLabelDanger: {
    color: tokens.colors.danger,
  },
  signOutSection: {
    marginTop: tokens.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
  },
});
