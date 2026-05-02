import { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import tokens from "../src/theme/tokens";
import { labelSans } from "../src/theme/typography";
import TopBar from "../src/components/TopBar";
import PrimaryButton from "../src/components/PrimaryButton";
import useAuthStore from "../src/stores/authStore";
import * as profileService from "../src/api/profileService";
import * as garageService from "../src/api/garageService";

/** Public URL stored in DB after PUT to presigned URL (CDN + S3 object key). */
function resolveAvatarPublicUri(uploadPayload) {
  if (
    uploadPayload?.s3ObjectUrl &&
    /^https?:\/\//i.test(uploadPayload.s3ObjectUrl)
  ) {
    return uploadPayload.s3ObjectUrl;
  }
  if (uploadPayload?.imageUri && /^https?:\/\//i.test(uploadPayload.imageUri)) {
    return uploadPayload.imageUri;
  }
  if (
    uploadPayload?.cloudFrontImageUri &&
    /^https?:\/\//i.test(uploadPayload.cloudFrontImageUri)
  ) {
    return uploadPayload.cloudFrontImageUri;
  }
  const key = uploadPayload?.key;
  const base = process.env.EXPO_PUBLIC_CLOUDFRONT_USER_URL?.replace(/\/$/, "");
  if (base && key) {
    return `${base}/${key}`;
  }
  // Avoid guessing a static avatar filename; stale or mismatched keys can fail to render.
  return null;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const originalName = user?.name ?? "";
  const originalAvatar = user?.avatarUri ?? null;

  const [name, setName] = useState(originalName);
  const [avatarUri, setAvatarUri] = useState(originalAvatar);
  const [pendingCanonicalUri, setPendingCanonicalUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const hasChanges =
    name.trim() !== originalName || pendingCanonicalUri !== null;
  const canSave =
    hasChanges && name.trim().length > 0 && !saving && !uploadingPhoto;

  async function handleChangePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;

    const asset = result.assets[0];
    const mime = asset.mimeType || "image/jpeg";
    const contentType = mime.includes("png") ? "image/png" : "image/jpeg";

    setUploadingPhoto(true);
    try {
      const uploadMeta = await profileService.getAvatarUploadUrl(contentType);
      await garageService.uploadVehicleImage(
        uploadMeta.uploadUrl,
        asset.uri,
        contentType,
      );

      const publicUri = resolveAvatarPublicUri(uploadMeta);
      if (!publicUri) {
        Alert.alert(
          "Photo upload unavailable",
          "Cloud storage is not configured in this environment. Your name and other changes can still be saved.",
        );
        return;
      }

      // Show local device file immediately — no network/CloudFront dependency.
      setAvatarUri(asset.uri);
      // Remember canonical URL to write to DB when the user taps Save.
      setPendingCanonicalUri(publicUri);
    } catch (e) {
      Alert.alert("Upload failed", e?.message || "Could not update photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const update = { name: name.trim() };
      if (pendingCanonicalUri) update.avatarUri = pendingCanonicalUri;
      await updateProfile(update);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar
        leftIcon={
          <Feather name="arrow-left" size={22} color={tokens.colors.text} />
        }
        onLeftPress={() => router.back()}
        titleNode={<Text style={styles.topTitle}>Edit Profile</Text>}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Feather name="user" size={40} color={tokens.colors.textMuted} />
            </View>
          )}
          <Pressable
            onPress={handleChangePhoto}
            hitSlop={8}
            disabled={uploadingPhoto}
          >
            <Text style={styles.changePhoto}>
              {uploadingPhoto ? "Uploading…" : "Change photo"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={tokens.colors.textMuted}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          <View style={styles.emailField}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={user?.email ?? ""}
              editable={false}
              style={[styles.input, styles.inputDisabled]}
            />
            <Text style={styles.emailNote}>
              Managed by your sign-in provider
            </Text>
          </View>
        </View>

        <PrimaryButton
          label="Save"
          onPress={handleSave}
          disabled={!canSave}
          loading={saving}
          fullWidth
          style={styles.saveButton}
          labelStyle={styles.saveLabel}
        />

        <View style={styles.divider} />

        <View style={styles.accountSection}>
          <Pressable
            style={styles.deleteRow}
            onPress={() => router.push("/delete-account")}
            hitSlop={8}
          >
            <Feather name="trash-2" size={20} color={tokens.colors.danger} />
            <Text style={styles.deleteLabel}>Delete account</Text>
          </Pressable>
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
  topTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: tokens.fonts.serifBold,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  scroll: {
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.xxxl,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: tokens.spacing.xxl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: tokens.colors.surface,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  changePhoto: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.primary,
    marginTop: tokens.spacing.sm,
  },
  form: {
    marginTop: tokens.spacing.xl,
  },
  label: {
    ...labelSans,
    fontSize: tokens.fontSize.xs,
    letterSpacing: 2,
    color: tokens.colors.textMuted,
  },
  input: {
    marginTop: tokens.spacing.xs,
    height: 48,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  inputDisabled: {
    backgroundColor: tokens.colors.surface,
    color: tokens.colors.textMuted,
  },
  emailField: {
    marginTop: tokens.spacing.lg,
  },
  emailNote: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.textMuted,
    marginTop: tokens.spacing.xs,
  },
  saveButton: {
    marginTop: tokens.spacing.xxl,
  },
  saveLabel: {
    fontFamily: tokens.fonts.serifItalic,
  },
  divider: {
    marginTop: tokens.spacing.xxxl,
    height: 1,
    backgroundColor: tokens.colors.border,
  },
  accountSection: {
    marginTop: tokens.spacing.lg,
  },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.danger,
    marginLeft: tokens.spacing.md,
  },
});
