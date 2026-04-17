import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import useCaptureStore from '../src/stores/captureStore';
import tokens from '../src/theme/tokens';
import PrimaryButton from '../src/components/PrimaryButton';

const CORNER = 16;
const MIN_SIZE = 60;

export default function CropScreen() {
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();
  const photoUri = useCaptureStore((s) => s.photoUri);
  const setPhoto = useCaptureStore((s) => s.setPhoto);
  const reset = useCaptureStore((s) => s.reset);

  const containerRef = useRef({ width: 0, height: 0 });
  const frameRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const startRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [frame, setFrame] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });

  // Keep ref and state in sync; ref is used inside stable PanResponder closures
  const update = (f) => {
    frameRef.current = f;
    setFrame({ ...f });
  };

  const initFrame = (c) => {
    const size = c.width * 0.7;
    const f = {
      x: (c.width - size) / 2,
      y: (c.height - size) / 2,
      width: size,
      height: size,
    };
    update(f);
    setReady(true);
  };

  useEffect(() => {
    if (photoUri) Image.getSize(photoUri, (w, h) => setImageSize({ width: w, height: h }));
  }, [photoUri]);

  const onLayout = useCallback((e) => {
    const { width, height } = e.nativeEvent.layout;
    containerRef.current = { width, height };
    if (!ready) initFrame({ width, height });
  }, [ready]);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Move the whole crop frame
  const dragPan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { startRef.current = { ...frameRef.current }; },
    onPanResponderMove: (_, { dx, dy }) => {
      const { x, y, width, height } = startRef.current;
      const c = containerRef.current;
      update({
        x: clamp(x + dx, 0, c.width - width),
        y: clamp(y + dy, 0, c.height - height),
        width,
        height,
      });
    },
  }), []);

  // Resize from a specific corner
  const makeCorner = (corner) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { startRef.current = { ...frameRef.current }; },
    onPanResponderMove: (_, { dx, dy }) => {
      const { x, y, width, height } = startRef.current;
      const c = containerRef.current;
      let nx = x, ny = y, nw = width, nh = height;

      if (corner === 'tl') {
        nw = Math.max(MIN_SIZE, width - dx);
        nx = clamp(x + (width - nw), 0, x + width - MIN_SIZE);
        nh = Math.max(MIN_SIZE, height - dy);
        ny = clamp(y + (height - nh), 0, y + height - MIN_SIZE);
      } else if (corner === 'tr') {
        nw = clamp(width + dx, MIN_SIZE, c.width - x);
        nh = Math.max(MIN_SIZE, height - dy);
        ny = clamp(y + (height - nh), 0, y + height - MIN_SIZE);
      } else if (corner === 'bl') {
        nw = Math.max(MIN_SIZE, width - dx);
        nx = clamp(x + (width - nw), 0, x + width - MIN_SIZE);
        nh = clamp(height + dy, MIN_SIZE, c.height - y);
      } else {
        nw = clamp(width + dx, MIN_SIZE, c.width - x);
        nh = clamp(height + dy, MIN_SIZE, c.height - y);
      }

      update({ x: nx, y: ny, width: nw, height: nh });
    },
  });

  // Stable corner responders — deps [] is intentional; refs stay current
  const tlPan = useMemo(() => makeCorner('tl'), []);
  const trPan = useMemo(() => makeCorner('tr'), []);
  const blPan = useMemo(() => makeCorner('bl'), []);
  const brPan = useMemo(() => makeCorner('br'), []);

  const handleReset = () => initFrame(containerRef.current);

  const handleIdentify = async () => {
    if (!photoUri) return;

    if (ready) {
      const c = containerRef.current;
      // Compute how the image is rendered inside the container (resizeMode: contain)
      const scale = Math.min(c.width / imageSize.width, c.height / imageSize.height);
      const renderedW = imageSize.width * scale;
      const renderedH = imageSize.height * scale;
      const offsetX = (c.width - renderedW) / 2;
      const offsetY = (c.height - renderedH) / 2;
      const f = frameRef.current;
      const imgX = Math.round(Math.max(0, (f.x - offsetX) / scale));
      const imgY = Math.round(Math.max(0, (f.y - offsetY) / scale));
      const imgW = Math.round(Math.min(imageSize.width - imgX, f.width / scale));
      const imgH = Math.round(Math.min(imageSize.height - imgY, f.height / scale));

      try {
        const { uri } = await manipulateAsync(
          photoUri,
          [{ crop: { originX: imgX, originY: imgY, width: imgW, height: imgH } }],
          { compress: 0.9, format: SaveFormat.JPEG },
        );
        setPhoto(uri);
      } catch {
        // If crop coords land outside image bounds, proceed with original
      }
    }

    router.replace('/identifying');
  };

  const containerW = screenW * 0.9;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color={tokens.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adjust</Text>
        <TouchableOpacity
          onPress={handleReset}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.resetLabel}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Photo + crop overlay */}
      <View style={styles.imageWrapper}>
        <View
          style={{ width: containerW, aspectRatio: 1 }}
          onLayout={onLayout}
        >
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
            />
          )}

          {ready && (
            <View
              style={[
                styles.cropFrame,
                { left: frame.x, top: frame.y, width: frame.width, height: frame.height },
              ]}
              {...dragPan.panHandlers}
            >
              <View style={[styles.corner, styles.cornerTL]} {...tlPan.panHandlers} />
              <View style={[styles.corner, styles.cornerTR]} {...trPan.panHandlers} />
              <View style={[styles.corner, styles.cornerBL]} {...blPan.panHandlers} />
              <View style={[styles.corner, styles.cornerBR]} {...brPan.panHandlers} />
            </View>
          )}
        </View>
      </View>

      <Text style={styles.helper}>Drag to frame just the part — this helps our AI.</Text>

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <PrimaryButton
          label="Retake"
          variant="outlined"
          style={styles.retakeBtn}
          labelStyle={styles.retakeLabel}
          onPress={() => { reset(); router.replace('/camera'); }}
        />
        <PrimaryButton
          label="Identify"
          variant="filled"
          style={styles.identifyBtn}
          labelStyle={styles.identifyLabel}
          onPress={handleIdentify}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
  },
  headerTitle: {
    fontFamily: tokens.fonts.serif,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.white,
  },
  resetLabel: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.white,
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: tokens.colors.primary,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    backgroundColor: tokens.colors.primary,
  },
  cornerTL: { top: -(CORNER / 2), left: -(CORNER / 2) },
  cornerTR: { top: -(CORNER / 2), right: -(CORNER / 2) },
  cornerBL: { bottom: -(CORNER / 2), left: -(CORNER / 2) },
  cornerBR: { bottom: -(CORNER / 2), right: -(CORNER / 2) },
  helper: {
    fontFamily: tokens.fonts.sans,
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.white,
    textAlign: 'center',
    marginTop: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.xl,
  },
  retakeBtn: {
    flex: 1,
    borderColor: tokens.colors.white,
  },
  retakeLabel: {
    color: tokens.colors.white,
  },
  identifyBtn: {
    flex: 1,
  },
  identifyLabel: {
    fontFamily: tokens.fonts.serifItalic,
  },
});
