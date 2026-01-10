import { Paths, Directory, File } from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';

function getImagesDirectory(): Directory {
  return new Directory(Paths.document, 'images', 'notes');
}

function ensureDirectoryExists(): void {
  const dir = getImagesDirectory();
  if (!dir.exists) {
    dir.create();
  }
}

export function savePhoto(sourceUri: string): string {
  ensureDirectoryExists();

  const filename = `${uuidv4()}-${Date.now()}.jpg`;
  const sourceFile = new File(sourceUri);
  const destinationFile = new File(getImagesDirectory(), filename);

  sourceFile.copy(destinationFile);

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
