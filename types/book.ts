export interface Book {
  id: string;
  title: string;
  coverUri: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookWithNoteCount extends Book {
  noteCount: number;
}

export interface CreateBookInput {
  title: string;
  coverUri?: string | null;
}

export interface UpdateBookInput {
  title?: string;
  coverUri?: string | null;
}
