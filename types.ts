export interface Message {
  date: Date;
  sender: string;
  content: string;
}

export interface UserStat {
  name: string;
  messageCount: number;
  wordCount: number;
  avgLength: number;
  emojis: { char: string; count: number }[];
  color: string;
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
  [key: string]: number | string; // Allow dynamic keys for user counts (e.g., "Alice": 10)
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
}

export interface ParseResult {
  messages: Message[];
  status: 'success' | 'error';
  error?: string;
}