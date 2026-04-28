import { create } from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import useGarageStore from './garageStore';

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
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUri: u.avatarUri ?? u.avatar_uri ?? null,
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
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    const { registerPushToken } = await import('../api/notificationService.js');
    await registerPushToken(token, 'expo');
  } catch (e) {
    console.warn('[CarLens] Could not register push token:', e?.message ?? e);
  }
}

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  pendingEmail: null,

  /** Used by api/client refresh interceptor */
  setTokens: async (accessToken, refreshToken) => {
    const user = get().user;
    set({ token: accessToken, refreshToken });
    await persistAuth({ user, token: accessToken, refreshToken });
  },

  clearSession: async () => {
    useGarageStore.setState({
      vehicles: [],
      activeVehicleId: null,
      status: 'idle',
      error: null,
    });
    set({ user: null, token: null, refreshToken: null, pendingEmail: null });
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
    const payload = data?.data;
    const user = mapUser(payload.user);
    const token = payload.accessToken;
    const refreshToken = payload.refreshToken;
    set({ user, token, refreshToken });
    await persistAuth({ user, token, refreshToken });
    void registerExpoPushToken();
  },

  sendMagicLink: async (email) => {
    const trimmed = email.trim();
    const { data } = await apiRequest({
      method: 'POST',
      url: '/v1/auth/magic-link',
      data: { email: trimmed },
    });
    const payload = data?.data || {};
    set({ pendingEmail: trimmed });
    return {
      message: payload.message || 'Check your email for a sign-in link.',
      devToken: payload.devToken,
    };
  },

  verifyMagicLink: async (token) => {
    const { data } = await apiRequest({
      method: 'GET',
      url: '/v1/auth/magic-link/verify',
      params: { token },
    });
    const payload = data?.data || {};
    const user = mapUser(payload.user);
    const accessToken = payload.accessToken;
    const refreshToken = payload.refreshToken;
    set({ user, token: accessToken, refreshToken, pendingEmail: null });
    await persistAuth({ user, token: accessToken, refreshToken });
    void registerExpoPushToken();
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
    useGarageStore.setState({
      vehicles: [],
      activeVehicleId: null,
      status: 'idle',
      error: null,
    });
    set({ user: null, token: null, refreshToken: null, pendingEmail: null });
    await AsyncStorage.multiRemove([AUTH_KEY, REFRESH_KEY]);
  },

  updateProfile: async (fields) => {
    const { token, user } = get();
    if (!token || !user) return;
    const body = {};
    if (typeof fields.name !== 'undefined') body.name = fields.name;
    if (typeof fields.avatarUri !== 'undefined') body.avatarUri = fields.avatarUri;

    const { data } = await apiRequest({
      method: 'PATCH',
      url: '/v1/me',
      data: body,
      headers: { Authorization: `Bearer ${token}` },
    });
    const nextUser = mapUser(data?.data);
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
    useGarageStore.setState({
      vehicles: [],
      activeVehicleId: null,
      status: 'idle',
      error: null,
    });
    set({ user: null, token: null, refreshToken: null, pendingEmail: null });
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
        set({ user, token, refreshToken });
        if (refreshToken) {
          await AsyncStorage.setItem(REFRESH_KEY, refreshToken);
        }
      }
    } catch (_) {}
  },

  /**
   * @deprecated Use signInWithApple / signInWithGoogle / email flow
   */
  signIn: async (provider) => {
    console.warn(
      '[authStore] signIn(provider) is deprecated; use signInWithApple, signInWithGoogle, or sendMagicLink.'
    );
    if (provider === 'apple') {
      throw new Error('Use signInWithApple(identityToken) with expo-apple-authentication');
    }
    if (provider === 'google') {
      throw new Error('Google sign-in is not wired yet');
    }
    if (provider === 'email') {
      throw new Error('Use navigation to /email-signin');
    }
  },
}));

export default useAuthStore;
