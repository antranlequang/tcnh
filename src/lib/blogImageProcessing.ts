import convertHeic from "heic-convert";
import sharp from "sharp";

type ImageIdentity = {
  fileName?: string;
  mimeType?: string;
};

function isHeicImage({ fileName = "", mimeType = "" }: ImageIdentity) {
  return (
    /\.(heic|heif)$/i.test(fileName) ||
    /^(image\/heic|image\/heif|image\/heic-sequence|image\/heif-sequence)$/i.test(mimeType)
  );
}

export async function convertBlogImageToWebp(
  input: ArrayBuffer | Uint8Array | Buffer,
  identity: ImageIdentity = {}
) {
  const source = input instanceof ArrayBuffer ? Buffer.from(input) : Buffer.from(input);

  try {
    return await sharp(source).rotate().webp({ quality: 82 }).toBuffer();
  } catch (error) {
    if (!isHeicImage(identity)) throw error;

    // The prebuilt Sharp package cannot decode every HEVC-compressed HEIC file.
    // Decode those files through libheif/WASM first, then normalize them to WebP.
    const jpeg = await convertHeic({
      buffer: source,
      format: "JPEG",
      quality: 1,
    });

    return sharp(Buffer.from(jpeg)).webp({ quality: 82 }).toBuffer();
  }
}
