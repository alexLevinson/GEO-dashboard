import React from 'react';
import { ChatGPTScrape } from '../../lib/supabase';
import { calculateGEOScore } from '../../utils/geoScore';
import GEOScoreCard from '../GEOScoreCard';
import TrendChart from '../TrendChart';
import MetricsCards from '../MetricsCards';

interface MyPerformanceTabProps {
  data: ChatGPTScrape[];
  selectedQuery: string;
}

const MyPerformanceTab: React.FC<MyPerformanceTabProps> = ({ data, selectedQuery }) => {
  const geoData = calculateGEOScore(data);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Performance</h1>
        <p className="text-gray-600 mt-1">
          Performance analytics for {selectedQuery}
        </p>
      </div>

      {/* GEO Score and Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <GEOScoreCard geoData={geoData} />
        </div>
        <div className="lg:col-span-2">
          <MetricsCards data={data} />
        </div>
      </div>

      {/* Performance Trend Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <TrendChart data={data} />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Queries Analyzed</span>
              <span className="font-semibold">{data.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Best Performance Day</span>
              <span className="font-semibold">
                {data.length > 0 ? 
                  new Date(Math.max(...data.map(d => new Date(d.created_at).getTime()))).toLocaleDateString() 
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Improvement Trend</span>
              <span className={`font-semibold ${geoData.score > 50 ? 'text-green-600' : 'text-red-600'}`}>
                {geoData.score > 50 ? '↗ Positive' : '↘ Needs Attention'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {geoData.score < 40 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 text-sm">
                  🚨 Focus on improving content quality and SEO optimization
                </p>
              </div>
            )}
            {geoData.score >= 40 && geoData.score < 70 && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  ⚡ Good progress! Consider expanding content coverage
                </p>
              </div>
            )}
            {geoData.score >= 70 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  ✅ Excellent performance! Maintain current strategy
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPerformanceTab;