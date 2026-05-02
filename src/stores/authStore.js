import { create } from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import useGarageStore from './garageStore';

async function clearSensitiveStoresAsync() {
  const { clearSensitiveStores } = await import('./sessionCleanup.js');
  clearSensitiveStores();
}

const AUTH_KEY = '@carlens/auth';
const REFRESH_KEY = '@carlens/refresh';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

/** Plain axios — avoids circular import with api/client.js */
function apiRequest(config) {
  const { headers, ...rest } = config;
  return axios({
    baseURL: API_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json', ...headers },
    ...rest,
  });
}

function mapUser(u) {
  if (!u) return null;
  const rawAvatar = u.avatarUri ?? u.avatar_uri ?? null;
  const normalizedAvatar =
    typeof rawAvatar === 'string' && rawAvatar.trim().length === 0
      ? null
      : rawAvatar;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUri: normalizedAvatar,
    avatarFallbackUri:
      typeof u.avatarFallbackUri === 'string' && u.avatarFallbackUri.trim().length > 0
        ? u.avatarFallbackUri
        : null,
  };
}

function mergeUserKeepingAvatar(previousUser, incomingUser) {
  if (!incomingUser) return previousUser ?? null;
  if (!previousUser) return incomingUser;
  const hasIncomingAvatar =
    typeof incomingUser.avatarUri === 'string' && incomingUser.avatarUri.trim().length > 0;
  return {
    ...previousUser,
    ...incomingUser,
    avatarUri: hasIncomingAvatar ? incomingUser.avatarUri : previousUser.avatarUri ?? null,
  };
}

async function persistAuth({ user, token, refreshToken }) {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, token, refreshToken }));
  if (refreshToken) {
    await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

async function registerExpoPushToken() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    const finalStatus =
      existing !== 'granted'
        ? (await Notifications.requestPermissionsAsync()).status
        : existing;
    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const { registerPushToken } = await import('../api/notificationService.js');
    await registerPushToken(tokenData.data, 'expo');
  } catch (e) {
    console.warn('[CarLens] Could not register push token:', e?.message ?? e);
  }
}

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,

  /** Used by api/client refresh interceptor */
  setTokens: async (accessToken, refreshToken) => {
    const user = get().user;
    set({ token: accessToken, refreshToken });
    await persistAuth({ user, token: accessToken, refreshToken });
  },

  clearSession: async () => {
    await clearSensitiveStoresAsync();
    useGarageStore.setState({
      vehicles: [],
      activeVehicleId: null,
      status: 'idle',
      error: null,
    });
    set({ user: null, token: null, refreshToken: null });
    await AsyncStorage.multiRemove([AUTH_KEY, REFRESH_KEY]);
    router.replace('/sign-in');
  },

  signInWithApple: async (identityToken) => {
    if (!identityToken) throw new Error('Missing Apple identity token');
    const { data } = await apiRequest({
      method: 'POST',
      url: '/v1/auth/signin',
      data: { provider: 'apple', idToken: identityToken },
    });
    await clearSensitiveStoresAsync();
    const payload = data?.data;
    const user = mapUser(payload.user);
    const token = payload.accessToken;
    const refreshToken = payload.refreshToken;
    set({ user, token, refreshToken });
    await persistAuth({ user, token, refreshToken });
    void registerExpoPushToken();
  },

  signInWithGoogle: async (idToken) => {
    const { data } = await apiRequest({
      method: 'POST',
      url: '/v1/auth/signin',
      data: { provider: 'google', idToken },
    });
    await clearSensitiveStoresAsync();
    const payload = data?.data;
    const user = mapUser(payload.user);
    const token = payload.accessToken;
    const refreshToken = payload.refreshToken;
    set({ user, token, refreshToken });
    await persistAuth({ user, token, refreshToken });
    void registerExpoPushToken();
  },

  signInWithEmail: async (email, password) => {
    const { data } = await apiRequest({
      method: 'POST',
      url: '/v1/auth/email/signin',
      data: { email: email.trim(), password },
    });
    await clearSensitiveStoresAsync();
    const payload = data?.data;
    const user = mapUser(payload.user);
    const token = payload.accessToken;
    const refreshToken = payload.refreshToken;
    set({ user, token, refreshToken });
    await persistAuth({ user, token, refreshToken });
    void registerExpoPushToken();
  },

  signUpWithEmail: async (email, password) => {
    const { data } = await apiRequest({
      method: 'POST',
      url: '/v1/auth/email/signup',
      data: { email: email.trim(), password },
    });
    const result = data?.data;
    if (!result?.pendingToken) {
      throw new Error('Sign up service unavailable. Please try again.');
    }
    return result;
  },

  verifySignupOtp: async (pendingToken, otp) => {
    const { data } = await apiRequest({
      method: 'POST',
      url: '/v1/auth/email/signup/verify',
      data: { pendingToken, otp },
    });
    await clearSensitiveStoresAsync();
    const payload = data?.data;
    const user = mapUser(payload.user);
    const token = payload.accessToken;
    const refreshToken = payload.refreshToken;
    set({ user, token, refreshToken });
    await persistAuth({ user, token, refreshToken });
    void registerExpoPushToken();
  },

  resendSignupOtp: async (pendingToken) => {
    const { data } = await apiRequest({
      method: 'POST',
      url: '/v1/auth/email/signup/resend',
      data: { pendingToken },
    });
    return data?.data;
  },

  forgotPassword: async (email) => {
    const { data } = await apiRequest({
      method: 'POST',
      url: '/v1/auth/forgot-password',
      data: { email: email.trim() },
    });
    return data?.data || {};
  },

  resetPassword: async (token, password) => {
    await apiRequest({
      method: 'POST',
      url: '/v1/auth/reset-password',
      data: { token, password },
    });
  },

  signOut: async () => {
    const { token, refreshToken } = get();
    try {
      await apiRequest({
        method: 'POST',
        url: '/v1/auth/signout',
        data: { refreshToken: refreshToken || undefined },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (_) {
      /* still clear locally */
    }
    await clearSensitiveStoresAsync();
    useGarageStore.setState({
      vehicles: [],
      activeVehicleId: null,
      status: 'idle',
      error: null,
    });
    set({ user: null, token: null, refreshToken: null });
    await AsyncStorage.multiRemove([AUTH_KEY, REFRESH_KEY]);
  },

  refreshProfile: async () => {
    const { token, user: currentUser } = get();
    if (!token) return;
    try {
      const { data } = await apiRequest({
        method: 'GET',
        url: '/v1/me',
        headers: { Authorization: `Bearer ${token}` },
      });
      const nextUser = mergeUserKeepingAvatar(currentUser, mapUser(data?.data));
      if (!nextUser) return;
      const refreshToken = get().refreshToken;
      set({ user: nextUser });
      await persistAuth({ user: nextUser, token, refreshToken });
    } catch (_) {}
  },

  updateProfile: async (fields) => {
    const { token, user } = get();
    if (!token || !user) return;
    const body = {};
    if (typeof fields.name !== 'undefined') body.name = fields.name;
    if (fields.avatarUri != null) body.avatarUri = fields.avatarUri;

    const { data } = await apiRequest({
      method: 'PATCH',
      url: '/v1/me',
      data: body,
      headers: { Authorization: `Bearer ${token}` },
    });
    const nextUser = mergeUserKeepingAvatar(user, mapUser(data?.data));
    const refreshToken = get().refreshToken;
    set({ user: nextUser });
    await persistAuth({ user: nextUser, token, refreshToken });
  },

  deleteAccount: async () => {
    const { token } = get();
    if (token) {
      await apiRequest({
        method: 'DELETE',
        url: '/v1/auth/account',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    await clearSensitiveStoresAsync();
    useGarageStore.setState({
      vehicles: [],
      activeVehicleId: null,
      status: 'idle',
      error: null,
    });
    set({ user: null, token: null, refreshToken: null });
    await AsyncStorage.multiRemove([AUTH_KEY, REFRESH_KEY]);
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const user = mapUser(parsed.user);
        const token = parsed.token ?? null;
        const refreshToken = parsed.refreshToken ?? null;
        await clearSensitiveStoresAsync();
        set({ user, token, refreshToken });
        if (refreshToken) {
          await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
        }
      } else {
        await clearSensitiveStoresAsync();
      }
    } catch (_) {}
  },

}));

export default useAuthStore;
