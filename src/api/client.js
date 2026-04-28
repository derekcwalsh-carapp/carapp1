import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import useAuthStore from '../stores/authStore';

const REFRESH_KEY = '@carlens/refresh';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function shouldSkipAuthRefresh(url) {
  if (!url) return false;
  return (
    url.includes('/auth/refresh') ||
    url.includes('/auth/signin') ||
    url.includes('/auth/magic-link')
  );
}

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const reqUrl = originalRequest?.url || '';

    if (!error.response) {
      router.push('/offline');
      return Promise.reject(error);
    }

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (!originalRequest || shouldSkipAuthRefresh(reqUrl)) {
      return Promise.reject(error);
    }

    if (reqUrl.includes('/auth/refresh')) {
      await useAuthStore.getState().clearSession?.();
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          const next = { ...originalRequest };
          next._retry = true;
          next.headers = { ...next.headers, Authorization: `Bearer ${token}` };
          return client(next);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const baseURL = process.env.EXPO_PUBLIC_API_URL || '';
      const { data } = await axios.post(
        `${baseURL}/v1/auth/refresh`,
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      const accessToken = data?.data?.accessToken;
      const newRefresh = data?.data?.refreshToken;
      if (!accessToken || !newRefresh) {
        throw new Error('Invalid refresh response');
      }

      await useAuthStore.getState().setTokens?.(accessToken, newRefresh);

      processQueue(null, accessToken);

      const res = await client(originalRequest);
      return res;
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      await useAuthStore.getState().clearSession?.();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
