import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import tokens from '../src/theme/tokens';
import useCaptureStore from '../src/stores/captureStore';

function CornerBracket({ top, bottom, left, right }) {
  const hStyle = {
    position: 'absolute',
    top,
    bottom,
    left,
    right,
    width: 30,
    height: 3,
    backgroundColor: tokens.colors.primary,
  };
  const vStyle = {
    position: 'absolute',
    top,
    bottom,
    left,
    right,
    width: 3,
    height: 30,
    backgroundColor: tokens.colors.primary,
  };
  return (
    <>
      <View style={hStyle} />
      <View style={vStyle} />
    </>
  );
}

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [capturing, setCapturing] = useState(false);
  const setPhoto = useCaptureStore((s) => s.setPhoto);

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.deniedContainer}>
        <StatusBar style="light" />
        <Text style={styles.deniedText}>
          Camera access is required to identify parts
        </Text>
        <Pressable style={styles.settingsButton} onPress={Linking.openSettings}>
          <Text style={styles.settingsButtonText}>Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  const toggleFlash = () =>
    setFlashMode((m) => (m === 'off' ? 'on' : 'off'));

  const toggleFacing = () =>
    setFacing((f) => (f === 'back' ? 'front' : 'back'));

  const handleCapture = async () => {
    if (capturing || !cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri);
      router.replace('/crop');
    } finally {
      setCapturing(false);
    }
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
      router.replace('/crop');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flashMode}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.topBarBtn}>
          <Feather name="x" size={24} color={tokens.colors.white} />
        </Pressable>
        <Pressable onPress={toggleFlash} hitSlop={12} style={styles.topBarBtn}>
          <Feather
            name="zap"
            size={22}
            color={flashMode === 'on' ? tokens.colors.gold : tokens.colors.white}
          />
        </Pressable>
      </View>

      {/* Framing guide */}
      <View style={styles.framingGuide} pointerEvents="none">
        <CornerBracket top={0} left={0} />
        <CornerBracket top={0} right={0} />
        <CornerBracket bottom={0} left={0} />
        <CornerBracket bottom={0} right={0} />
      </View>

      {/* Bottom section: hint + controls */}
      <View style={styles.bottomSection}>
        <Text style={styles.hintText}>
          Fill the frame with the part · good lighting helps
        </Text>

        <View style={styles.bottomRow}>
          {/* Gallery */}
          <View style={styles.galleryWrapper}>
            <Pressable style={styles.galleryThumb} onPress={handleGallery}>
              <Feather name="image" size={20} color={tokens.colors.white} />
            </Pressable>
            <Text style={styles.galleryLabel}>Gallery</Text>
          </View>

          {/* Shutter */}
          <Pressable
            style={[styles.shutterOuter, capturing && styles.shutterDisabled]}
            onPress={handleCapture}
            disabled={capturing}
          >
            <View style={styles.shutterInner} />
          </Pressable>

          {/* Flip */}
          <Pressable style={styles.flipBtn} onPress={toggleFacing} hitSlop={12}>
            <Feather name="repeat" size={24} color={tokens.colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.black,
  },
  deniedContainer: {
    flex: 1,
    backgroundColor: tokens.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.xxl,
    gap: tokens.spacing.lg,
  },
  deniedText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.white,
    textAlign: 'center',
    lineHeight: tokens.fontSize.md * 1.5,
  },
  settingsButton: {
    borderWidth: 1,
    borderColor: tokens.colors.white,
    borderRadius: tokens.radius.pill,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xl,
  },
  settingsButtonText: {
    fontFamily: tokens.fonts.sansMedium,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.white,
  },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  topBarBtn: {
    padding: tokens.spacing.xs,
  },

  framingGuide: {
    position: 'absolute',
    width: 260,
    height: 260,
    top: '50%',
    left: '50%',
    marginTop: -130,
    marginLeft: -130,
  },

  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: tokens.spacing.xxxl,
    paddingHorizontal: tokens.spacing.xl,
    alignItems: 'center',
    gap: tokens.spacing.xl,
  },
  hintText: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.white,
    textAlign: 'center',
    opacity: 0.85,
  },

  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  galleryWrapper: {
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  galleryThumb: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.xs,
    color: tokens.colors.white,
    opacity: 0.8,
  },

  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: tokens.colors.white,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.colors.white,
  },

  flipBtn: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
