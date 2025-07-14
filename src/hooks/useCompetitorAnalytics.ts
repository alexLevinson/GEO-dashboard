import { useMemo } from 'react';
import { ChatGPTScrape } from '../lib/supabase';
import { calculateGEOScore, GEOScoreData } from '../utils/geoScore';

export interface CompetitorData {
  name: string;
  mentions: number;
  percentage: number;
  geoScore: GEOScoreData;
  trend: 'up' | 'down' | 'stable';
}

export interface CompetitorAnalytics {
  topCompetitors: CompetitorData[];
  totalMentions: number;
  uniqueCompetitors: number;
  competitorsByQuery: Record<string, CompetitorData[]>;
}

export const useCompetitorAnalytics = (allData: ChatGPTScrape[], currentQuery?: string): CompetitorAnalytics => {
  return useMemo(() => {
    if (!allData.length) {
      return {
        topCompetitors: [],
        totalMentions: 0,
        uniqueCompetitors: 0,
        competitorsByQuery: {},
      };
    }

    // Extract all candidates from all data
    const allCandidates: string[] = [];
    const candidatesByQuery: Record<string, string[]> = {};
    
    allData.forEach(row => {
      if (row.candidates && Array.isArray(row.candidates)) {
        allCandidates.push(...row.candidates);
        
        if (!candidatesByQuery[row.query]) {
          candidatesByQuery[row.query] = [];
        }
        candidatesByQuery[row.query].push(...row.candidates);
      }
    });

    // Count overall mentions
    const candidateCounts: Record<string, number> = {};
    allCandidates.forEach(candidate => {
      candidateCounts[candidate] = (candidateCounts[candidate] || 0) + 1;
    });

    // Calculate competitor data with mock GEO scores (since we don't have competitor-specific data)
    const topCompetitors: CompetitorData[] = Object.entries(candidateCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, mentions]) => {
        // Mock GEO score calculation for competitors
        const percentage = (mentions / allCandidates.length) * 100;
        const mockGeoScore = {
          score: Math.round(percentage * 2), // Simple formula
          mentionedPct: percentage,
          topRankedPct: percentage * 0.3, // Assume 30% of mentions are top-ranked
          totalRecords: mentions,
        };

        return {
          name,
          mentions,
          percentage,
          geoScore: mockGeoScore,
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
        };
      });

    // Calculate competitors by query
    const competitorsByQuery: Record<string, CompetitorData[]> = {};
    Object.entries(candidatesByQuery).forEach(([query, candidates]) => {
      const queryCounts: Record<string, number> = {};
      candidates.forEach(candidate => {
        queryCounts[candidate] = (queryCounts[candidate] || 0) + 1;
      });

      competitorsByQuery[query] = Object.entries(queryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, mentions]) => {
          const percentage = (mentions / candidates.length) * 100;
          const mockGeoScore = {
            score: Math.round(percentage * 2),
            mentionedPct: percentage,
            topRankedPct: percentage * 0.3,
            totalRecords: mentions,
          };

          return {
            name,
            mentions,
            percentage,
            geoScore: mockGeoScore,
            trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
          };
        });
    });

    return {
      topCompetitors,
      totalMentions: allCandidates.length,
      uniqueCompetitors: Object.keys(candidateCounts).length,
      competitorsByQuery,
    };
  }, [allData]);
};