import { supabase } from './supabaseClient';

const BUCKET = 'site-images';
const MAX_SIDE = 1800; // longest edge, in pixels
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

// Phone photos are often 5-10 MB. Scale big pictures down before uploading so
// pages stay fast. Logos with a transparent background stay PNG. GIF and SVG
// are uploaded exactly as chosen.
async function shrink(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // shrinking is a nicety — fall back to the original
  }
}

// Uploads a picture and returns its public web address.
// Throws an Error whose message is safe to show to the person using the editor.
export async function uploadSiteImage(file, name) {
  const extension = EXTENSIONS[file.type];
  if (!extension) throw new Error('Please choose a picture file (JPG, PNG, WebP, GIF or SVG).');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('That picture is too large — please choose one under 15 MB.');

  const body = await shrink(file);
  const safeName = name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const path = `${safeName}-${Date.now()}.${EXTENSIONS[body.type] || extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: body.type || file.type,
    cacheControl: '31536000',
  });
  if (error) throw new Error('The upload did not work. Please check your connection and try again.');

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
