import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export class UploadError extends Error {}

/**
 * Uploads a file and returns its download URL.
 *
 * Object keys are `{folder}/{uid}/{uuid}-{safeName}`. The old code used the raw
 * client filename (`{folder}/{uid}/{file.name}`), so two uploads named IMG_0001.jpg
 * — which phones produce constantly — silently overwrote each other, and every
 * older diagnóstico holding that URL started showing the newer patient's photo.
 *
 * Progress is reported for real; the old handlers passed an empty callback and
 * showed nothing, then `alert()`-ed on failure.
 */
export async function uploadFile(args: {
  folder: string;
  uid: string;
  file: File;
  accept: readonly string[];
  onProgress?: (percent: number) => void;
}): Promise<string> {
  const { folder, uid, file, accept, onProgress } = args;

  if (!accept.includes(file.type)) {
    throw new UploadError("Formato de archivo no admitido.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("El archivo supera el límite de 10 MB.");
  }

  const safeName = file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(-60);
  const key = `${folder}/${uid}/${crypto.randomUUID()}-${safeName}`;

  const task = uploadBytesResumable(ref(storage, key), file, {
    contentType: file.type,
  });

  return new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          onProgress?.(
            Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
          );
        }
      },
      (error) => reject(new UploadError(error.message)),
      () => {
        getDownloadURL(task.snapshot.ref).then(resolve).catch(reject);
      },
    );
  });
}

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const PDF_TYPES = ["application/pdf"] as const;
