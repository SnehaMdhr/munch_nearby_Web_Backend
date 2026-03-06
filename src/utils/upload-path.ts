import fs from "fs";
import path from "path";

const projectRoot = path.resolve(__dirname, "../..");
export const uploadsDir = path.resolve(projectRoot, "uploads");

export const ensureUploadsDir = () => {
  fs.mkdirSync(uploadsDir, { recursive: true });
};

export const toUploadsPublicUrl = (filename: string) => `/uploads/${filename}`;

export const resolveUploadPath = (imageUrl?: string | null) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return null;
  }

  const normalizedPath = imageUrl.replace(/\\/g, "/").trim();

  if (!normalizedPath) {
    return null;
  }

  const maybeFileName = path.basename(normalizedPath);
  if (!maybeFileName || maybeFileName === "." || maybeFileName === "..") {
    return null;
  }

  return path.resolve(uploadsDir, maybeFileName);
};

export const deleteUploadIfExists = (imageUrl?: string | null) => {
  const absolutePath = resolveUploadPath(imageUrl);

  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return;
  }

  fs.unlinkSync(absolutePath);
};
