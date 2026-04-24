import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import TopBar from '../src/components/TopBar';
import PrimaryButton from '../src/components/PrimaryButton';
import useAuthStore from '../src/stores/authStore';

const DELETE_ITEMS = [
  { icon: 'truck', label: 'Your saved vehicles and garage' },
  { icon: 'camera', label: 'All identification history and photos' },
  { icon: 'package', label: 'Order history and receipts' },
  { icon: 'bookmark', label: 'Saved items and watchlists' },
  { icon: 'user', label: 'Your profile and preferences' },
];

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { deleteAccount } = useAuthStore();

  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmText === 'DELETE' && !deleting;

  function handleDeletePress() {
    Alert.alert(
      'Are you absolutely sure?',
      'This will permanently delete your account and all associated data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              router.replace('/sign-in');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={<Feather name="arrow-left" size={22} color={tokens.colors.text} />}
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.topTitle}>Delete Account</Text>}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconWrap}>
          <Feather name="alert-triangle" size={48} color={tokens.colors.danger} />
        </View>

        <Text style={styles.headline}>Delete your account?</Text>
        <Text style={styles.body}>
          This action is permanent and cannot be undone. We will delete all of your data,
          including:
        </Text>

        <View style={styles.list}>
          {DELETE_ITEMS.map((item) => (
            <View key={item.icon} style={styles.row}>
              <Feather name={item.icon} size={18} color={tokens.colors.danger} />
              <Text style={styles.rowLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Active orders will still be fulfilled. Your subscription (if any) will be
          cancelled immediately with no further charges.
        </Text>

        <View style={styles.confirmBlock}>
          <Text style={styles.confirmLabel}>Type DELETE to confirm</Text>
          <TextInput
            value={confirmText}
            onChangeText={setConfirmText}
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
          />
        </View>

        <PrimaryButton
          label="Delete my account"
          onPress={handleDeletePress}
          disabled={!canDelete}
          loading={deleting}
          fullWidth
          style={[
            styles.deleteButton,
            !canDelete && !deleting && styles.deleteButtonDisabled,
          ]}
          labelStyle={styles.deleteLabel}
        />

        <PrimaryButton
          label="Keep my account"
          variant="outlined"
          onPress={() => router.back()}
          fullWidth
          style={styles.keepButton}
          labelStyle={styles.keepLabel}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  scroll: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: tokens.spacing.xxl,
  },
  headline: {
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.xxl,
    color: tokens.colors.text,
    textAlign: 'center',
    marginTop: tokens.spacing.lg,
  },
  body: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.md,
    lineHeight: 22,
  },
  list: {
    marginTop: tokens.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.sm,
  },
  rowLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
    marginLeft: tokens.spacing.md,
    flex: 1,
  },
  note: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.lg,
    lineHeight: 20,
  },
  confirmBlock: {
    marginTop: tokens.spacing.xl,
  },
  confirmLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.text,
  },
  input: {
    marginTop: tokens.spacing.sm,
    height: 48,
    borderWidth: 1,
    borderColor: tokens.colors.danger + '80',
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  deleteButton: {
    marginTop: tokens.spacing.xl,
    backgroundColor: tokens.colors.danger,
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteLabel: {
    fontFamily: tokens.fonts.sansBold,
    color: tokens.colors.white,
  },
  keepButton: {
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.xxxl,
  },
  keepLabel: {
    fontFamily: tokens.fonts.sans,
    color: tokens.colors.primary,
  },
});
