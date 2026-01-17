/**
 * Local Bible Service
 * Provides Bible data from local JSON files in the assets folder
 * No API calls required - fully offline capable
 */

import { BIBLE_BOOKS, BibleBookInfo } from '@/constants/BibleBooks';

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

// Static imports for all Bible books (required for React Native bundling)
// Note: File names must match exactly what's in the assets folder
const BIBLE_DATA: { [key: string]: BibleBookData } = {
    // Old Testament
    'GEN': require('../assets/Genesis.json'),
    'EXO': require('../assets/Exodus.json'),
    'LEV': require('../assets/Leviticus.json'),
    'NUM': require('../assets/Numbers.json'),
    'DEU': require('../assets/Deuteronomy.json'),
    'JOS': require('../assets/Joshua.json'),
    'JDG': require('../assets/Judges.json'),
    'RUT': require('../assets/Ruth.json'),
    '1SA': require('../assets/1Samuel.json'),
    '2SA': require('../assets/2Samuel.json'),
    '1KI': require('../assets/1Kings.json'),
    '2KI': require('../assets/2Kings.json'),
    '1CH': require('../assets/1Chronicles.json'),
    '2CH': require('../assets/2Chronicles.json'),
    'EZR': require('../assets/Ezra.json'),
    'NEH': require('../assets/Nehemiah.json'),
    'EST': require('../assets/Esther.json'),
    'JOB': require('../assets/Job.json'),
    'PSA': require('../assets/Psalms.json'),
    'PRO': require('../assets/Proverbs.json'),
    'ECC': require('../assets/Ecclesiastes.json'),
    'SNG': require('../assets/SongofSolomon.json'),
    'ISA': require('../assets/Isaiah.json'),
    'JER': require('../assets/Jeremiah.json'),
    'LAM': require('../assets/Lamentations.json'),
    'EZK': require('../assets/Ezekiel.json'),
    'DAN': require('../assets/Daniel.json'),
    'HOS': require('../assets/Hosea.json'),
    'JOL': require('../assets/Joel.json'),
    'AMO': require('../assets/Amos.json'),
    'OBA': require('../assets/Obadiah.json'),
    'JON': require('../assets/Jonah.json'),
    'MIC': require('../assets/Micah.json'),
    'NAM': require('../assets/Nahum.json'),
    'HAB': require('../assets/Habakkuk.json'),
    'ZEP': require('../assets/Zephaniah.json'),
    'HAG': require('../assets/Haggai.json'),
    'ZEC': require('../assets/Zechariah.json'),
    'MAL': require('../assets/Malachi.json'),
    // New Testament
    'MAT': require('../assets/Matthew.json'),
    'MRK': require('../assets/Mark.json'),
    'LUK': require('../assets/Luke.json'),
    'JHN': require('../assets/John.json'),
    'ACT': require('../assets/Acts.json'),
    'ROM': require('../assets/Romans.json'),
    '1CO': require('../assets/1Corinthians.json'),
    '2CO': require('../assets/2Corinthians.json'),
    'GAL': require('../assets/Galatians.json'),
    'EPH': require('../assets/Ephesians.json'),
    'PHP': require('../assets/Philippians.json'),
    'COL': require('../assets/Colossians.json'),
    '1TH': require('../assets/1Thessalonians.json'),
    '2TH': require('../assets/2Thessalonians.json'),
    '1TI': require('../assets/1Timothy.json'),
    '2TI': require('../assets/2Timothy.json'),
    'TIT': require('../assets/Titus.json'),
    'PHM': require('../assets/Philemon.json'),
    'HEB': require('../assets/Hebrews.json'),
    'JAS': require('../assets/James.json'),
    '1PE': require('../assets/1Peter.json'),
    '2PE': require('../assets/2Peter.json'),
    '1JN': require('../assets/1John.json'),
    '2JN': require('../assets/2John.json'),
    '3JN': require('../assets/3John.json'),
    'JUD': require('../assets/Jude.json'),
    'REV': require('../assets/Revelation.json'),
};

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
 * Get a specific book's data
 */
export function getBookData(bookId: string): BibleBookData | null {
    const data = BIBLE_DATA[bookId];
    return data || null;
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
    const bookData = getBookData(bookId);
    if (!bookData) return null;

    const chapter = bookData.chapters.find(c => parseInt(c.chapter) === chapterNumber);
    return chapter || null;
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
