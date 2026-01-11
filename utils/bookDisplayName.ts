/**
 * 本の表示名を生成する
 * 巻数がある場合は「タイトル (巻数)」形式で返す
 */
export function getBookDisplayName(book: { title: string; volume?: string | null }): string {
  if (book.volume) {
    return `${book.title} (${book.volume})`;
  }
  return book.title;
}
