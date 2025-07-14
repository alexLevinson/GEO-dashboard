import { ChatGPTScrape } from '../lib/supabase';

export interface GEOScoreData {
  score: number;
  mentionedPct: number;
  topRankedPct: number;
  totalRecords: number;
}

export const calculateGEOScore = (data: ChatGPTScrape[], days: number = 30): GEOScoreData => {
  if (!data.length) {
    return {
      score: 0,
      mentionedPct: 0,
      topRankedPct: 0,
      totalRecords: 0,
    };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentData = data.filter(row => 
    new Date(row.created_at) >= cutoffDate
  );

  if (!recentData.length) {
    return {
      score: 0,
      mentionedPct: 0,
      topRankedPct: 0,
      totalRecords: 0,
    };
  }

  const mentionedCount = recentData.filter(row => row.customer_mentioned).length;
  const topRankedCount = recentData.filter(row => row.customer_top_ranked).length;
  
  const mentionedPct = (mentionedCount / recentData.length) * 100;
  const topRankedPct = (topRankedCount / recentData.length) * 100;
  
  // GEO Score formula: Weighted average with emphasis on top ranking
  // 60% weight on mentioned, 40% weight on top ranked (since top ranked is more valuable)
  const score = Math.round((mentionedPct * 0.6) + (topRankedPct * 0.4));
  
  return {
    score: Math.min(score, 100), // Cap at 100
    mentionedPct,
    topRankedPct,
    totalRecords: recentData.length,
  };
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const getScoreGradient = (score: number): string => {
  if (score >= 80) return 'from-green-500 to-green-600';
  if (score >= 60) return 'from-yellow-500 to-yellow-600';
  if (score >= 40) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
};