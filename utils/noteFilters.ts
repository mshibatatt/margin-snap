import type { Note, EmotionStamp, DateFilter, NoteStatusFilter } from '@/types';

export interface SearchFilters {
  query?: string;
  dateFilter?: DateFilter;
  statusFilter?: NoteStatusFilter;
  emotionStamps?: EmotionStamp[];
}

/**
 * Build a scope string from search filters for note detail navigation
 */
export function buildSearchScope(filters: SearchFilters): string | undefined {
  const params: string[] = [];

  if (filters.query?.trim()) {
    params.push(`q=${encodeURIComponent(filters.query.trim())}`);
  }
  if (filters.dateFilter && filters.dateFilter !== 'all') {
    params.push(`d=${filters.dateFilter}`);
  }
  if (filters.statusFilter && filters.statusFilter !== 'all') {
    params.push(`s=${filters.statusFilter}`);
  }
  if (filters.emotionStamps && filters.emotionStamps.length > 0) {
    params.push(`e=${filters.emotionStamps.join(',')}`);
  }

  return params.length > 0 ? `search:${params.join('&')}` : undefined;
}

/**
 * Parse a search scope string back into filter parameters
 */
export function parseSearchScope(scope: string): SearchFilters {
  const params = scope.replace('search:', '');
  const result: SearchFilters = {};

  params.split('&').forEach((param) => {
    const [key, value] = param.split('=');
    if (!value) return;

    switch (key) {
      case 'q':
        result.query = decodeURIComponent(value);
        break;
      case 'd':
        result.dateFilter = value as DateFilter;
        break;
      case 's':
        result.statusFilter = value as NoteStatusFilter;
        break;
      case 'e':
        result.emotionStamps = value.split(',') as EmotionStamp[];
        break;
    }
  });

  return result;
}

/**
 * Get date cutoff based on date filter
 */
function getDateCutoff(dateFilter: DateFilter): Date {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (dateFilter) {
    case 'today':
      return startOfToday;
    case 'week':
      return new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0);
  }
}

/**
 * Apply search filters to a list of notes
 */
export function applySearchFilters(
  notes: Note[],
  filters: SearchFilters,
  bookSearchMap?: Map<string, { title: string; author: string | null }>
): Note[] {
  let result = [...notes];

  // Apply search query
  if (filters.query) {
    const lowerQuery = filters.query.toLowerCase();
    result = result.filter((note) => {
      // Search in memo
      if (note.memo && note.memo.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // Search in page number
      if (note.pageNumber !== null && note.pageNumber.toString().includes(lowerQuery)) {
        return true;
      }
      // Search in book title and author
      if (note.bookId && bookSearchMap) {
        const bookInfo = bookSearchMap.get(note.bookId);
        if (bookInfo) {
          if (bookInfo.title.includes(lowerQuery)) return true;
          if (bookInfo.author && bookInfo.author.includes(lowerQuery)) return true;
        }
      }
      return false;
    });
  }

  // Apply date filter
  if (filters.dateFilter && filters.dateFilter !== 'all') {
    const cutoff = getDateCutoff(filters.dateFilter);
    result = result.filter((note) => note.createdAt >= cutoff);
  }

  // Apply status filter
  if (filters.statusFilter && filters.statusFilter !== 'all') {
    if (filters.statusFilter === 'unsorted') {
      result = result.filter((note) => note.bookId === null);
    } else if (filters.statusFilter === 'sorted') {
      result = result.filter((note) => note.bookId !== null);
    }
  }

  // Apply emotion filter
  if (filters.emotionStamps && filters.emotionStamps.length > 0) {
    result = result.filter(
      (note) => note.emotionStamp && filters.emotionStamps!.includes(note.emotionStamp)
    );
  }

  return result;
}
