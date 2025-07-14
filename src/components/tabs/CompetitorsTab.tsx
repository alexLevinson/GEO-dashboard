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
import { useCompetitorAnalytics } from '../../hooks/useCompetitorAnalytics';
import CitationCard from '../CitationCard';
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

interface CompetitorsTabProps {
  data: ChatGPTScrape[];
  allData: ChatGPTScrape[];
  selectedQuery: string;
}

const CompetitorsTab: React.FC<CompetitorsTabProps> = ({ data, allData, selectedQuery }) => {
  const competitorAnalytics = useCompetitorAnalytics(allData, selectedQuery);
  const [showQueryOnlyGeoScores, setShowQueryOnlyGeoScores] = useState(false);
  const [showQueryOnlyTable, setShowQueryOnlyTable] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('');
  const [showQueryOnlyTrend, setShowQueryOnlyTrend] = useState(false);
  
  const competitorTrendData = useEntityTrends(
    allData, 
    selectedCompetitor, 
    'competitor',
    showQueryOnlyTrend ? selectedQuery : undefined
  );

  const currentQueryCompetitors = competitorAnalytics.competitorsByQuery[selectedQuery] || [];

  const allCompetitorsChartData = {
    labels: competitorAnalytics.topCompetitors.map(c => 
      c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name
    ),
    datasets: [
      {
        label: 'Mentions',
        data: competitorAnalytics.topCompetitors.map(c => c.mentions),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const queryCompetitorsChartData = {
    labels: currentQueryCompetitors.map(c => 
      c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name
    ),
    datasets: [
      {
        label: 'Mentions',
        data: currentQueryCompetitors.map(c => c.mentions),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↗</span>;
      case 'down':
        return <span className="text-red-500">↘</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Competitor Analysis</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive competitor insights and market positioning
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">👥</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Competitors
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {competitorAnalytics.uniqueCompetitors}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">📊</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Mentions
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {competitorAnalytics.totalMentions}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">🎯</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Query Competitors
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {currentQueryCompetitors.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Top Competitors (All Queries)
          </h3>
          {competitorAnalytics.topCompetitors.length > 0 ? (
            <Bar data={allCompetitorsChartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  display: true,
                  text: 'Most Mentioned Competitors Across All Queries',
                },
              },
            }} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No competitor data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Competitors for "{selectedQuery}"
          </h3>
          {currentQueryCompetitors.length > 0 ? (
            <Bar data={queryCompetitorsChartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  display: true,
                  text: `Top Competitors for Current Query`,
                },
              },
            }} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No competitors found for this query
            </div>
          )}
        </div>
      </div>

      {/* Competitor Citation Rankings */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Competitor Citation Rankings
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Current query only</span>
            <button
              onClick={() => setShowQueryOnlyGeoScores(!showQueryOnlyGeoScores)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                showQueryOnlyGeoScores ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showQueryOnlyGeoScores ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {(showQueryOnlyGeoScores ? currentQueryCompetitors : competitorAnalytics.topCompetitors).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showQueryOnlyGeoScores ? currentQueryCompetitors : competitorAnalytics.topCompetitors).slice(0, 6).map((competitor) => {
              const allCitations = (showQueryOnlyGeoScores ? currentQueryCompetitors : competitorAnalytics.topCompetitors).map(c => c.mentions);
              return (
                <CitationCard
                  key={competitor.name}
                  name={competitor.name}
                  citations={competitor.mentions}
                  allCitations={allCitations}
                  percentage={competitor.percentage}
                  size="small"
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {showQueryOnlyGeoScores ? 'No competitors found for this query' : 'No competitor citations available'}
          </div>
        )}
      </div>

      {/* Detailed Competitor Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Detailed Competitor Analysis
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Current query only</span>
            <button
              onClick={() => setShowQueryOnlyTable(!showQueryOnlyTable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                showQueryOnlyTable ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showQueryOnlyTable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {(showQueryOnlyTable ? currentQueryCompetitors : competitorAnalytics.topCompetitors).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Competitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mentions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Share
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(showQueryOnlyTable ? currentQueryCompetitors : competitorAnalytics.topCompetitors).map((competitor, index) => (
                  <tr key={competitor.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-700">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {competitor.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {competitor.mentions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {competitor.percentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const allCitations = (showQueryOnlyTable ? currentQueryCompetitors : competitorAnalytics.topCompetitors).map(c => c.mentions);
                        const maxCitations = Math.max(...allCitations);
                        const highThreshold = maxCitations * 0.6;
                        const mediumThreshold = maxCitations * 0.2;
                        
                        let badgeClass = '';
                        let text = '';
                        
                        if (competitor.mentions >= highThreshold) {
                          badgeClass = 'bg-green-100 text-green-800 border-green-200';
                          text = 'High';
                        } else if (competitor.mentions >= mediumThreshold) {
                          badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200'; 
                          text = 'Medium';
                        } else {
                          badgeClass = 'bg-red-100 text-red-800 border-red-200';
                          text = 'Low';
                        }
                        
                        return (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${badgeClass}`}>
                            {text}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTrendIcon(competitor.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {showQueryOnlyTable ? 'No competitors found for this query' : 'No detailed competitor data available'}
          </div>
        )}
      </div>

      {/* Competitor Trend Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Competitor Trend Analysis
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
          <div className="flex items-center space-x-4">
            <label htmlFor="competitorSelect" className="text-sm font-medium text-gray-700">
              Select Competitor:
            </label>
            <select
              id="competitorSelect"
              value={selectedCompetitor}
              onChange={(e) => setSelectedCompetitor(e.target.value)}
              className="min-w-64 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">-- Select a competitor --</option>
              {competitorAnalytics.topCompetitors.map((competitor) => (
                <option key={competitor.name} value={competitor.name}>
                  {competitor.name} ({competitor.mentions} mentions)
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedCompetitor ? (
          <EntityTrendChart 
            data={competitorTrendData}
            entityName={selectedCompetitor}
            entityType="competitor"
            queryFilter={showQueryOnlyTrend ? selectedQuery : undefined}
          />
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Competitor
            </h3>
            <p className="text-gray-600">
              Choose a competitor from the dropdown above to view their citation trends over time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorsTab;