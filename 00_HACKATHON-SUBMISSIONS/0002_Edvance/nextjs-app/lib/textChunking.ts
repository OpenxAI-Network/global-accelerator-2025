interface Chunk {
  text: string;
  page?: number;
  startIndex: number;
  endIndex: number;
}

interface ChunkingOptions {
  size?: number;
  overlap?: number;
  separator?: string;
}

export function chunkText(
  text: string, 
  options: ChunkingOptions = {}
): Chunk[] {
  const {
    size = 1200,
    overlap = 200,
    separator = '\n'
  } = options;

  if (!text || text.length <= size) {
    return [{
      text: text,
      startIndex: 0,
      endIndex: text.length
    }];
  }

  const chunks: Chunk[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = Math.min(startIndex + size, text.length);
    
    // Try to break at a natural boundary (newline, period, space)
    if (endIndex < text.length) {
      const nextNewline = text.indexOf(separator, endIndex - 100);
      const nextPeriod = text.indexOf('. ', endIndex - 100);
      const nextSpace = text.lastIndexOf(' ', endIndex);
      
      let breakPoint = endIndex;
      
      // Prefer newline, then period, then space
      if (nextNewline > endIndex - 100 && nextNewline < endIndex + 50) {
        breakPoint = nextNewline + 1;
      } else if (nextPeriod > endIndex - 100 && nextPeriod < endIndex + 50) {
        breakPoint = nextPeriod + 2;
      } else if (nextSpace > endIndex - 100) {
        breakPoint = nextSpace + 1;
      }
      
      endIndex = breakPoint;
    }

    const chunkText = text.slice(startIndex, endIndex).trim();
    
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        startIndex,
        endIndex
      });
    }

    // Move start index forward, accounting for overlap
    startIndex = Math.max(startIndex + 1, endIndex - overlap);
    
    // Prevent infinite loops
    if (startIndex >= endIndex) {
      startIndex = endIndex;
    }
  }

  return chunks;
}

// Enhanced semantic similarity function with better matching
export function semanticSimilarity(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const textWords = text.toLowerCase().split(/\s+/);
  
  if (queryWords.length === 0) return 0;
  
  let matches = 0;
  let exactMatches = 0;
  let partialMatches = 0;
  
  for (const queryWord of queryWords) {
    let found = false;
    
    for (const textWord of textWords) {
      // Exact match (highest score)
      if (textWord === queryWord) {
        exactMatches++;
        found = true;
        break;
      }
      // Partial match (medium score)
      else if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
        partialMatches++;
        found = true;
        break;
      }
    }
    
    if (found) matches++;
  }
  
  // Weight exact matches more heavily
  const exactScore = exactMatches / queryWords.length;
  const partialScore = partialMatches / queryWords.length;
  
  // Return weighted score (exact matches count more)
  return (exactScore * 1.0) + (partialScore * 0.5);
}

// Date extraction regex for exam dates
export function extractExamDate(text: string): string | null {
  const patterns = [
    // "final exam is on September 21st 2025"
    /(?:final\s*exam[^.\n]{0,120}?)(?:is\s+)?(?:on\s+)?((?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day,\s+)?([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i,
    // "exam date: December 15, 2024"
    /(?:exam\s+date[^.\n]{0,80}?)(?:is\s+)?(?:on\s+)?((?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day,\s+)?([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i,
    // "Final Exam: September 21st, 2025"
    /(?:final\s*exam[^.\n]{0,80}?):\s*((?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day,\s+)?([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i,
    // "December 15, 2024" near "exam" or "final"
    /((?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day,\s+)?([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})(?=[^.\n]{0,100}(?:exam|final))/i,
    // "15th December 2024"
    /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+),?\s+(\d{4})/i,
    // "21/09/2025" format
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Handle different pattern groups
      if (match.length === 5) {
        // Pattern with day of week: "Monday, September 21st, 2025"
        const dayOfWeek = match[1] || '';
        const month = match[2];
        const day = match[3];
        const year = match[4];
        return `${dayOfWeek}${month} ${day}, ${year}`.trim();
      } else if (match.length === 4) {
        // Pattern without day of week: "September 21st, 2025"
        const month = match[1];
        const day = match[2];
        const year = match[3];
        return `${month} ${day}, ${year}`;
      } else if (match.length === 3) {
        // Date format: "21/09/2025"
        const day = match[1];
        const month = match[2];
        const year = match[3];
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthName = monthNames[parseInt(month) - 1];
        return `${monthName} ${day}, ${year}`;
      }
    }
  }
  
  return null;
}

// Extract exam time if present
export function extractExamTime(text: string): string | null {
  const patterns = [
    // "2:00 PM - 5:00 PM"
    /(\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM))/i,
    // "at 2:00 PM"
    /(?:at\s+)(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
    // "2:00 PM"
    /(\d{1,2}:\d{2}\s*(?:AM|PM))/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}
