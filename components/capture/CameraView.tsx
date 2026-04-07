import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface CameraViewProps {
  photoUri: string | null;
  onPhotoTaken: (uri: string) => void;
  onPhotoRemoved: () => void;
}

export function CameraView({
  photoUri,
  onPhotoTaken,
  onPhotoRemoved,
}: CameraViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const cameraRef = useRef<ExpoCameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onPhotoTaken(photo.uri);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPhotoRemoved();
  };

  const handlePickImage = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        onPhotoTaken(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  // Show photo preview if we have a photo
  if (photoUri) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.preview}
          onPress={() => setIsPhotoModalVisible(true)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: photoUri }} style={styles.previewImage} contentFit="cover" />
          <View style={styles.expandHint}>
            <IconSymbol name="arrow.up.left.and.arrow.down.right" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retakeButton, { backgroundColor: Colors[colorScheme].background }]}
          onPress={handleRetake}
          activeOpacity={0.7}
        >
          <IconSymbol name="arrow.counterclockwise" size={20} color={Colors[colorScheme].text} />
          <ThemedText style={styles.retakeText}>撮り直す</ThemedText>
        </TouchableOpacity>

        {/* Photo Modal */}
        <Modal
          visible={isPhotoModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsPhotoModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsPhotoModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Image
                source={{ uri: photoUri }}
                style={styles.modalPhoto}
                contentFit="contain"
              />
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsPhotoModalVisible(false)}
            >
              <IconSymbol name="xmark.circle.fill" size={32} color="#fff" />
            </TouchableOpacity>
          </Pressable>
        </Modal>
      </View>
    );
  }

  // Permission not determined yet
  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionContainer}>
          <IconSymbol name="camera.fill" size={48} color={Colors[colorScheme].icon} />
          <ThemedText style={styles.permissionText}>
            カメラへのアクセスを許可してください
          </ThemedText>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: Colors[colorScheme].tint }]}
            onPress={requestPermission}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.permissionButtonText}>はじめる</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <ExpoCameraView ref={cameraRef} style={styles.camera} facing="back" ratio="4:3">
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraButtons}>
            <TouchableOpacity
              style={styles.pickImageButton}
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <IconSymbol name="photo.fill" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.captureButton,
                isCapturing && styles.captureButtonDisabled,
              ]}
              onPress={handleTakePhoto}
              disabled={isCapturing}
              activeOpacity={0.7}
            >
              {isCapturing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
            <View style={styles.placeholderButton} />
          </View>
        </View>
      </ExpoCameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '85%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    alignSelf: 'center',
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
  },
  expandHint: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  modalPhoto: {
    flex: 1,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  cameraButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  pickImageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 44,
    height: 44,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  retakeButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  retakeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  permissionText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
