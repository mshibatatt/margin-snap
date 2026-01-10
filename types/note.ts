export const EMOTION_STAMPS = ['🙂', '🤔', '😮', '✨', '😢'] as const;
export type EmotionStamp = (typeof EMOTION_STAMPS)[number];

export interface Note {
  id: string;
  photoUri: string | null;
  pageNumber: number | null;
  memo: string | null;
  emotionStamp: EmotionStamp | null;
  bookId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteInput {
  photoUri?: string | null;
  pageNumber?: number | null;
  memo?: string | null;
  emotionStamp?: EmotionStamp | null;
  bookId?: string | null;
}

export interface UpdateNoteInput {
  pageNumber?: number | null;
  memo?: string | null;
  emotionStamp?: EmotionStamp | null;
  bookId?: string | null;
}
