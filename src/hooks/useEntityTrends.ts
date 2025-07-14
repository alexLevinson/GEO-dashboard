import { useMemo } from 'react';
import { ChatGPTScrape } from '../lib/supabase';
import { format, parseISO } from 'date-fns';

export interface EntityTrendData {
  date: string;
  mentions: number;
  percentage: number;
}

export type EntityType = 'competitor' | 'source' | 'domain';

const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return domain.replace('www.', '');
  } catch {
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return cleanUrl.split('/')[0].split('?')[0];
  }
};

export const useEntityTrends = (
  allData: ChatGPTScrape[],
  entityName: string,
  entityType: EntityType,
  queryFilter?: string
): EntityTrendData[] => {
  return useMemo(() => {
    if (!allData.length || !entityName) {
      return [];
    }

    // Filter data by query if specified
    const filteredData = queryFilter 
      ? allData.filter(row => row.query === queryFilter)
      : allData;

    if (filteredData.length === 0) {
      return [];
    }

    // Group data by date and count entity mentions
    const dailyData: Record<string, { mentions: number; total: number }> = {};

    filteredData.forEach(row => {
      const date = format(parseISO(row.created_at), 'yyyy-MM-dd');
      
      if (!dailyData[date]) {
        dailyData[date] = { mentions: 0, total: 0 };
      }
      
      dailyData[date].total += 1;

      // Check if entity is mentioned based on type
      let entityMentioned = false;

      switch (entityType) {
        case 'competitor':
          if (row.candidates && Array.isArray(row.candidates)) {
            entityMentioned = row.candidates.includes(entityName);
          }
          break;
          
        case 'source':
          if (row.cited_sources && Array.isArray(row.cited_sources)) {
            entityMentioned = row.cited_sources.includes(entityName);
          }
          break;
          
        case 'domain':
          if (row.cited_sources && Array.isArray(row.cited_sources)) {
            entityMentioned = row.cited_sources.some(source => 
              extractDomain(source) === entityName
            );
          }
          break;
      }

      if (entityMentioned) {
        dailyData[date].mentions += 1;
      }
    });

    // Convert to trend data array
    const trendData: EntityTrendData[] = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        mentions: data.mentions,
        percentage: data.total > 0 ? (data.mentions / data.total) * 100 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trendData;
  }, [allData, entityName, entityType, queryFilter]);
};