import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChatGPTScrape } from '../../lib/supabase';
import { useSourceAnalytics } from '../../hooks/useSourceAnalytics';
import EntityTrendChart from '../EntityTrendChart';
import { useEntityTrends } from '../../hooks/useEntityTrends';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SourcesTabProps {
  data: ChatGPTScrape[];
  allData: ChatGPTScrape[];
  selectedQuery: string;
}

const SourcesTab: React.FC<SourcesTabProps> = ({ data, allData, selectedQuery }) => {
  const sourceAnalytics = useSourceAnalytics(allData);
  const [viewMode, setViewMode] = useState<'sources' | 'domains'>('sources');
  const [showQueryOnly, setShowQueryOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [showQueryOnlyTrend, setShowQueryOnlyTrend] = useState(false);
  
  const sourceTrendData = useEntityTrends(
    allData, 
    selectedSource, 
    'source',
    showQueryOnlyTrend ? selectedQuery : undefined
  );
  const domainTrendData = useEntityTrends(
    allData, 
    selectedDomain, 
    'domain',
    showQueryOnlyTrend ? selectedQuery : undefined
  );

  const currentQuerySources = sourceAnalytics.sourcesByQuery[selectedQuery] || [];
  const currentQueryDomains = sourceAnalytics.domainsByQuery[selectedQuery] || [];

  const allSourcesChartData = {
    labels: sourceAnalytics.topSources.slice(0, 10).map(s => {
      const domain = s.domain.length > 25 ? s.domain.substring(0, 25) + '...' : s.domain;
      return domain;
    }),
    datasets: [
      {
        label: 'Citations',
        data: sourceAnalytics.topSources.slice(0, 10).map(s => s.mentions),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const querySourcesChartData = {
    labels: currentQuerySources.slice(0, 8).map(s => {
      const domain = s.domain.length > 25 ? s.domain.substring(0, 25) + '...' : s.domain;
      return domain;
    }),
    datasets: [
      {
        label: 'Citations',
        data: currentQuerySources.slice(0, 8).map(s => s.mentions),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const allDomainsChartData = {
    labels: sourceAnalytics.topDomains.slice(0, 10).map(d => 
      d.domain.length > 25 ? d.domain.substring(0, 25) + '...' : d.domain
    ),
    datasets: [
      {
        label: 'Citations',
        data: sourceAnalytics.topDomains.slice(0, 10).map(d => d.mentions),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      },
    ],
  };

  const queryDomainsChartData = {
    labels: currentQueryDomains.map(d => 
      d.domain.length > 25 ? d.domain.substring(0, 25) + '...' : d.domain
    ),
    datasets: [
      {
        label: 'Citations',
        data: currentQueryDomains.map(d => d.mentions),
        backgroundColor: 'rgba(245, 101, 101, 0.8)',
        borderColor: 'rgb(245, 101, 101)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    indexAxis: 'y' as const,
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Source Analysis</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive analysis of cited sources and domains
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">🔗</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Sources
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {sourceAnalytics.topSources.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">🌐</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Unique Domains
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {sourceAnalytics.uniqueDomains}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">📊</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Citations
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {sourceAnalytics.totalSources}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">🎯</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Query Sources
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {currentQuerySources.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('sources')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'sources'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sources View
          </button>
          <button
            onClick={() => setViewMode('domains')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'domains'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Domains View
          </button>
        </div>
      </div>

      {/* Charts */}
      {viewMode === 'sources' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Top Sources (All Queries)
            </h3>
            {sourceAnalytics.topSources.length > 0 ? (
              <Bar data={allSourcesChartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: 'Most Cited Sources Across All Queries',
                  },
                },
              }} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No source data available
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Sources for "{selectedQuery}"
            </h3>
            {currentQuerySources.length > 0 ? (
              <Bar data={querySourcesChartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: `Top Sources for Current Query`,
                  },
                },
              }} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sources found for this query
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Top Domains (All Queries)
            </h3>
            {sourceAnalytics.topDomains.length > 0 ? (
              <Bar data={allDomainsChartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: 'Most Cited Domains Across All Queries',
                  },
                },
              }} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No domain data available
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Domains for "{selectedQuery}"
            </h3>
            {currentQueryDomains.length > 0 ? (
              <Bar data={queryDomainsChartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: `Top Domains for Current Query`,
                  },
                },
              }} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No domains found for this query
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sources Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Top Sources Detailed
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Current query only</span>
              <button
                onClick={() => setShowQueryOnly(!showQueryOnly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showQueryOnly ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showQueryOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {(showQueryOnly ? currentQuerySources : sourceAnalytics.topSources).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Citations
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(showQueryOnly ? currentQuerySources : sourceAnalytics.topSources).slice(0, 10).map((source, index) => (
                    <tr key={source.url} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{source.domain}</div>
                          <div className="text-gray-500 text-xs" title={source.url}>
                            {truncateUrl(source.url, 40)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {source.mentions}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {source.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {showQueryOnly ? 'No sources found for this query' : 'No source data available'}
            </div>
          )}
        </div>

        {/* Domains Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Top Domains Detailed
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Current query only</span>
              <button
                onClick={() => setShowQueryOnly(!showQueryOnly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showQueryOnly ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showQueryOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {(showQueryOnly ? currentQueryDomains : sourceAnalytics.topDomains).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Citations
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sources
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(showQueryOnly ? currentQueryDomains : sourceAnalytics.topDomains).slice(0, 10).map((domain, index) => (
                    <tr key={domain.domain} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-purple-600">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {domain.domain}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {domain.mentions}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {domain.sources.length}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {domain.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {showQueryOnly ? 'No domains found for this query' : 'No domain data available'}
            </div>
          )}
        </div>
      </div>

      {/* Entity Trend Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Source & Domain Trend Analysis
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Current query only</span>
              <button
                onClick={() => setShowQueryOnlyTrend(!showQueryOnlyTrend)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showQueryOnlyTrend ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showQueryOnlyTrend ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Selection */}
            <div>
              <label htmlFor="sourceSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select Source:
              </label>
              <select
                id="sourceSelect"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">-- Select a source --</option>
                {sourceAnalytics.topSources.slice(0, 20).map((source) => (
                  <option key={source.url} value={source.url}>
                    {source.domain} ({source.mentions} mentions)
                  </option>
                ))}
              </select>
            </div>

            {/* Domain Selection */}
            <div>
              <label htmlFor="domainSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select Domain:
              </label>
              <select
                id="domainSelect"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              >
                <option value="">-- Select a domain --</option>
                {sourceAnalytics.topDomains.map((domain) => (
                  <option key={domain.domain} value={domain.domain}>
                    {domain.domain} ({domain.mentions} mentions)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Trend Charts */}
        <div className="space-y-8">
          {selectedSource && (
            <EntityTrendChart 
              data={sourceTrendData}
              entityName={selectedSource}
              entityType="source"
              queryFilter={showQueryOnlyTrend ? selectedQuery : undefined}
            />
          )}
          
          {selectedDomain && (
            <EntityTrendChart 
              data={domainTrendData}
              entityName={selectedDomain}
              entityType="domain"
              queryFilter={showQueryOnlyTrend ? selectedQuery : undefined}
            />
          )}
          
          {!selectedSource && !selectedDomain && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Source or Domain
              </h3>
              <p className="text-gray-600">
                Choose a source or domain from the dropdowns above to view their citation trends over time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SourcesTab;