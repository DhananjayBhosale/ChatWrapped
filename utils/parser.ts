import { Message, AnalysisResult, UserStat, ParseResult } from '../types';

// Regex for Android: dd/mm/yy, HH:MM - Sender: Message
const ANDROID_MESSAGE_REGEX = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s(.*?):\s(.*)$/;
const ANDROID_SYSTEM_REGEX = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s(.*?)$/;

// Regex for iOS: [dd/mm/yy, HH:MM:SS AM] Sender: Message
const IOS_MESSAGE_REGEX = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?)(?:[\s\u202F]?([APap][Mm]))?\]\s(.*?):\s(.*)$/;
const IOS_SYSTEM_REGEX = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?)(?:[\s\u202F]?([APap][Mm]))?\]\s(.*?)$/;

const EMOJI_REGEX = /\p{Emoji_Presentation}/gu;

// Common Stop Words to filter out
const STOP_WORDS = new Set([
  'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us', 'is', 'are', 'was', 'were', 'has', 'had', 'been', 'ok', 'okay', 'lol', 'haha', 'yeah', 'yes', 'hey', 'hi', 'hello', 'omg', 'did', 'done', 'too', 'very', 'much', 'really', 'got', 'don', 'dont', 'didnt', 'can', 'cant', 'cannot', 'image', 'omitted', 'audio', 'video', 'gif', 'sticker', 'pm', 'am'
]);

// Extended Color Palette
const COLORS = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e', 
  '#3b82f6', '#a855f7', '#eab308', '#14b8a6', '#6366f1', '#ef4444'
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
        const cleanLine = line.replace(/[\u200e\u200f]/g, "");
        
        let date: Date | null = null;
        let sender = '';
        let content = '';

        const androidMatch = cleanLine.match(ANDROID_MESSAGE_REGEX);
        if (androidMatch) {
          const [day, month, yearPart] = androidMatch[1].split('/').map(Number);
          const [hours, minutes] = androidMatch[2].split(':').map(Number);
          const year = yearPart < 100 ? 2000 + yearPart : yearPart;
          date = new Date(year, month - 1, day, hours, minutes);
          sender = androidMatch[3];
          content = androidMatch[4];
        } else {
          const iosMatch = cleanLine.match(IOS_MESSAGE_REGEX);
          if (iosMatch) {
            const [day, month, yearPart] = iosMatch[1].split('/').map(Number);
            let [hours, minutes] = iosMatch[2].split(':').map(Number);
            const year = yearPart < 100 ? 2000 + yearPart : yearPart;
            
            if (iosMatch[3]) {
              const isPM = iosMatch[3].toUpperCase() === 'PM';
              if (isPM && hours < 12) hours += 12;
              if (!isPM && hours === 12) hours = 0;
            }
            date = new Date(year, month - 1, day, hours, minutes);
            sender = iosMatch[4];
            content = iosMatch[5];
          }
        }

        if (date && sender && content) {
          if (content.includes('end-to-end encrypted') || sender === 'WhatsApp') continue;
          const newMessage: Message = { date, sender, content };
          messages.push(newMessage);
          lastMessage = newMessage;
        } else if (lastMessage && !ANDROID_SYSTEM_REGEX.test(cleanLine) && !IOS_SYSTEM_REGEX.test(cleanLine)) {
          lastMessage.content += `\n${cleanLine}`;
        }
      }
      resolve({ messages, status: 'success' });
    };
    reader.onerror = () => resolve({ messages: [], status: 'error', error: 'Failed to read file' });
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
      rapidFire: { maxInMinute: 0, maxInHour: 0, maxInDay: 0 },
      dayNightSplit: { day: 0, night: 0 },
      wordOccurrences: {},
      dayOfWeekStats: [0,0,0,0,0,0,0],
      longestMessage: { content: '', sender: '', date: new Date(), wordCount: 0 },
      burstStats: { count: 0, maxBurst: 0 },
      mostRepeatedPhrase: null,
      silenceBreaker: { name: '', maxSilenceHours: 0 }
    };
  }

  // Structures
  const userMap = new Map<string, { 
    count: number; 
    words: number; 
    emojis: Map<string, number>;
    wordFreq: Map<string, number>;
    replyTimes: number[];
    morningCount: number;
    nightCount: number;
    byeCount: number;
    textOnlyCount: number;
    emojiMsgCount: number;
    shortMessageCount: number;
    longMessageCount: number;
    oneSidedCount: number;
  }>();

  const hourlyCounts = new Array(24).fill(0);
  const dayOfWeekCounts = new Array(7).fill(0); // 0=Sun
  const msgsPerMinute = new Map<string, number>();
  const msgsPerHourSpecific = new Map<string, number>();
  const dailyTotalCounts = new Map<string, number>();
  const dailyBreakdown = new Map<string, Map<string, number>>();
  const startersMap = new Map<string, number>();
  const wordGlobalMap: Record<string, Record<string, number>> = {};
  const phraseMap = new Map<string, { count: number; users: Map<string, number> }>();
  
  // Stats vars
  let lastMsgTime = 0;
  let lastSender = '';
  let dayCount = 0;
  let nightCount = 0;
  let maxSilenceTime = 0;
  let currentBurst = 0;
  let maxBurst = 0;
  let burstCount = 0;

  let longestMsg = { content: '', sender: '', date: new Date(0), wordCount: 0 };

  // Helpers
  const GM_REGEX = /\b(gm|good\s*morn|morning|mrng)\b/i;
  const GN_REGEX = /\b(gn|good\s*night|night|nite)\b/i;
  const BYE_REGEX = /\b(bye|byee|tata|cya|see\s*ya)\b/i;

  filteredMessages.forEach((msg, index) => {
    // Initialize User
    if (!userMap.has(msg.sender)) {
      userMap.set(msg.sender, { 
        count: 0, words: 0, emojis: new Map(), wordFreq: new Map(),
        replyTimes: [], morningCount: 0, nightCount: 0, byeCount: 0,
        textOnlyCount: 0, emojiMsgCount: 0, shortMessageCount: 0, longMessageCount: 0,
        oneSidedCount: 0
      });
    }
    const uStat = userMap.get(msg.sender)!;
    const msgTime = msg.date.getTime();

    // Basic Stats
    uStat.count++;
    const tokens = msg.content.trim().split(/\s+/);
    const wordCount = tokens.length;
    uStat.words += wordCount;

    // Longest Message
    if (wordCount > longestMsg.wordCount) {
      longestMsg = { content: msg.content, sender: msg.sender, date: msg.date, wordCount };
    }

    // Length Classification
    if (wordCount <= 3) uStat.shortMessageCount++;
    if (wordCount >= 12) uStat.longMessageCount++;

    // Emoji Analysis
    const emojiMatches = msg.content.match(EMOJI_REGEX);
    if (emojiMatches) {
      uStat.emojiMsgCount++;
      emojiMatches.forEach(e => uStat.emojis.set(e, (uStat.emojis.get(e) || 0) + 1));
    } else {
      uStat.textOnlyCount++;
    }

    // Word & Phrase Analysis
    const cleanContent = msg.content.toLowerCase().replace(/[^\w\s']/g, ''); // keep apostrophes
    const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
    
    // Words
    words.forEach(w => {
      const cleanW = w.replace(/[']/g, '');
      if (cleanW.length > 2 && !STOP_WORDS.has(cleanW)) {
        uStat.wordFreq.set(cleanW, (uStat.wordFreq.get(cleanW) || 0) + 1);
        if (!wordGlobalMap[cleanW]) wordGlobalMap[cleanW] = {};
        wordGlobalMap[cleanW][msg.sender] = (wordGlobalMap[cleanW][msg.sender] || 0) + 1;
      }
    });

    // Bigram Phrases (2 words)
    // Only analyze if message is relatively short to avoid noise, or analyze all?
    // Let's analyze all but filter for stop words.
    for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i];
        const w2 = words[i+1];
        // At least one word must NOT be a stop word to be interesting
        if (!STOP_WORDS.has(w1) || !STOP_WORDS.has(w2)) {
            const phrase = `${w1} ${w2}`;
            if (!phraseMap.has(phrase)) {
                phraseMap.set(phrase, { count: 0, users: new Map() });
            }
            const pEntry = phraseMap.get(phrase)!;
            pEntry.count++;
            pEntry.users.set(msg.sender, (pEntry.users.get(msg.sender) || 0) + 1);
        }
    }

    // Specific Phrase Detection
    if (GM_REGEX.test(msg.content)) uStat.morningCount++;
    if (GN_REGEX.test(msg.content)) uStat.nightCount++;
    if (BYE_REGEX.test(msg.content)) uStat.byeCount++;

    // Burst Detection
    if (index > 0) {
        const timeDiff = msgTime - lastMsgTime;
        if (timeDiff < 60000) { // < 1 minute
            currentBurst++;
        } else {
            if (currentBurst > 5) {
                burstCount++;
                if (currentBurst > maxBurst) maxBurst = currentBurst;
            }
            currentBurst = 1;
        }
    } else {
        currentBurst = 1;
    }

    // Reply Time Logic
    if (lastSender && lastSender !== msg.sender) {
      const diffMinutes = (msgTime - lastMsgTime) / (1000 * 60);
      if (diffMinutes < 360) { // Only count replies within 6 hours
        uStat.replyTimes.push(diffMinutes);
      }
    }

    // Initiator / Silence Breaker Logic (Gap > 6 hours)
    if (index === 0 || (msgTime - lastMsgTime > 6 * 60 * 60 * 1000)) {
      startersMap.set(msg.sender, (startersMap.get(msg.sender) || 0) + 1);
      
      if (index > 0) {
          const silenceHours = (msgTime - lastMsgTime) / (1000 * 60 * 60);
          if (silenceHours > maxSilenceTime) maxSilenceTime = silenceHours;
      }
    }

    // Time Stats
    const hour = msg.date.getHours();
    hourlyCounts[hour]++;
    dayOfWeekCounts[msg.date.getDay()]++;
    if (hour >= 6 && hour < 18) dayCount++; else nightCount++;

    const isoString = msg.date.toISOString();
    const dateKey = isoString.split('T')[0];
    const hourKey = isoString.substring(0, 13);
    const minKey = isoString.substring(0, 16);

    dailyTotalCounts.set(dateKey, (dailyTotalCounts.get(dateKey) || 0) + 1);
    msgsPerHourSpecific.set(hourKey, (msgsPerHourSpecific.get(hourKey) || 0) + 1);
    msgsPerMinute.set(minKey, (msgsPerMinute.get(minKey) || 0) + 1);

    if (!dailyBreakdown.has(dateKey)) dailyBreakdown.set(dateKey, new Map());
    dailyBreakdown.get(dateKey)!.set(msg.sender, (dailyBreakdown.get(dateKey)!.get(msg.sender) || 0) + 1);

    lastMsgTime = msgTime;
    lastSender = msg.sender;
  });

  // Calculate One-Sided Days
  dailyBreakdown.forEach((userCounts, _date) => {
    const totalDay = Array.from(userCounts.values()).reduce((a, b) => a + b, 0);
    if (totalDay > 10) { // Threshold for significance
      userCounts.forEach((count, user) => {
        if ((count / totalDay) > 0.75) {
          if (userMap.has(user)) {
            userMap.get(user)!.oneSidedCount++;
          }
        }
      });
    }
  });

  // Find Top Phrase
  let topPhrase = null;
  let maxPhraseCount = 0;
  phraseMap.forEach((data, phrase) => {
      if (data.count > maxPhraseCount && data.count > 3) { // Threshold
          let topUser = '';
          let maxUserCount = 0;
          data.users.forEach((c, u) => { if(c > maxUserCount) { maxUserCount = c; topUser = u; }});
          
          maxPhraseCount = data.count;
          topPhrase = { phrase, count: data.count, topUser };
      }
  });


  // Calculate Maxima
  let maxDaily = 0;
  let activeDate = '';
  dailyTotalCounts.forEach((count, date) => {
    if (count > maxDaily) { maxDaily = count; activeDate = date; }
  });

  let maxInMinute = 0;
  msgsPerMinute.forEach(c => { if (c > maxInMinute) maxInMinute = c; });
  let maxInHour = 0;
  msgsPerHourSpecific.forEach(c => { if (c > maxInHour) maxInHour = c; });
  let busiestHourIndex = 0;
  let maxHourly = 0;
  hourlyCounts.forEach((c, i) => { if (c > maxHourly) { maxHourly = c; busiestHourIndex = i; }});

  // Finalize Users
  const sortedUserNames = Array.from(userMap.keys()).sort((a, b) => userMap.get(b)!.count - userMap.get(a)!.count);

  const users: UserStat[] = sortedUserNames.map((name, index) => {
    const stats = userMap.get(name)!;
    const sortedEmojis = Array.from(stats.emojis.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([char, count]) => ({ char, count }));
    const sortedWords = Array.from(stats.wordFreq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([word, count]) => ({ word, count }));
    
    const avgReply = stats.replyTimes.length > 0 
      ? stats.replyTimes.reduce((a, b) => a + b, 0) / stats.replyTimes.length 
      : 0;

    return {
      name,
      messageCount: stats.count,
      wordCount: stats.words,
      avgLength: Math.round(stats.words / stats.count),
      emojis: sortedEmojis,
      color: COLORS[index % COLORS.length],
      topWords: sortedWords,
      avgReplyTimeMinutes: Math.round(avgReply),
      morningCount: stats.morningCount,
      nightCount: stats.nightCount,
      byeCount: stats.byeCount,
      textMessageCount: stats.textOnlyCount,
      emojiMessageCount: stats.emojiMsgCount,
      shortMessageCount: stats.shortMessageCount,
      longMessageCount: stats.longMessageCount,
      oneSidedConversationsCount: stats.oneSidedCount
    };
  });

  // Streak
  let currentStreak = 0, maxStreak = 0, prevDateStr = '';
  Array.from(dailyTotalCounts.keys()).sort().forEach(dateStr => {
    if (prevDateStr) {
      const diff = Math.ceil(Math.abs(new Date(dateStr).getTime() - new Date(prevDateStr).getTime()) / (86400000));
      if (diff <= 1.5) currentStreak++; else currentStreak = 1;
    } else currentStreak = 1;
    if (currentStreak > maxStreak) maxStreak = currentStreak;
    prevDateStr = dateStr;
  });

  let topStarter = users[0]?.name || '-';
  let maxStarts = -1;
  startersMap.forEach((c, n) => { if (c > maxStarts) { maxStarts = c; topStarter = n; }});

  const years = new Set(messages.map(m => m.date.getFullYear()));

  return {
    totalMessages: filteredMessages.length,
    dateRange: { start: filteredMessages[0].date, end: filteredMessages[filteredMessages.length - 1].date },
    users,
    activeUsersCount: users.length,
    longestStreak: maxStreak,
    mostActiveDate: { date: activeDate, count: maxDaily },
    busiestHour: busiestHourIndex,
    topStarter,
    timeline: [], // Not needed for story
    hourlyHeatmap: hourlyCounts.map((count, hour) => ({ hour, count })),
    yearOptions: Array.from(years).sort().reverse(),
    rapidFire: { maxInMinute, maxInHour, maxInDay: maxDaily },
    dayNightSplit: { day: dayCount, night: nightCount },
    wordOccurrences: wordGlobalMap,
    dayOfWeekStats: dayOfWeekCounts,
    longestMessage: longestMsg,
    burstStats: { count: burstCount, maxBurst },
    mostRepeatedPhrase: topPhrase,
    silenceBreaker: { name: topStarter, maxSilenceHours: Math.round(maxSilenceTime) }
  };
};