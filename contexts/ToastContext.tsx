import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Animated,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const TOAST_DURATION = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [fadeAnim, translateY]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const id = Date.now().toString();
      setToast({ id, message, type });

      fadeAnim.setValue(0);
      translateY.setValue(-20);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(hideToast, TOAST_DURATION);
    },
    [fadeAnim, translateY, hideToast]
  );

  const showSuccess = useCallback(
    (message: string) => showToast(message, 'success'),
    [showToast]
  );

  const showError = useCallback(
    (message: string) => showToast(message, 'error'),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => showToast(message, 'info'),
    [showToast]
  );

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return Colors[colorScheme].success;
      case 'error':
        return Colors[colorScheme].error;
      case 'info':
      default:
        return Colors[colorScheme].tint;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: insets.top + (Platform.OS === 'android' ? 10 : 0),
              opacity: fadeAnim,
              transform: [{ translateY }],
              backgroundColor: getBackgroundColor(toast.type),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.toastContent}
            onPress={hideToast}
            activeOpacity={0.9}
          >
            <Text style={styles.toastText}>{toast.message}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  toastContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
