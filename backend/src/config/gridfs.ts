import mongoose from 'mongoose';
import { Readable } from 'stream';

// Ambil GridFSBucket dari mongodb yang dipakai oleh mongoose (bukan install terpisah)
// Ini menghindari conflict type antar versi mongodb
const { GridFSBucket } = require('mongoose/node_modules/mongodb');

type GridFSBucketType = InstanceType<typeof GridFSBucket>;
let bucket: GridFSBucketType;

/**
 * Inisialisasi GridFS bucket.
 * Dipanggil sekali setelah koneksi Mongoose terbuka.
 */
export function initGridFS(): void {
  const db = (mongoose.connection as any).db;
  if (!db) throw new Error('MongoDB belum terkoneksi saat inisialisasi GridFS');
  bucket = new GridFSBucket(db, { bucketName: 'images' });
  console.log('✅ GridFS bucket "images" siap');
}

export function getBucket(): GridFSBucketType {
  if (!bucket) throw new Error('GridFS belum diinisialisasi. Panggil initGridFS() dulu.');
  return bucket;
}

/**
 * Upload buffer gambar ke GridFS.
 * @returns ObjectId string dari file yang tersimpan di MongoDB
 */
export async function uploadToGridFS(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const readable = Readable.from(buffer);
    const uploadStream = getBucket().openUploadStream(filename, {
      metadata: { contentType: mimeType },
    });

    readable.pipe(uploadStream);

    uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
    uploadStream.on('error', reject);
  });
}

/**
 * Download file dari GridFS sebagai Buffer.
 */
export async function downloadFromGridFS(
  fileId: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  // Gunakan ObjectId dari mongoose (bukan mongodb langsung) agar tidak conflict
  const _id = new mongoose.Types.ObjectId(fileId);

  // Ambil metadata untuk content-type
  const files: any[] = await getBucket().find({ _id: _id.toString() }).toArray();
  // GridFS internal pakai string atau ObjectId — coba keduanya
  const files2: any[] = files.length > 0 ? files : await getBucket().find({ _id }).toArray();
  const contentType = files2[0]?.metadata?.contentType || 'image/jpeg';

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    // openDownloadStream menerima ObjectId dari mongodb versi mongoose — cast as any
    const downloadStream = getBucket().openDownloadStream(_id as any);

    downloadStream.on('data', (chunk: Buffer) => chunks.push(chunk));
    downloadStream.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType }));
    downloadStream.on('error', reject);
  });
}

/**
 * Hapus file dari GridFS berdasarkan fileId (string ObjectId).
 * Aman dipanggil meski file sudah tidak ada.
 */
export async function deleteFromGridFS(fileId: string): Promise<void> {
  try {
    const _id = new mongoose.Types.ObjectId(fileId);
    await getBucket().delete(_id as any);
  } catch (err) {
    const msg = (err as Error).message || '';
    if (!msg.includes('File not found') && !msg.includes('not found')) {
      throw err;
    }
  }
}