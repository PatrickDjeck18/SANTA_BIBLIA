// Supabase is disabled - app uses local storage only
// This file provides a mock Supabase client that doesn't make network calls

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Supabase client that doesn't make network calls
const createMockClient = () => {
  const mockResponse = { data: null, error: { message: 'Supabase disabled - using local storage' } };
  const mockPromise = () => Promise.resolve(mockResponse);

  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => mockQueryBuilder,
    update: () => mockQueryBuilder,
    delete: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    neq: () => mockQueryBuilder,
    gt: () => mockQueryBuilder,
    gte: () => mockQueryBuilder,
    lt: () => mockQueryBuilder,
    lte: () => mockQueryBuilder,
    like: () => mockQueryBuilder,
    ilike: () => mockQueryBuilder,
    is: () => mockQueryBuilder,
    in: () => mockQueryBuilder,
    contains: () => mockQueryBuilder,
    containedBy: () => mockQueryBuilder,
    match: () => mockQueryBuilder,
    not: () => mockQueryBuilder,
    or: () => mockQueryBuilder,
    filter: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    limit: () => mockQueryBuilder,
    range: () => mockQueryBuilder,
    single: () => mockPromise(),
    maybeSingle: () => mockPromise(),
    then: (resolve: any) => resolve(mockResponse),
  };

  const mockAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Auth disabled' } }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Auth disabled' } }),
    signOut: () => Promise.resolve({ error: null }),
    signInWithOtp: () => Promise.resolve({ error: { message: 'Auth disabled' } }),
    verifyOtp: () => Promise.resolve({ data: null, error: { message: 'Auth disabled' } }),
    updateUser: () => Promise.resolve({ data: null, error: { message: 'Auth disabled' } }),
    setSession: () => Promise.resolve({ data: null, error: null }),
    onAuthStateChange: (_callback: any) => ({
      data: { subscription: { unsubscribe: () => { } } },
    }),
  };

  const mockChannel = {
    on: () => mockChannel,
    subscribe: () => ({ unsubscribe: () => { } }),
    unsubscribe: () => { },
  };

  return {
    from: (_table: string) => mockQueryBuilder,
    rpc: () => mockPromise(),
    auth: mockAuth,
    channel: () => mockChannel,
    removeChannel: () => Promise.resolve({ error: null }),
    removeAllChannels: () => Promise.resolve([]),
    getChannels: () => [],
    storage: {
      from: () => ({
        upload: () => mockPromise(),
        download: () => mockPromise(),
        remove: () => mockPromise(),
        list: () => mockPromise(),
      }),
    },
  };
};

export const supabase = createMockClient() as any;

// Database types - kept for compatibility
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  journey_start_date: string;
  current_streak: number;
  total_prayers: number;
  total_bible_readings: number;
  created_at: string;
  updated_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  bible_reading_minutes: number;
  prayer_minutes: number;
  devotional_completed: boolean;
  mood_rating: number | null;
  activities_completed: number;
  goal_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  entry_date: string;
  mood_id: string;
  mood_type: string;
  intensity_rating: number;
  emoji: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoodInfluence {
  id: string;
  mood_entry_id: string;
  influence_name: string;
  influence_category: string;
  created_at: string;
}

export interface MoodAnalytics {
  user_id: string;
  entry_date: string;
  mood_type: string;
  intensity_rating: number;
  emoji: string;
  note: string | null;
  influences: string[];
  influence_categories: string[];
}

export interface Prayer {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'active' | 'answered' | 'paused' | 'archived';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  category: 'personal' | 'family' | 'health' | 'work' | 'spiritual' | 'community' | 'world' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_shared: boolean;
  is_community: boolean;
  answered_at: string | null;
  answered_notes: string | null;
  prayer_notes: string | null;
  gratitude_notes: string | null;
  reminder_time: string | null;
  reminder_frequency: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  last_prayed_at: string | null;
  prayer_count: number;
  answered_prayer_count: number;
  created_at: string;
  updated_at: string;
}

export interface BibleVerse {
  id: string;
  reference: string;
  text: string;
  is_daily_verse: boolean;
  date_featured: string | null;
  created_at: string;
}

export interface Devotional {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  reading_time_minutes: number;
  category: string;
  views_count: number;
  likes_count: number;
  is_featured: boolean;
  featured_date: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  testament: 'old' | 'new';
  book_reference: string | null;
  verse_reference: string | null;
  created_at: string;
}

export interface QuizSession {
  id: string;
  user_id: string;
  questions_answered: number;
  correct_answers: number;
  wrong_answers: number;
  total_score: number;
  category: string;
  difficulty: string;
  time_taken_seconds: number;
  completed_at: string | null;
  created_at: string;
}

export interface UserQuizStats {
  id: string;
  user_id: string;
  total_sessions: number;
  total_questions_answered: number;
  total_correct_answers: number;
  best_score: number;
  current_streak: number;
  longest_streak: number;
  favorite_category: string;
  total_time_spent_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface VerseLike {
  id: string;
  user_id: string | null;
  session_id: string | null;
  verse_reference: string;
  verse_text: string;
  like_date: string;
  created_at: string;
}