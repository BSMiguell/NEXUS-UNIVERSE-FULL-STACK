import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const assetsDir = path.resolve(process.cwd(), "assets");
const supportedExtensions = [".png", ".jpg", ".jpeg"];

async function findImageFiles(dir) {
  let imageFiles = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        imageFiles = imageFiles.concat(await findImageFiles(fullPath));
      } else if (
        supportedExtensions.includes(path.extname(entry.name).toLowerCase())
      ) {
        imageFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  return imageFiles;
}

async function convertImages() {
  console.log("Starting image conversion to WebP...");
  const imagePaths = await findImageFiles(assetsDir);

  if (imagePaths.length === 0) {
    console.log("No images found to convert.");
    return;
  }

  console.log(`Found ${imagePaths.length} images to process.`);

  const conversionPromises = imagePaths.map(async (imgPath) => {
    const webpPath = imgPath.replace(/\.(png|jpe?g)$/i, ".webp");
    try {
      await sharp(imgPath).webp({ quality: 80 }).toFile(webpPath);
      console.log(`Converted: ${imgPath} -> ${webpPath}`);
    } catch (error) {
      console.error(`Failed to convert ${imgPath}:`, error);
    }
  });

  await Promise.all(conversionPromises);
  console.log("Image conversion finished.");
}

convertImages();
