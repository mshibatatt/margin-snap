import { generateId } from '../../utils/generateId';
import { getDatabase } from '../schema';
import type {
  Book,
  BookWithNoteCount,
  CreateBookInput,
  UpdateBookInput,
} from '../../types';

interface BookRow {
  id: string;
  title: string;
  author: string | null;
  volume: string | null;
  cover_uri: string | null;
  created_at: number;
  updated_at: number;
}

interface BookWithCountRow extends BookRow {
  note_count: number;
}

function rowToBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    volume: row.volume,
    coverUri: row.cover_uri,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function rowToBookWithCount(row: BookWithCountRow): BookWithNoteCount {
  return {
    ...rowToBook(row),
    noteCount: row.note_count,
  };
}

export function createBook(input: CreateBookInput): Book {
  if (!input.title.trim()) {
    throw new Error('タイトルは必須です');
  }

  const db = getDatabase();
  const id = generateId();
  const now = Date.now();
  const author = input.author?.trim() || null;
  const volume = input.volume?.trim() || null;

  db.runSync(
    `INSERT INTO books (id, title, author, volume, cover_uri, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, input.title.trim(), author, volume, input.coverUri ?? null, now, now]
  );

  return {
    id,
    title: input.title.trim(),
    author,
    volume,
    coverUri: input.coverUri ?? null,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export function findBookById(id: string): Book | null {
  const db = getDatabase();
  const row = db.getFirstSync<BookRow>(
    'SELECT * FROM books WHERE id = ?',
    [id]
  );
  return row ? rowToBook(row) : null;
}

export function updateBook(id: string, input: UpdateBookInput): Book {
  const db = getDatabase();
  const existing = findBookById(id);

  if (!existing) {
    throw new Error('本が見つかりません');
  }

  const now = Date.now();
  const updates: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [now];

  if (input.title !== undefined) {
    if (!input.title.trim()) {
      throw new Error('タイトルは必須です');
    }
    updates.push('title = ?');
    values.push(input.title.trim());
  }

  if (input.author !== undefined) {
    updates.push('author = ?');
    values.push(input.author?.trim() || null);
  }

  if (input.volume !== undefined) {
    updates.push('volume = ?');
    values.push(input.volume?.trim() || null);
  }

  if (input.coverUri !== undefined) {
    updates.push('cover_uri = ?');
    values.push(input.coverUri);
  }

  values.push(id);

  db.runSync(
    `UPDATE books SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return findBookById(id)!;
}

export function deleteBook(id: string): void {
  const db = getDatabase();
  // Notes with this book_id will have book_id set to NULL due to ON DELETE SET NULL
  db.runSync('DELETE FROM books WHERE id = ?', [id]);
}

export function findAllBooks(): Book[] {
  const db = getDatabase();
  const rows = db.getAllSync<BookRow>(
    'SELECT * FROM books ORDER BY updated_at DESC'
  );
  return rows.map(rowToBook);
}

export function findAllBooksWithNoteCount(): BookWithNoteCount[] {
  const db = getDatabase();
  const rows = db.getAllSync<BookWithCountRow>(`
    SELECT
      b.*,
      COUNT(n.id) as note_count
    FROM books b
    LEFT JOIN notes n ON b.id = n.book_id
    GROUP BY b.id
    ORDER BY b.updated_at DESC
  `);
  return rows.map(rowToBookWithCount);
}

export function countBooks(): number {
  const db = getDatabase();
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM books'
  );
  return result?.count ?? 0;
}
