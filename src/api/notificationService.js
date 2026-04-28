import client from './client.js';

export const fetchNotificationPreferences = () =>
  client.get('/v1/notifications/preferences').then((r) => r.data.data);

export const updateNotificationPreference = (key, value) =>
  client
    .put('/v1/notifications/preferences', { [key]: value })
    .then((r) => r.data.data);

export const registerPushToken = (token, deviceId) =>
  client
    .post('/v1/notifications/push-token', { token, deviceId })
    .then((r) => r.data.data);
