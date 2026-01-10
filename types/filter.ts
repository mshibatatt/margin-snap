import type { EmotionStamp } from './note';

export type DateFilter = 'all' | 'today' | 'week' | 'month';
export type NoteStatusFilter = 'all' | 'unsorted' | 'sorted';
export type SortOrder = 'newest' | 'oldest' | 'page';

export interface NoteFilter {
  dateFilter: DateFilter;
  emotionStamps: EmotionStamp[];
  statusFilter: NoteStatusFilter;
  bookId: string | null;
  searchQuery: string;
}

export const DEFAULT_NOTE_FILTER: NoteFilter = {
  dateFilter: 'all',
  emotionStamps: [],
  statusFilter: 'all',
  bookId: null,
  searchQuery: '',
};
