/**
 * Local Bible Service - Spanish Version
 * Provides Bible data from local biblia_spanish.json file in the assets folder
 * No API calls required - fully offline capable
 */

import { BIBLE_BOOKS, BibleBookInfo, BOOK_ID_TO_SPANISH_NAME } from '@/constants/BibleBooks';

// Import the Spanish Bible JSON
const SPANISH_BIBLE = require('../assets/biblia_spanish.json');

// Type definitions
export interface BibleVerse {
    verse: string;
    text: string;
}

export interface BibleChapter {
    chapter: string;
    verses: BibleVerse[];
}

export interface BibleBookData {
    book: string;
    chapters: BibleChapter[];
}

/**
 * Get all Bible books with metadata
 */
export function getAllBooks(): BibleBookInfo[] {
    return BIBLE_BOOKS;
}

/**
 * Get books by testament
 */
export function getBooksByTestament(testament: 'old' | 'new'): BibleBookInfo[] {
    return BIBLE_BOOKS.filter(book => book.testament === testament);
}

/**
 * Get a specific book's data from Spanish Bible
 */
export function getBookData(bookId: string): BibleBookData | null {
    const spanishName = BOOK_ID_TO_SPANISH_NAME[bookId];
    if (!spanishName) return null;

    const bookData = SPANISH_BIBLE[spanishName];
    if (!bookData) return null;

    // Convert the Spanish Bible format to our format
    const chapters: BibleChapter[] = [];
    const chapterNumbers = Object.keys(bookData).map(n => parseInt(n)).sort((a, b) => a - b);

    for (const chapterNum of chapterNumbers) {
        const chapterData = bookData[chapterNum.toString()];
        if (!chapterData) continue;

        const verses: BibleVerse[] = [];
        const verseNumbers = Object.keys(chapterData).map(n => parseInt(n)).sort((a, b) => a - b);

        for (const verseNum of verseNumbers) {
            verses.push({
                verse: verseNum.toString(),
                text: chapterData[verseNum.toString()]
            });
        }

        chapters.push({
            chapter: chapterNum.toString(),
            verses
        });
    }

    return {
        book: spanishName,
        chapters
    };
}

/**
 * Get book info by ID
 */
export function getBookInfo(bookId: string): BibleBookInfo | undefined {
    return BIBLE_BOOKS.find(book => book.id === bookId);
}

/**
 * Get a specific chapter from a book
 */
export function getChapter(bookId: string, chapterNumber: number): BibleChapter | null {
    const spanishName = BOOK_ID_TO_SPANISH_NAME[bookId];
    if (!spanishName) return null;

    const bookData = SPANISH_BIBLE[spanishName];
    if (!bookData) return null;

    const chapterData = bookData[chapterNumber.toString()];
    if (!chapterData) return null;

    const verses: BibleVerse[] = [];
    const verseNumbers = Object.keys(chapterData).map(n => parseInt(n)).sort((a, b) => a - b);

    for (const verseNum of verseNumbers) {
        verses.push({
            verse: verseNum.toString(),
            text: chapterData[verseNum.toString()]
        });
    }

    return {
        chapter: chapterNumber.toString(),
        verses
    };
}

/**
 * Get all chapters from a book
 */
export function getChapters(bookId: string): BibleChapter[] {
    const bookData = getBookData(bookId);
    if (!bookData) return [];
    return bookData.chapters;
}

/**
 * Get chapter count for a book
 */
export function getChapterCount(bookId: string): number {
    const bookInfo = getBookInfo(bookId);
    return bookInfo?.chapters || 0;
}

/**
 * Get a specific verse
 */
export function getVerse(bookId: string, chapterNumber: number, verseNumber: number): BibleVerse | null {
    const chapter = getChapter(bookId, chapterNumber);
    if (!chapter) return null;

    const verse = chapter.verses.find(v => parseInt(v.verse) === verseNumber);
    return verse || null;
}

/**
 * Get verse count for a chapter
 */
export function getVerseCount(bookId: string, chapterNumber: number): number {
    const chapter = getChapter(bookId, chapterNumber);
    return chapter?.verses.length || 0;
}

/**
 * Search verses across all books
 */
export function searchVerses(query: string, options?: {
    bookIds?: string[];
    testament?: 'old' | 'new' | 'all';
    limit?: number;
}): Array<{
    bookId: string;
    bookName: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
}> {
    const results: Array<{
        bookId: string;
        bookName: string;
        chapter: number;
        verse: number;
        text: string;
        reference: string;
    }> = [];

    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return results;

    const limit = options?.limit || 50;
    let booksToSearch = BIBLE_BOOKS;

    // Filter by testament
    if (options?.testament && options.testament !== 'all') {
        booksToSearch = booksToSearch.filter(book => book.testament === options.testament);
    }

    // Filter by specific book IDs
    if (options?.bookIds && options.bookIds.length > 0) {
        booksToSearch = booksToSearch.filter(book => options.bookIds!.includes(book.id));
    }

    // Search through books
    for (const bookInfo of booksToSearch) {
        if (results.length >= limit) break;

        const bookData = getBookData(bookInfo.id);
        if (!bookData) continue;

        for (const chapter of bookData.chapters) {
            if (results.length >= limit) break;

            for (const verse of chapter.verses) {
                if (results.length >= limit) break;

                if (verse.text.toLowerCase().includes(normalizedQuery)) {
                    results.push({
                        bookId: bookInfo.id,
                        bookName: bookInfo.name,
                        chapter: parseInt(chapter.chapter),
                        verse: parseInt(verse.verse),
                        text: verse.text,
                        reference: `${bookInfo.name} ${chapter.chapter}:${verse.verse}`,
                    });
                }
            }
        }
    }

    return results;
}

/**
 * Get random verse (for verse of the day, etc.)
 */
export function getRandomVerse(): {
    bookId: string;
    bookName: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
} | null {
    // Popular verses pool for random selection
    const popularReferences = [
        { bookId: 'JHN', chapter: 3, verse: 16 },
        { bookId: 'PSA', chapter: 23, verse: 1 },
        { bookId: 'PHP', chapter: 4, verse: 13 },
        { bookId: 'ROM', chapter: 8, verse: 28 },
        { bookId: 'JER', chapter: 29, verse: 11 },
        { bookId: 'PRO', chapter: 3, verse: 5 },
        { bookId: 'ISA', chapter: 40, verse: 31 },
        { bookId: 'MAT', chapter: 11, verse: 28 },
        { bookId: 'PSA', chapter: 46, verse: 1 },
        { bookId: 'ROM', chapter: 12, verse: 2 },
        { bookId: 'GAL', chapter: 5, verse: 22 },
        { bookId: 'EPH', chapter: 2, verse: 8 },
        { bookId: '1CO', chapter: 13, verse: 4 },
        { bookId: 'HEB', chapter: 11, verse: 1 },
        { bookId: 'JAS', chapter: 1, verse: 5 },
    ];

    const randomRef = popularReferences[Math.floor(Math.random() * popularReferences.length)];
    const bookInfo = getBookInfo(randomRef.bookId);
    const verse = getVerse(randomRef.bookId, randomRef.chapter, randomRef.verse);

    if (!bookInfo || !verse) return null;

    return {
        bookId: randomRef.bookId,
        bookName: bookInfo.name,
        chapter: randomRef.chapter,
        verse: randomRef.verse,
        text: verse.text,
        reference: `${bookInfo.name} ${randomRef.chapter}:${randomRef.verse}`,
    };
}

export default {
    getAllBooks,
    getBooksByTestament,
    getBookData,
    getBookInfo,
    getChapter,
    getChapters,
    getChapterCount,
    getVerse,
    getVerseCount,
    searchVerses,
    getRandomVerse,
};
