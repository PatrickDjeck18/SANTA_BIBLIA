/**
 * Spanish Translations for Daily Bread App
 */

export const Translations = {
    // Common
    loading: 'Cargando...',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    done: 'Hecho',
    search: 'Buscar',
    share: 'Compartir',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    yes: 'Sí',
    no: 'No',
    ok: 'OK',
    error: 'Error',
    success: 'Éxito',

    // Navigation / Tabs
    home: 'Inicio',
    bible: 'Biblia',
    prayer: 'Oración',
    mood: 'Ánimo',
    profile: 'Perfil',
    quiz: 'Juego',

    // Home Screen
    connectWithGod: 'Conecta con Dios',
    dailyDevotional: 'DEVOCIONAL DIARIO',
    dailyQuote: 'Cita del Día',
    todaysQuoteFrom: 'CITA DE HOY DE:',
    todaysPrayer: '🙏 ORACIÓN DE HOY',
    passage: 'Pasaje',
    bibleStudyNotes: 'Notas de Estudio Bíblico',
    moodCheckin: 'Estado de Ánimo',
    goAdFree: 'Sin Anuncios',
    enjoyWithoutInterruptions: 'Disfruta sin interrupciones',
    removeAds: 'Quitar Anuncios',

    // Bible Screen
    holyBible: 'Santa Biblia',
    searchResults: 'Resultados de Búsqueda',
    chapters: 'capítulos',
    chaptersAvailable: 'Capítulos Disponibles',
    startReading: 'Comenzar a Leer',
    tapToHighlight: 'Toca cualquier versículo para resaltar o añadir notas',
    noResultsFound: 'No se encontraron resultados',
    tryDifferentSearch: 'Intenta con un término diferente',
    searching: 'Buscando...',
    oldTestament: 'Antiguo Testamento',
    newTestament: 'Nuevo Testamento',
    all: 'Todos',

    // Prayer Tracker
    prayerTracker: 'Seguimiento de Oración',
    addPrayer: 'Añadir Oración',
    myPrayers: 'Mis Oraciones',
    answeredPrayers: 'Oraciones Respondidas',
    prayerJournal: 'Diario de Oración',
    noPrayers: 'Aún no tienes oraciones',
    addFirstPrayer: 'Añade tu primera oración',

    // Mood Tracker
    moodTracker: 'Estado de Ánimo',
    howAreYouFeeling: '¿Cómo te sientes hoy?',
    logMood: 'Registrar Estado',
    moodHistory: 'Historial',
    grateful: 'Agradecido',
    happy: 'Feliz',
    peaceful: 'En paz',
    anxious: 'Ansioso',
    sad: 'Triste',
    angry: 'Enojado',

    // Profile
    settings: 'Configuración',
    notifications: 'Notificaciones',
    privacyPolicy: 'Política de Privacidad',
    termsOfService: 'Términos de Servicio',
    logout: 'Cerrar Sesión',
    version: 'Versión',

    // Quiz/Game
    bibleQuiz: 'Juego Bíblico',
    startGame: 'Comenzar',
    level: 'Nivel',
    score: 'Puntuación',
    correct: '¡Correcto!',
    incorrect: 'Incorrecto',
    tryAgain: 'Intentar de Nuevo',

    // Onboarding
    welcome: 'Bienvenido',
    getStarted: 'Comenzar',
    skip: 'Saltar',

    // Days of Week
    monday: 'L',
    tuesday: 'M',
    wednesday: 'X',
    thursday: 'J',
    friday: 'V',
    saturday: 'S',
    sunday: 'D',

    // Book Categories
    law: 'Ley',
    history: 'Historia',
    wisdom: 'Sabiduría',
    majorProphets: 'Profetas Mayores',
    minorProphets: 'Profetas Menores',
    gospels: 'Evangelios',
    paulineEpistles: 'Epístolas Paulinas',
    pastoralEpistles: 'Epístolas Pastorales',
    generalEpistles: 'Epístolas Generales',
    prophecy: 'Profecía',
};

// Simple translation helper function
export function t(key: keyof typeof Translations): string {
    return Translations[key] || key;
}

export default Translations;
