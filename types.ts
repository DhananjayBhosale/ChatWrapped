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
  // New Global Stats
  dayNightSplit: { day: number; night: number }; // Day: 6am-6pm, Night: 6pm-6am
  wordOccurrences: Record<string, Record<string, number>>; // word -> { UserA: 5, UserB: 2 }
}

export interface ParseResult {
  messages: Message[];
  status: 'success' | 'error';
  error?: string;
}