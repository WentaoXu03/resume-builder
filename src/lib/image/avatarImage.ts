export const AVATAR_ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const AVATAR_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const AVATAR_CROP_ASPECT_RATIO = 3 / 4;
export const AVATAR_OUTPUT_WIDTH = 900;
export const AVATAR_OUTPUT_HEIGHT = 1200;

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ACCEPTED_MIME_TYPES.includes(file.type as (typeof AVATAR_ACCEPTED_MIME_TYPES)[number])) {
    return "avatar.invalidType";
  }

  if (file.size > AVATAR_MAX_FILE_SIZE_BYTES) {
    return "avatar.fileTooLarge";
  }

  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("FileReader did not return a data URL."));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = dataUrl;
  });
}
