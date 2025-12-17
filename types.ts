export interface Message {
  date: Date;
  sender: string;
  content: string;
}

export interface WordCount {
  word: string;
  count: number;
}

export interface UserStat {
  name: string;
  messageCount: number;
  wordCount: number;
  avgLength: number;
  emojis: { char: string; count: number }[];
  color: string;
  // New Stats
  topWords: WordCount[];
  avgReplyTimeMinutes: number;
  morningCount: number; // 4am - 12pm
  nightCount: number;   // 8pm - 4am
  byeCount: number;     // "bye", "gn"
  textMessageCount: number; // Msgs without emojis
  emojiMessageCount: number; // Msgs with emojis
  mediaMessageCount: number; // Images, videos, stickers
  shortMessageCount: number; // <= 3 words
  longMessageCount: number;  // >= 12 words
  oneSidedConversationsCount: number; // Days where user sent >80% of msgs
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
  [key: string]: number | string;
}

export interface RapidFireStats {
  maxInMinute: number;
  maxInHour: number;
  maxInDay: number;
}

export interface AnalysisResult {
  totalMessages: number;
  messages: Message[]; // Added for search functionality
  dateRange: { start: Date; end: Date };
  users: UserStat[];
  activeUsersCount: number;
  longestStreak: number;
  mostActiveDate: { date: string; count: number };
  busiestHour: number;
  topStarter: string;
  timeline: DailyActivity[];
  hourlyHeatmap: HourlyActivity[];
  yearOptions: number[];
  rapidFire: RapidFireStats;
  // Global Stats
  dayNightSplit: { day: number; night: number }; 
  wordOccurrences: Record<string, Record<string, number>>;
  
  // New Offline Insights
  dayOfWeekStats: number[]; // 0=Sun, 1=Mon...
  longestMessage: {
    content: string;
    sender: string;
    date: Date;
    wordCount: number;
  };
  burstStats: {
    count: number; // Number of bursts
    maxBurst: number; // Max messages in a burst
  };
  mostRepeatedPhrase: {
    phrase: string;
    count: number;
    topUser: string;
  } | null;
  silenceBreaker: {
    name: string;
    maxSilenceHours: number;
  };
  silenceBreakCounts: Record<string, number>;
}

export interface ParseResult {
  messages: Message[];
  status: 'success' | 'error';
  error?: string;
}