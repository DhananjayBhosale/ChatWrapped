import { Message, AnalysisResult, UserStat, ParseResult, DailyActivity } from '../types';

// Regex for: dd/mm/yy, HH:MM - Sender: Message
const MESSAGE_REGEX = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s(.*?):\s(.*)$/;
const SYSTEM_REGEX = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s(.*?)$/;
const EMOJI_REGEX = /\p{Emoji_Presentation}/gu;

// Extended Color Palette for Group Chats
const COLORS = [
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#eab308', // Yellow
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
  '#0ea5e9', // Sky
  '#f97316', // Orange
];

export const parseChatFile = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        resolve({ messages: [], status: 'error', error: 'File is empty' });
        return;
      }

      const lines = text.split(/\r?\n/);
      const messages: Message[] = [];
      let lastMessage: Message | null = null;

      for (const line of lines) {
        // Fix for Left-to-Right marks
        const cleanLine = line.replace(/[\u200e\u200f]/g, "");
        
        const match = cleanLine.match(MESSAGE_REGEX);

        if (match) {
          const dateStr = match[1];
          const timeStr = match[2];
          const sender = match[3];
          const content = match[4];

          // System messages check
          if (content.includes('end-to-end encrypted') || sender === 'WhatsApp') {
            continue;
          }

          // Parse Date
          const [day, month, yearPart] = dateStr.split('/').map(Number);
          const [hours, minutes] = timeStr.split(':').map(Number);
          const year = yearPart < 100 ? 2000 + yearPart : yearPart;
          const date = new Date(year, month - 1, day, hours, minutes);

          const newMessage: Message = { date, sender, content };
          messages.push(newMessage);
          lastMessage = newMessage;
        } else if (lastMessage) {
          const systemMatch = cleanLine.match(SYSTEM_REGEX);
          if (!systemMatch) {
            lastMessage.content += `\n${cleanLine}`;
          }
        }
      }

      resolve({ messages, status: 'success' });
    };

    reader.onerror = () => {
      resolve({ messages: [], status: 'error', error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
};

export const analyzeMessages = (messages: Message[], yearFilter?: number): AnalysisResult => {
  const filteredMessages = yearFilter 
    ? messages.filter(m => m.date.getFullYear() === yearFilter)
    : messages;

  if (filteredMessages.length === 0) {
    return {
      totalMessages: 0,
      dateRange: { start: new Date(), end: new Date() },
      users: [],
      activeUsersCount: 0,
      longestStreak: 0,
      mostActiveDate: { date: '', count: 0 },
      busiestHour: 0,
      topStarter: '',
      timeline: [],
      hourlyHeatmap: [],
      yearOptions: [],
      rapidFire: { maxInMinute: 0, maxInHour: 0, maxInDay: 0 }
    };
  }

  // --- Basics ---
  const totalMessages = filteredMessages.length;
  const dateRange = {
    start: filteredMessages[0].date,
    end: filteredMessages[filteredMessages.length - 1].date
  };

  // --- Aggregation Structures ---
  const userMap = new Map<string, { count: number; words: number; emojis: Map<string, number> }>();
  const hourlyCounts = new Array(24).fill(0);
  
  // Maps for Rapid Fire
  const msgsPerMinute = new Map<string, number>(); // Key: YYYY-MM-DD HH:mm
  const msgsPerHourSpecific = new Map<string, number>(); // Key: YYYY-MM-DD HH
  const dailyTotalCounts = new Map<string, number>(); // Key: YYYY-MM-DD

  // Stacked timeline: Date -> User -> Count
  const dailyBreakdown = new Map<string, Map<string, number>>();

  const startersMap = new Map<string, number>();
  let lastMsgTime = 0;

  const processEmojis = (text: string, map: Map<string, number>) => {
    const matches = text.match(EMOJI_REGEX);
    if (matches) {
      matches.forEach(emoji => {
        map.set(emoji, (map.get(emoji) || 0) + 1);
      });
    }
  };

  filteredMessages.forEach((msg, index) => {
    // User Stats
    if (!userMap.has(msg.sender)) {
      userMap.set(msg.sender, { count: 0, words: 0, emojis: new Map() });
    }
    const uStat = userMap.get(msg.sender)!;
    uStat.count++;
    uStat.words += msg.content.trim().split(/\s+/).length;
    processEmojis(msg.content, uStat.emojis);

    // Hourly Aggregate (0-23)
    const hour = msg.date.getHours();
    hourlyCounts[hour]++;

    // Time Keys
    const isoString = msg.date.toISOString();
    const dateKey = isoString.split('T')[0];
    const hourKey = isoString.substring(0, 13); // YYYY-MM-DDTHH
    const minKey = isoString.substring(0, 16); // YYYY-MM-DDTHH:mm

    // Rapid Fire Counts
    dailyTotalCounts.set(dateKey, (dailyTotalCounts.get(dateKey) || 0) + 1);
    msgsPerHourSpecific.set(hourKey, (msgsPerHourSpecific.get(hourKey) || 0) + 1);
    msgsPerMinute.set(minKey, (msgsPerMinute.get(minKey) || 0) + 1);

    // Breakdown for stacked chart
    if (!dailyBreakdown.has(dateKey)) {
      dailyBreakdown.set(dateKey, new Map());
    }
    const dayMap = dailyBreakdown.get(dateKey)!;
    dayMap.set(msg.sender, (dayMap.get(msg.sender) || 0) + 1);

    // Conversation Starter (Gap > 6 hours)
    const msgTime = msg.date.getTime();
    if (index === 0 || (msgTime - lastMsgTime > 6 * 60 * 60 * 1000)) {
      startersMap.set(msg.sender, (startersMap.get(msg.sender) || 0) + 1);
    }
    lastMsgTime = msgTime;
  });

  // --- Calculate Maxima ---
  let maxDaily = 0;
  let activeDate = '';
  dailyTotalCounts.forEach((count, date) => {
    if (count > maxDaily) {
      maxDaily = count;
      activeDate = date;
    }
  });

  let maxInMinute = 0;
  msgsPerMinute.forEach(c => { if (c > maxInMinute) maxInMinute = c; });

  let maxInHour = 0;
  msgsPerHourSpecific.forEach(c => { if (c > maxInHour) maxInHour = c; });

  // --- Finalize User Stats ---
  const sortedUserNames = Array.from(userMap.keys()).sort((a, b) => userMap.get(b)!.count - userMap.get(a)!.count);

  const users: UserStat[] = sortedUserNames.map((name, index) => {
    const stats = userMap.get(name)!;
    const sortedEmojis = Array.from(stats.emojis.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([char, count]) => ({ char, count }));

    return {
      name,
      messageCount: stats.count,
      wordCount: stats.words,
      avgLength: Math.round(stats.words / stats.count),
      emojis: sortedEmojis,
      color: COLORS[index % COLORS.length]
    };
  });

  // --- Construct Timeline Data for Stacked Chart ---
  const top5Users = new Set(sortedUserNames.slice(0, 5));
  
  const timeline: DailyActivity[] = Array.from(dailyBreakdown.keys()).sort().map(dateKey => {
    const dayMap = dailyBreakdown.get(dateKey)!;
    const entry: DailyActivity = { date: dateKey, count: dailyTotalCounts.get(dateKey) || 0 };
    
    dayMap.forEach((count, user) => {
      if (top5Users.has(user)) {
        entry[user] = count;
      } else {
        entry['Others'] = (entry['Others'] as number || 0) + count;
      }
    });
    return entry;
  });

  // --- Streak Calculation ---
  let currentStreak = 0;
  let maxStreak = 0;
  let prevDateStr = '';
  const sortedDates = Array.from(dailyTotalCounts.keys()).sort();

  sortedDates.forEach((dateStr) => {
    if (prevDateStr) {
      const prev = new Date(prevDateStr);
      const curr = new Date(dateStr);
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays <= 1.5) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    if (currentStreak > maxStreak) maxStreak = currentStreak;
    prevDateStr = dateStr;
  });

  // --- Busiest Hour of Day (Aggregate) ---
  let maxHourly = -1;
  let busyHourIndex = 0;
  hourlyCounts.forEach((count, idx) => {
    if (count > maxHourly) {
      maxHourly = count;
      busyHourIndex = idx;
    }
  });

  // --- Starter Winner ---
  let maxStarts = -1;
  let topStarter = users[0]?.name || 'Unknown';
  startersMap.forEach((count, name) => {
    if (count > maxStarts) {
      maxStarts = count;
      topStarter = name;
    }
  });

  const years = new Set(messages.map(m => m.date.getFullYear()));

  return {
    totalMessages,
    dateRange,
    users,
    activeUsersCount: users.length,
    longestStreak: maxStreak,
    mostActiveDate: { date: activeDate, count: maxDaily },
    busiestHour: busyHourIndex,
    topStarter,
    timeline,
    hourlyHeatmap: hourlyCounts.map((count, hour) => ({ hour, count })),
    yearOptions: Array.from(years).sort().reverse(),
    rapidFire: {
        maxInMinute,
        maxInHour,
        maxInDay: maxDaily
    }
  };
};