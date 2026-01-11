/**
 * 感情スタンプ - 読書体験を6つの反応で表現
 * 💡 ひらめき - 新しい発見、気づき
 * ❤️ 共感 - 心に響いた、好き
 * 🔥 重要 - 覚えておきたい核心
 * 🤔 疑問 - 考えたい、調べたい
 * ⭐ 名言 - お気に入りの一節
 * 🥲 泣ける - 感動、切ない
 */
export const EMOTION_STAMPS = ['💡', '❤️', '🔥', '🤔', '⭐', '🥲'] as const;
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
