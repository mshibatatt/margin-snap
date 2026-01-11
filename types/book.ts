export interface Book {
  id: string;
  title: string;
  author: string | null;
  volume: string | null;
  coverUri: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookWithNoteCount extends Book {
  noteCount: number;
}

export interface CreateBookInput {
  title: string;
  author?: string | null;
  volume?: string | null;
  coverUri?: string | null;
}

export interface UpdateBookInput {
  title?: string;
  author?: string | null;
  volume?: string | null;
  coverUri?: string | null;
}
