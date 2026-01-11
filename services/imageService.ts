import { Paths, Directory, File } from 'expo-file-system';
import { generateId } from '../utils/generateId';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_IMAGE_WIDTH = 1920;
const JPEG_QUALITY = 0.8;

function getImagesDirectory(): Directory {
  return new Directory(Paths.document, 'images', 'notes');
}

function ensureDirectoryExists(): void {
  // Create parent directory first (images)
  const imagesDir = new Directory(Paths.document, 'images');
  if (!imagesDir.exists) {
    imagesDir.create();
  }

  // Then create subdirectory (notes)
  const notesDir = new Directory(imagesDir, 'notes');
  if (!notesDir.exists) {
    notesDir.create();
  }
}

export async function savePhoto(sourceUri: string): Promise<string> {
  ensureDirectoryExists();

  // Optimize image: resize if too large and compress
  const optimizedImage = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: MAX_IMAGE_WIDTH } }],
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  const filename = `${generateId()}.jpg`;
  const sourceFile = new File(optimizedImage.uri);
  const destinationFile = new File(getImagesDirectory(), filename);

  sourceFile.copy(destinationFile);

  // Clean up temp file
  try {
    sourceFile.delete();
  } catch {
    // Ignore cleanup errors
  }

  return destinationFile.uri;
}

export function deletePhoto(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('Failed to delete photo:', error);
  }
}

export function getPhotoExists(uri: string): boolean {
  try {
    const file = new File(uri);
    return file.exists;
  } catch {
    return false;
  }
}
