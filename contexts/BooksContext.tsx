import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  Book,
  BookWithNoteCount,
  CreateBookInput,
  UpdateBookInput,
} from '../types';
import * as bookRepository from '../db/repositories/bookRepository';

interface BooksContextValue {
  books: BookWithNoteCount[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  createBook: (input: CreateBookInput) => Book;
  updateBook: (id: string, input: UpdateBookInput) => Book;
  deleteBook: (id: string) => void;
  getBookById: (id: string) => Book | null;

  // Refresh
  refresh: () => void;
}

const BooksContext = createContext<BooksContextValue | null>(null);

interface BooksProviderProps {
  children: ReactNode;
}

export function BooksProvider({ children }: BooksProviderProps): React.ReactElement {
  const [books, setBooks] = useState<BookWithNoteCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBooks = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedBooks = bookRepository.findAllBooksWithNoteCount();
      setBooks(loadedBooks);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('本の読み込みに失敗しました'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const createBook = useCallback((input: CreateBookInput): Book => {
    const book = bookRepository.createBook(input);
    loadBooks();
    return book;
  }, [loadBooks]);

  const updateBook = useCallback((id: string, input: UpdateBookInput): Book => {
    const book = bookRepository.updateBook(id, input);
    loadBooks();
    return book;
  }, [loadBooks]);

  const deleteBook = useCallback((id: string): void => {
    bookRepository.deleteBook(id);
    loadBooks();
  }, [loadBooks]);

  const getBookById = useCallback((id: string): Book | null => {
    return bookRepository.findBookById(id);
  }, []);

  const value: BooksContextValue = {
    books,
    isLoading,
    error,
    createBook,
    updateBook,
    deleteBook,
    getBookById,
    refresh: loadBooks,
  };

  return (
    <BooksContext.Provider value={value}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks(): BooksContextValue {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error('useBooks must be used within a BooksProvider');
  }
  return context;
}
