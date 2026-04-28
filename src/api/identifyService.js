import client from './client.js';

export async function requestUploadUrl(contentType, vehicleId) {
  const res = await client.post('/v1/identify/upload', { contentType, vehicleId });
  return res.data.data;
}

export async function uploadPhotoToS3(uploadUrl, localFileUri, contentType = 'image/jpeg') {
  const response = await fetch(localFileUri);
  const blob = await response.blob();
  const putResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!putResponse.ok) throw new Error('Photo upload to S3 failed');
}

export async function startIdentification(sessionId, crop) {
  const body = { sessionId };
  if (crop != null) {
    body.crop = crop;
  }
  const res = await client.post('/v1/identify', body);
  return res.data.data;
}

export async function pollIdentificationResult(sessionId) {
  const res = await client.get(`/v1/identify/${sessionId}`);
  return res.data.data;
}

export async function identifyPart(photoUri, vehicle, crop) {
  const { sessionId, uploadUrl } = await requestUploadUrl('image/jpeg', vehicle?.id);
  await uploadPhotoToS3(uploadUrl, photoUri, 'image/jpeg');
  await startIdentification(sessionId, crop ?? null);

  let attempts = 0;
  while (attempts < 30) {
    await new Promise((r) => setTimeout(r, 2000));
    const result = await pollIdentificationResult(sessionId);
    if (result.status === 'success' || result.status === 'error') {
      if (result.status === 'error') {
        throw new Error(result.errorCode || 'Identification failed');
      }
      return { ...result, sessionId };
    }
    attempts += 1;
  }
  throw new Error('Identification timed out');
}
