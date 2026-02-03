// Complete Bible Books in Order - Old Testament and New Testament (Spanish)

export interface BibleBookInfo {
  id: string;
  name: string;
  abbreviation: string;
  chapters: number;
  testament: 'old' | 'new';
  category: string;
  order: number;
}

export const BIBLE_BOOKS: BibleBookInfo[] = [
  // ANTIGUO TESTAMENTO
  // Ley (Torá/Pentateuco)
  { id: 'GEN', name: 'Génesis', abbreviation: 'Gén', chapters: 50, testament: 'old', category: 'Ley', order: 1 },
  { id: 'EXO', name: 'Éxodo', abbreviation: 'Éxo', chapters: 40, testament: 'old', category: 'Ley', order: 2 },
  { id: 'LEV', name: 'Levítico', abbreviation: 'Lev', chapters: 27, testament: 'old', category: 'Ley', order: 3 },
  { id: 'NUM', name: 'Números', abbreviation: 'Núm', chapters: 36, testament: 'old', category: 'Ley', order: 4 },
  { id: 'DEU', name: 'Deuteronomio', abbreviation: 'Deu', chapters: 34, testament: 'old', category: 'Ley', order: 5 },

  // Libros Históricos
  { id: 'JOS', name: 'Josué', abbreviation: 'Jos', chapters: 24, testament: 'old', category: 'Historia', order: 6 },
  { id: 'JDG', name: 'Jueces', abbreviation: 'Jue', chapters: 21, testament: 'old', category: 'Historia', order: 7 },
  { id: 'RUT', name: 'Rut', abbreviation: 'Rut', chapters: 4, testament: 'old', category: 'Historia', order: 8 },
  { id: '1SA', name: '1 Samuel', abbreviation: '1Sa', chapters: 31, testament: 'old', category: 'Historia', order: 9 },
  { id: '2SA', name: '2 Samuel', abbreviation: '2Sa', chapters: 24, testament: 'old', category: 'Historia', order: 10 },
  { id: '1KI', name: '1 Reyes', abbreviation: '1Re', chapters: 22, testament: 'old', category: 'Historia', order: 11 },
  { id: '2KI', name: '2 Reyes', abbreviation: '2Re', chapters: 25, testament: 'old', category: 'Historia', order: 12 },
  { id: '1CH', name: '1 Crónicas', abbreviation: '1Cr', chapters: 29, testament: 'old', category: 'Historia', order: 13 },
  { id: '2CH', name: '2 Crónicas', abbreviation: '2Cr', chapters: 36, testament: 'old', category: 'Historia', order: 14 },
  { id: 'EZR', name: 'Esdras', abbreviation: 'Esd', chapters: 10, testament: 'old', category: 'Historia', order: 15 },
  { id: 'NEH', name: 'Nehemías', abbreviation: 'Neh', chapters: 13, testament: 'old', category: 'Historia', order: 16 },
  { id: 'EST', name: 'Ester', abbreviation: 'Est', chapters: 10, testament: 'old', category: 'Historia', order: 17 },

  // Libros Poéticos/Sabiduría
  { id: 'JOB', name: 'Job', abbreviation: 'Job', chapters: 42, testament: 'old', category: 'Sabiduría', order: 18 },
  { id: 'PSA', name: 'Salmos', abbreviation: 'Sal', chapters: 150, testament: 'old', category: 'Sabiduría', order: 19 },
  { id: 'PRO', name: 'Proverbios', abbreviation: 'Pro', chapters: 31, testament: 'old', category: 'Sabiduría', order: 20 },
  { id: 'ECC', name: 'Eclesiastés', abbreviation: 'Ecl', chapters: 12, testament: 'old', category: 'Sabiduría', order: 21 },
  { id: 'SNG', name: 'Cantares', abbreviation: 'Cnt', chapters: 8, testament: 'old', category: 'Sabiduría', order: 22 },

  // Profetas Mayores
  { id: 'ISA', name: 'Isaías', abbreviation: 'Isa', chapters: 66, testament: 'old', category: 'Profetas Mayores', order: 23 },
  { id: 'JER', name: 'Jeremías', abbreviation: 'Jer', chapters: 52, testament: 'old', category: 'Profetas Mayores', order: 24 },
  { id: 'LAM', name: 'Lamentaciones', abbreviation: 'Lam', chapters: 5, testament: 'old', category: 'Profetas Mayores', order: 25 },
  { id: 'EZK', name: 'Ezequiel', abbreviation: 'Eze', chapters: 48, testament: 'old', category: 'Profetas Mayores', order: 26 },
  { id: 'DAN', name: 'Daniel', abbreviation: 'Dan', chapters: 12, testament: 'old', category: 'Profetas Mayores', order: 27 },

  // Profetas Menores
  { id: 'HOS', name: 'Oseas', abbreviation: 'Ose', chapters: 14, testament: 'old', category: 'Profetas Menores', order: 28 },
  { id: 'JOL', name: 'Joel', abbreviation: 'Jol', chapters: 3, testament: 'old', category: 'Profetas Menores', order: 29 },
  { id: 'AMO', name: 'Amós', abbreviation: 'Amó', chapters: 9, testament: 'old', category: 'Profetas Menores', order: 30 },
  { id: 'OBA', name: 'Abdías', abbreviation: 'Abd', chapters: 1, testament: 'old', category: 'Profetas Menores', order: 31 },
  { id: 'JON', name: 'Jonás', abbreviation: 'Jon', chapters: 4, testament: 'old', category: 'Profetas Menores', order: 32 },
  { id: 'MIC', name: 'Miqueas', abbreviation: 'Miq', chapters: 7, testament: 'old', category: 'Profetas Menores', order: 33 },
  { id: 'NAM', name: 'Nahúm', abbreviation: 'Nah', chapters: 3, testament: 'old', category: 'Profetas Menores', order: 34 },
  { id: 'HAB', name: 'Habacuc', abbreviation: 'Hab', chapters: 3, testament: 'old', category: 'Profetas Menores', order: 35 },
  { id: 'ZEP', name: 'Sofonías', abbreviation: 'Sof', chapters: 3, testament: 'old', category: 'Profetas Menores', order: 36 },
  { id: 'HAG', name: 'Hageo', abbreviation: 'Hag', chapters: 2, testament: 'old', category: 'Profetas Menores', order: 37 },
  { id: 'ZEC', name: 'Zacarías', abbreviation: 'Zac', chapters: 14, testament: 'old', category: 'Profetas Menores', order: 38 },
  { id: 'MAL', name: 'Malaquías', abbreviation: 'Mal', chapters: 4, testament: 'old', category: 'Profetas Menores', order: 39 },

  // NUEVO TESTAMENTO
  // Evangelios
  { id: 'MAT', name: 'Mateo', abbreviation: 'Mat', chapters: 28, testament: 'new', category: 'Evangelios', order: 40 },
  { id: 'MRK', name: 'Marcos', abbreviation: 'Mar', chapters: 16, testament: 'new', category: 'Evangelios', order: 41 },
  { id: 'LUK', name: 'Lucas', abbreviation: 'Luc', chapters: 24, testament: 'new', category: 'Evangelios', order: 42 },
  { id: 'JHN', name: 'Juan', abbreviation: 'Jua', chapters: 21, testament: 'new', category: 'Evangelios', order: 43 },

  // Hechos
  { id: 'ACT', name: 'Hechos', abbreviation: 'Hch', chapters: 28, testament: 'new', category: 'Historia', order: 44 },

  // Cartas de Pablo
  { id: 'ROM', name: 'Romanos', abbreviation: 'Rom', chapters: 16, testament: 'new', category: 'Epístolas Paulinas', order: 45 },
  { id: '1CO', name: '1 Corintios', abbreviation: '1Co', chapters: 16, testament: 'new', category: 'Epístolas Paulinas', order: 46 },
  { id: '2CO', name: '2 Corintios', abbreviation: '2Co', chapters: 13, testament: 'new', category: 'Epístolas Paulinas', order: 47 },
  { id: 'GAL', name: 'Gálatas', abbreviation: 'Gál', chapters: 6, testament: 'new', category: 'Epístolas Paulinas', order: 48 },
  { id: 'EPH', name: 'Efesios', abbreviation: 'Efe', chapters: 6, testament: 'new', category: 'Epístolas Paulinas', order: 49 },
  { id: 'PHP', name: 'Filipenses', abbreviation: 'Fil', chapters: 4, testament: 'new', category: 'Epístolas Paulinas', order: 50 },
  { id: 'COL', name: 'Colosenses', abbreviation: 'Col', chapters: 4, testament: 'new', category: 'Epístolas Paulinas', order: 51 },
  { id: '1TH', name: '1 Tesalonicenses', abbreviation: '1Ts', chapters: 5, testament: 'new', category: 'Epístolas Paulinas', order: 52 },
  { id: '2TH', name: '2 Tesalonicenses', abbreviation: '2Ts', chapters: 3, testament: 'new', category: 'Epístolas Paulinas', order: 53 },
  { id: '1TI', name: '1 Timoteo', abbreviation: '1Ti', chapters: 6, testament: 'new', category: 'Epístolas Pastorales', order: 54 },
  { id: '2TI', name: '2 Timoteo', abbreviation: '2Ti', chapters: 4, testament: 'new', category: 'Epístolas Pastorales', order: 55 },
  { id: 'TIT', name: 'Tito', abbreviation: 'Tit', chapters: 3, testament: 'new', category: 'Epístolas Pastorales', order: 56 },
  { id: 'PHM', name: 'Filemón', abbreviation: 'Flm', chapters: 1, testament: 'new', category: 'Epístolas Paulinas', order: 57 },

  // Cartas Generales
  { id: 'HEB', name: 'Hebreos', abbreviation: 'Heb', chapters: 13, testament: 'new', category: 'Epístolas Generales', order: 58 },
  { id: 'JAS', name: 'Santiago', abbreviation: 'Stg', chapters: 5, testament: 'new', category: 'Epístolas Generales', order: 59 },
  { id: '1PE', name: '1 Pedro', abbreviation: '1Pe', chapters: 5, testament: 'new', category: 'Epístolas Generales', order: 60 },
  { id: '2PE', name: '2 Pedro', abbreviation: '2Pe', chapters: 3, testament: 'new', category: 'Epístolas Generales', order: 61 },
  { id: '1JN', name: '1 Juan', abbreviation: '1Jn', chapters: 5, testament: 'new', category: 'Epístolas Generales', order: 62 },
  { id: '2JN', name: '2 Juan', abbreviation: '2Jn', chapters: 1, testament: 'new', category: 'Epístolas Generales', order: 63 },
  { id: '3JN', name: '3 Juan', abbreviation: '3Jn', chapters: 1, testament: 'new', category: 'Epístolas Generales', order: 64 },
  { id: 'JUD', name: 'Judas', abbreviation: 'Jud', chapters: 1, testament: 'new', category: 'Epístolas Generales', order: 65 },

  // Apocalipsis
  { id: 'REV', name: 'Apocalipsis', abbreviation: 'Apo', chapters: 22, testament: 'new', category: 'Profecía', order: 66 },
];

// Mapping from book ID to Spanish book name used in biblia_spanish.json
export const BOOK_ID_TO_SPANISH_NAME: { [key: string]: string } = {
  'GEN': 'Génesis',
  'EXO': 'Éxodo',
  'LEV': 'Levítico',
  'NUM': 'Números',
  'DEU': 'Deuteronomio',
  'JOS': 'Josué',
  'JDG': 'Jueces',
  'RUT': 'Rut',
  '1SA': '1 Samuel',
  '2SA': '2 Samuel',
  '1KI': '1 Reyes',
  '2KI': '2 Reyes',
  '1CH': '1 Crónicas',
  '2CH': '2 Crónicas',
  'EZR': 'Esdras',
  'NEH': 'Nehemías',
  'EST': 'Ester',
  'JOB': 'Job',
  'PSA': 'Salmos',
  'PRO': 'Proverbios',
  'ECC': 'Eclesiastés',
  'SNG': 'Cantares',
  'ISA': 'Isaías',
  'JER': 'Jeremías',
  'LAM': 'Lamentaciones',
  'EZK': 'Ezequiel',
  'DAN': 'Daniel',
  'HOS': 'Oseas',
  'JOL': 'Joel',
  'AMO': 'Amós',
  'OBA': 'Abdías',
  'JON': 'Jonás',
  'MIC': 'Miqueas',
  'NAM': 'Nahúm',
  'HAB': 'Habacuc',
  'ZEP': 'Sofonías',
  'HAG': 'Hageo',
  'ZEC': 'Zacarías',
  'MAL': 'Malaquías',
  'MAT': 'S. Mateo',
  'MRK': 'S. Marcos',
  'LUK': 'S. Lucas',
  'JHN': 'S.Juan',
  'ACT': 'Hechos',
  'ROM': 'Romanos',
  '1CO': '1 Corintios',
  '2CO': '2 Corintios',
  'GAL': 'Gálatas',
  'EPH': 'Efesios',
  'PHP': 'Filipenses',
  'COL': 'Colosenses',
  '1TH': '1 Tesalonicenses',
  '2TH': '2 Tesalonicenses',
  '1TI': '1 Timoteo',
  '2TI': '2 Timoteo',
  'TIT': 'Tito',
  'PHM': 'Filemón',
  'HEB': 'Hebreos',
  'JAS': 'Santiago',
  '1PE': '1 Pedro',
  '2PE': '2 Pedro',
  '1JN': '1 Juan',
  '2JN': '2 Juan',
  '3JN': '3 Juan',
  'JUD': 'Judas',
  'REV': 'Apocalipsis',
};

export const OLD_TESTAMENT_BOOKS = BIBLE_BOOKS.filter(book => book.testament === 'old');
export const NEW_TESTAMENT_BOOKS = BIBLE_BOOKS.filter(book => book.testament === 'new');

export const BOOK_CATEGORIES = {
  'Ley': OLD_TESTAMENT_BOOKS.filter(book => book.category === 'Ley'),
  'Historia': BIBLE_BOOKS.filter(book => book.category === 'Historia'),
  'Sabiduría': OLD_TESTAMENT_BOOKS.filter(book => book.category === 'Sabiduría'),
  'Profetas Mayores': OLD_TESTAMENT_BOOKS.filter(book => book.category === 'Profetas Mayores'),
  'Profetas Menores': OLD_TESTAMENT_BOOKS.filter(book => book.category === 'Profetas Menores'),
  'Evangelios': NEW_TESTAMENT_BOOKS.filter(book => book.category === 'Evangelios'),
  'Epístolas Paulinas': NEW_TESTAMENT_BOOKS.filter(book => book.category === 'Epístolas Paulinas'),
  'Epístolas Pastorales': NEW_TESTAMENT_BOOKS.filter(book => book.category === 'Epístolas Pastorales'),
  'Epístolas Generales': NEW_TESTAMENT_BOOKS.filter(book => book.category === 'Epístolas Generales'),
  'Profecía': NEW_TESTAMENT_BOOKS.filter(book => book.category === 'Profecía'),
};

// Helper functions
export const getBookById = (id: string): BibleBookInfo | undefined => {
  return BIBLE_BOOKS.find(book => book.id === id);
};

export const getBooksByTestament = (testament: 'old' | 'new'): BibleBookInfo[] => {
  return BIBLE_BOOKS.filter(book => book.testament === testament);
};

export const getBooksByCategory = (category: string): BibleBookInfo[] => {
  return BIBLE_BOOKS.filter(book => book.category === category);
};

export const searchBooks = (query: string): BibleBookInfo[] => {
  const lowercaseQuery = query.toLowerCase();
  return BIBLE_BOOKS.filter(book =>
    book.name.toLowerCase().includes(lowercaseQuery) ||
    book.abbreviation.toLowerCase().includes(lowercaseQuery)
  );
};
