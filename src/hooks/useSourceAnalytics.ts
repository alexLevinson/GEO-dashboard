import { useMemo } from 'react';
import { ChatGPTScrape } from '../lib/supabase';

export interface SourceData {
  url: string;
  domain: string;
  mentions: number;
  percentage: number;
  queries: string[];
}

export interface DomainData {
  domain: string;
  mentions: number;
  percentage: number;
  sources: string[];
}

export interface SourceAnalytics {
  topSources: SourceData[];
  topDomains: DomainData[];
  totalSources: number;
  uniqueDomains: number;
  sourcesByQuery: Record<string, SourceData[]>;
  domainsByQuery: Record<string, DomainData[]>;
}

const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return domain.replace('www.', '');
  } catch {
    // If URL parsing fails, try to extract domain manually
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return cleanUrl.split('/')[0].split('?')[0];
  }
};

export const useSourceAnalytics = (allData: ChatGPTScrape[]): SourceAnalytics => {
  return useMemo(() => {
    if (!allData.length) {
      return {
        topSources: [],
        topDomains: [],
        totalSources: 0,
        uniqueDomains: 0,
        sourcesByQuery: {},
        domainsByQuery: {},
      };
    }

    // Extract all sources from all data
    const allSources: string[] = [];
    const sourcesByQuery: Record<string, string[]> = {};
    
    allData.forEach(row => {
      if (row.cited_sources && Array.isArray(row.cited_sources)) {
        allSources.push(...row.cited_sources);
        
        if (!sourcesByQuery[row.query]) {
          sourcesByQuery[row.query] = [];
        }
        sourcesByQuery[row.query].push(...row.cited_sources);
      }
    });

    // Count source mentions
    const sourceCounts: Record<string, { count: number; queries: Set<string> }> = {};
    
    allData.forEach(row => {
      if (row.cited_sources && Array.isArray(row.cited_sources)) {
        row.cited_sources.forEach(source => {
          if (!sourceCounts[source]) {
            sourceCounts[source] = { count: 0, queries: new Set() };
          }
          sourceCounts[source].count += 1;
          sourceCounts[source].queries.add(row.query);
        });
      }
    });

    // Create source data
    const topSources: SourceData[] = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 20)
      .map(([url, data]) => ({
        url,
        domain: extractDomain(url),
        mentions: data.count,
        percentage: (data.count / allSources.length) * 100,
        queries: Array.from(data.queries),
      }));

    // Aggregate by domain
    const domainCounts: Record<string, { count: number; sources: Set<string> }> = {};
    
    topSources.forEach(source => {
      if (!domainCounts[source.domain]) {
        domainCounts[source.domain] = { count: 0, sources: new Set() };
      }
      domainCounts[source.domain].count += source.mentions;
      domainCounts[source.domain].sources.add(source.url);
    });

    const topDomains: DomainData[] = Object.entries(domainCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 15)
      .map(([domain, data]) => ({
        domain,
        mentions: data.count,
        percentage: (data.count / allSources.length) * 100,
        sources: Array.from(data.sources),
      }));

    // Calculate sources by query
    const sourcesByQueryData: Record<string, SourceData[]> = {};
    Object.entries(sourcesByQuery).forEach(([query, sources]) => {
      const queryCounts: Record<string, number> = {};
      sources.forEach(source => {
        queryCounts[source] = (queryCounts[source] || 0) + 1;
      });

      sourcesByQueryData[query] = Object.entries(queryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([url, count]) => ({
          url,
          domain: extractDomain(url),
          mentions: count,
          percentage: (count / sources.length) * 100,
          queries: [query],
        }));
    });

    // Calculate domains by query
    const domainsByQueryData: Record<string, DomainData[]> = {};
    Object.entries(sourcesByQuery).forEach(([query, sources]) => {
      const queryDomainCounts: Record<string, { count: number; sources: Set<string> }> = {};
      
      sources.forEach(source => {
        const domain = extractDomain(source);
        if (!queryDomainCounts[domain]) {
          queryDomainCounts[domain] = { count: 0, sources: new Set() };
        }
        queryDomainCounts[domain].count += 1;
        queryDomainCounts[domain].sources.add(source);
      });

      domainsByQueryData[query] = Object.entries(queryDomainCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 8)
        .map(([domain, data]) => ({
          domain,
          mentions: data.count,
          percentage: (data.count / sources.length) * 100,
          sources: Array.from(data.sources),
        }));
    });

    return {
      topSources,
      topDomains,
      totalSources: allSources.length,
      uniqueDomains: Object.keys(domainCounts).length,
      sourcesByQuery: sourcesByQueryData,
      domainsByQuery: domainsByQueryData,
    };
  }, [allData]);
};