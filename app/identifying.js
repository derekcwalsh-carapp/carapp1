import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import tokens from '../src/theme/tokens';
import { titleSerifItalic, bodySans } from '../src/theme/typography';
import useCaptureStore from '../src/stores/captureStore';
import useGarageStore from '../src/stores/garageStore';
import useIdentifyStore from '../src/stores/identifyStore';

const RING_SIZE = 220;
const PHOTO_SIZE = 100;
const BAR_WIDTH = 200;
const PROGRESS_MAX = 180;
const PULSE_LOW = 160;

export default function IdentifyingScreen() {
  const router = useRouter();

  const photoUri = useCaptureStore((s) => s.photoUri);
  const crop = useCaptureStore((s) => s.crop);
  const vehicles = useGarageStore((s) => s.vehicles);
  const activeVehicleId = useGarageStore((s) => s.activeVehicleId);
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) ?? null;

  const status = useIdentifyStore((s) => s.status);
  const startIdentify = useIdentifyStore((s) => s.startIdentify);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef(null);

  useEffect(() => {
    if (!photoUri) return;
    startIdentify(photoUri, activeVehicle, crop);
  }, []);

  useEffect(() => {
    if (status === 'success') {
      const result = useIdentifyStore.getState().result;
      const needsClarify =
        result?.confidence != null &&
        result.confidence < 0.6 &&
        result?.clarifyQuestion;
      router.replace(needsClarify ? '/clarify' : '/result');
    }
    if (status === 'error') router.replace('/error-identify');
  }, [status]);

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spin.start();
    return () => spin.stop();
  }, []);

  useEffect(() => {
    progressAnim.setValue(0);
    const fill = Animated.timing(progressAnim, {
      toValue: PROGRESS_MAX,
      duration: 10000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    });
    fill.start(({ finished }) => {
      if (!finished) return;
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: PULSE_LOW,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: PROGRESS_MAX,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      );
      pulseLoopRef.current.start();
    });
    return () => {
      fill.stop();
      pulseLoopRef.current?.stop();
    };
  }, []);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const vehicleLine = activeVehicle
    ? `Checking against ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} · ${activeVehicle.trim}`
    : 'Checking your part';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.ringWrapper}>
          <View style={styles.ring} />
          <Animated.View style={[styles.ringArc, { transform: [{ rotate }] }]} />
          <View style={styles.photoContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]} />
            )}
          </View>
        </View>

        <Text style={styles.label}>Identifying…</Text>
        <Text style={styles.sub}>{vehicleLine}</Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressAnim }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 3,
    borderColor: tokens.colors.border,
  },
  ringArc: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: tokens.colors.primary,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  photoPlaceholder: {
    backgroundColor: tokens.colors.surface,
  },
  label: {
    ...titleSerifItalic,
    textAlign: 'center',
    marginTop: tokens.spacing.xl,
  },
  sub: {
    ...bodySans,
    color: tokens.colors.textMuted,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xl,
  },
  progressTrack: {
    width: BAR_WIDTH,
    height: 3,
    backgroundColor: tokens.colors.border,
    borderRadius: tokens.radius.pill,
    marginTop: tokens.spacing.xl,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.pill,
  },
});
