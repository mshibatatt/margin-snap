import { generateId } from '../../utils/generateId';
import { getDatabase } from '../schema';
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  EmotionStamp,
  NoteFilter,
  SortOrder,
} from '../../types';
import { subDays, startOfDay } from 'date-fns';

interface NoteRow {
  id: string;
  photo_uri: string | null;
  page_number: number | null;
  memo: string | null;
  emotion_stamp: string | null;
  book_id: string | null;
  created_at: number;
  updated_at: number;
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    photoUri: row.photo_uri,
    pageNumber: row.page_number,
    memo: row.memo,
    emotionStamp: row.emotion_stamp as EmotionStamp | null,
    bookId: row.book_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function validateNoteInput(input: CreateNoteInput): void {
  if (!input.photoUri && input.pageNumber == null) {
    throw new Error('写真またはページ番号のいずれかが必須です');
  }
}

export function createNote(input: CreateNoteInput): Note {
  validateNoteInput(input);

  const db = getDatabase();
  const id = generateId();
  const now = Date.now();

  db.runSync(
    `INSERT INTO notes (id, photo_uri, page_number, memo, emotion_stamp, book_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.photoUri ?? null,
      input.pageNumber ?? null,
      input.memo ?? null,
      input.emotionStamp ?? null,
      input.bookId ?? null,
      now,
      now,
    ]
  );

  return {
    id,
    photoUri: input.photoUri ?? null,
    pageNumber: input.pageNumber ?? null,
    memo: input.memo ?? null,
    emotionStamp: input.emotionStamp ?? null,
    bookId: input.bookId ?? null,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export function findNoteById(id: string): Note | null {
  const db = getDatabase();
  const row = db.getFirstSync<NoteRow>(
    'SELECT * FROM notes WHERE id = ?',
    [id]
  );
  return row ? rowToNote(row) : null;
}

export function updateNote(id: string, input: UpdateNoteInput): Note {
  const db = getDatabase();
  const existing = findNoteById(id);

  if (!existing) {
    throw new Error('メモが見つかりません');
  }

  const now = Date.now();
  const updates: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [now];

  if (input.pageNumber !== undefined) {
    updates.push('page_number = ?');
    values.push(input.pageNumber);
  }
  if (input.memo !== undefined) {
    updates.push('memo = ?');
    values.push(input.memo);
  }
  if (input.emotionStamp !== undefined) {
    updates.push('emotion_stamp = ?');
    values.push(input.emotionStamp);
  }
  if (input.bookId !== undefined) {
    updates.push('book_id = ?');
    values.push(input.bookId);
  }

  values.push(id);

  db.runSync(
    `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return findNoteById(id)!;
}

export function deleteNote(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM notes WHERE id = ?', [id]);
}

export function deleteNotes(ids: string[]): void {
  if (ids.length === 0) return;

  const db = getDatabase();
  const placeholders = ids.map(() => '?').join(', ');
  db.runSync(`DELETE FROM notes WHERE id IN (${placeholders})`, ids);
}

export function findAllNotes(
  filter?: Partial<NoteFilter>,
  sort: SortOrder = 'newest'
): Note[] {
  const db = getDatabase();
  const conditions: string[] = [];
  const values: (string | number | null)[] = [];

  if (filter) {
    // Date filter
    if (filter.dateFilter && filter.dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filter.dateFilter) {
        case 'today':
          startDate = startOfDay(now);
          break;
        case 'week':
          startDate = startOfDay(subDays(now, 7));
          break;
        case 'month':
          startDate = startOfDay(subDays(now, 30));
          break;
        default:
          startDate = new Date(0);
      }

      conditions.push('created_at >= ?');
      values.push(startDate.getTime());
    }

    // Emotion stamps filter
    if (filter.emotionStamps && filter.emotionStamps.length > 0) {
      const placeholders = filter.emotionStamps.map(() => '?').join(', ');
      conditions.push(`emotion_stamp IN (${placeholders})`);
      values.push(...filter.emotionStamps);
    }

    // Status filter
    if (filter.statusFilter && filter.statusFilter !== 'all') {
      if (filter.statusFilter === 'unsorted') {
        conditions.push('book_id IS NULL');
      } else if (filter.statusFilter === 'sorted') {
        conditions.push('book_id IS NOT NULL');
      }
    }

    // Book filter
    if (filter.bookId) {
      conditions.push('book_id = ?');
      values.push(filter.bookId);
    }

    // Search query
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const searchTerm = `%${filter.searchQuery.trim()}%`;
      conditions.push(`(
        memo LIKE ? OR
        CAST(page_number AS TEXT) LIKE ? OR
        book_id IN (SELECT id FROM books WHERE title LIKE ? OR author LIKE ?)
      )`);
      values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  let orderClause: string;
  switch (sort) {
    case 'oldest':
      orderClause = 'ORDER BY created_at ASC';
      break;
    case 'page':
      orderClause = 'ORDER BY page_number ASC NULLS LAST, created_at DESC';
      break;
    case 'newest':
    default:
      orderClause = 'ORDER BY created_at DESC';
      break;
  }

  const rows = db.getAllSync<NoteRow>(
    `SELECT * FROM notes ${whereClause} ${orderClause}`,
    values
  );

  return rows.map(rowToNote);
}

export function findNotesByBookId(bookId: string): Note[] {
  return findAllNotes({ bookId });
}

export function findUnsortedNotes(): Note[] {
  return findAllNotes({ statusFilter: 'unsorted' });
}

export function countNotes(filter?: Partial<NoteFilter>): number {
  const db = getDatabase();
  const conditions: string[] = [];
  const values: (string | number | null)[] = [];

  if (filter) {
    if (filter.statusFilter === 'unsorted') {
      conditions.push('book_id IS NULL');
    } else if (filter.statusFilter === 'sorted') {
      conditions.push('book_id IS NOT NULL');
    }

    if (filter.bookId) {
      conditions.push('book_id = ?');
      values.push(filter.bookId);
    }
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const result = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM notes ${whereClause}`,
    values
  );

  return result?.count ?? 0;
}

export function assignNotesToBook(noteIds: string[], bookId: string | null): void {
  if (noteIds.length === 0) return;

  const db = getDatabase();
  const now = Date.now();
  const placeholders = noteIds.map(() => '?').join(', ');

  db.runSync(
    `UPDATE notes SET book_id = ?, updated_at = ? WHERE id IN (${placeholders})`,
    [bookId, now, ...noteIds]
  );
}
