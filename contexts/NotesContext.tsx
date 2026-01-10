import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  NoteFilter,
  SortOrder,
} from '../types';
import { DEFAULT_NOTE_FILTER } from '../types';
import * as noteRepository from '../db/repositories/noteRepository';

interface NotesContextValue {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;
  filter: NoteFilter;
  sortOrder: SortOrder;

  // Actions
  createNote: (input: CreateNoteInput) => Note;
  updateNote: (id: string, input: UpdateNoteInput) => Note;
  deleteNote: (id: string) => void;
  deleteNotes: (ids: string[]) => void;
  assignToBook: (noteIds: string[], bookId: string | null) => void;

  // Filter & Sort
  setFilter: (filter: Partial<NoteFilter>) => void;
  resetFilter: () => void;
  setSortOrder: (order: SortOrder) => void;

  // Refresh
  refresh: () => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

interface NotesProviderProps {
  children: ReactNode;
  initialFilter?: Partial<NoteFilter>;
}

export function NotesProvider({
  children,
  initialFilter,
}: NotesProviderProps): React.ReactElement {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilterState] = useState<NoteFilter>({
    ...DEFAULT_NOTE_FILTER,
    ...initialFilter,
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const loadNotes = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedNotes = noteRepository.findAllNotes(filter, sortOrder);
      setNotes(loadedNotes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('メモの読み込みに失敗しました'));
    } finally {
      setIsLoading(false);
    }
  }, [filter, sortOrder]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = useCallback((input: CreateNoteInput): Note => {
    const note = noteRepository.createNote(input);
    loadNotes();
    return note;
  }, [loadNotes]);

  const updateNote = useCallback((id: string, input: UpdateNoteInput): Note => {
    const note = noteRepository.updateNote(id, input);
    loadNotes();
    return note;
  }, [loadNotes]);

  const deleteNote = useCallback((id: string): void => {
    noteRepository.deleteNote(id);
    loadNotes();
  }, [loadNotes]);

  const deleteNotes = useCallback((ids: string[]): void => {
    noteRepository.deleteNotes(ids);
    loadNotes();
  }, [loadNotes]);

  const assignToBook = useCallback((noteIds: string[], bookId: string | null): void => {
    noteRepository.assignNotesToBook(noteIds, bookId);
    loadNotes();
  }, [loadNotes]);

  const setFilter = useCallback((newFilter: Partial<NoteFilter>): void => {
    setFilterState((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const resetFilter = useCallback((): void => {
    setFilterState(DEFAULT_NOTE_FILTER);
  }, []);

  const value: NotesContextValue = {
    notes,
    isLoading,
    error,
    filter,
    sortOrder,
    createNote,
    updateNote,
    deleteNote,
    deleteNotes,
    assignToBook,
    setFilter,
    resetFilter,
    setSortOrder,
    refresh: loadNotes,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextValue {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
