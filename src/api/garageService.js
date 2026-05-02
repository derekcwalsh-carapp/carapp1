import * as FileSystem from 'expo-file-system/legacy';
import client from './client.js';

function normalizeYear(year) {
  if (year === undefined || year === null) return year;
  return typeof year === 'string' ? Number.parseInt(year, 10) : year;
}

export async function fetchVehicles() {
  const { data } = await client.get('/v1/garage/vehicles');
  return data?.data ?? [];
}

export async function addVehicle(vehicle) {
  const body = {
    year: normalizeYear(vehicle.year),
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim ?? null,
    engine: vehicle.engine ?? null,
    transmission: vehicle.transmission ?? null,
    modsNotes: vehicle.modsNotes ?? null,
    ...(vehicle.imageUri != null && { imageUri: vehicle.imageUri }),
  };
  const { data } = await client.post('/v1/garage/vehicles', body);
  return data?.data;
}

export async function updateVehicle(id, fields) {
  const body = {};
  if (typeof fields.year !== 'undefined') body.year = normalizeYear(fields.year);
  if (typeof fields.make !== 'undefined') body.make = fields.make;
  if (typeof fields.model !== 'undefined') body.model = fields.model;
  if (typeof fields.trim !== 'undefined') body.trim = fields.trim;
  if (typeof fields.engine !== 'undefined') body.engine = fields.engine;
  if (typeof fields.transmission !== 'undefined') body.transmission = fields.transmission;
  if (typeof fields.modsNotes !== 'undefined') body.modsNotes = fields.modsNotes;
  if (typeof fields.imageUri !== 'undefined') body.imageUri = fields.imageUri;

  const { data } = await client.put(`/v1/garage/vehicles/${id}`, body);
  return data?.data;
}

export async function deleteVehicle(id) {
  await client.delete(`/v1/garage/vehicles/${id}`);
}

export async function setActiveVehicle(id) {
  const { data } = await client.patch(`/v1/garage/vehicles/${id}/active`);
  return data?.data;
}

export async function getImageUploadUrl(vehicleId, contentType = 'image/jpeg') {
  const { data } = await client.post(`/v1/garage/vehicles/${vehicleId}/image/upload`, {
    contentType,
  });
  const d = data?.data ?? {};
  return {
    uploadUrl: d.uploadUrl,
    imageUri: d.imageUri,
    expiresAt: d.expiresAt,
    maxSizeBytes: d.maxSizeBytes,
    allowedContentTypes: d.allowedContentTypes,
  };
}

/**
 * PUT a local file URI to a presigned S3 URL (or dev-uploads endpoint).
 * Uses expo-file-system legacy uploadAsync for stable binary uploads in Expo SDK 54.
 */
export async function uploadVehicleImage(uploadUrl, fileUri, contentType = 'image/jpeg') {
  const binaryUploadType = FileSystem.FileSystemUploadType?.BINARY_CONTENT ?? 'binaryContent';
  const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: 'PUT',
    uploadType: binaryUploadType,
    headers: { 'Content-Type': contentType },
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed (${result.status})`);
  }
}
