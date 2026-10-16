import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'meetspace/rooms',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            const message =
              typeof error === 'object' && error !== null && 'message' in error
                ? String(error.message)
                : "L'upload de l'image a échoué.";

            reject(new Error(message));
            return;
          }

          if (!result) {
            reject(new Error("L'image n'a pas pu être uploadée."));
            return;
          }

          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const url = new URL(imageUrl);
    const uploadMarker = '/upload/';

    const uploadIndex = url.pathname.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      throw new Error("L'URL de l'image Cloudinary est invalide.");
    }

    const publicIdWithVersion = url.pathname.slice(
      uploadIndex + uploadMarker.length,
    );

    const publicId = publicIdWithVersion
      .replace(/^v\d+\//, '')
      .replace(/\.[^.]+$/, '');

    const response: unknown = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    const deletionResult =
      typeof response === 'object' && response !== null && 'result' in response
        ? response.result
        : undefined;

    if (deletionResult !== 'ok' && deletionResult !== 'not found') {
      throw new Error("La suppression de l'image Cloudinary a échoué.");
    }
  }
}
