import client from './client.js';

export async function fetchProfile() {
  const { data } = await client.get('/v1/me');
  return data?.data;
}

export async function updateProfile(fields) {
  const { data } = await client.patch('/v1/me', fields);
  return data?.data;
}

export async function getAvatarUploadUrl(contentType = 'image/jpeg') {
  const { data } = await client.post('/v1/me/avatar/upload', { contentType });
  return data?.data;
}

export async function deleteAccount() {
  await client.delete('/v1/auth/account');
}
