import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { EntityTrendData, EntityType } from '../hooks/useEntityTrends';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface EntityTrendChartProps {
  data: EntityTrendData[];
  entityName: string;
  entityType: EntityType;
  queryFilter?: string;
}

const EntityTrendChart: React.FC<EntityTrendChartProps> = ({ data, entityName, entityType, queryFilter }) => {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Mentions',
        data: data.map(d => d.mentions),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: 'Mention Rate %',
        data: data.map(d => d.percentage),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${entityName} - Citation Trends Over Time${queryFilter ? ` (${queryFilter})` : ' (All Queries)'}`,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Mentions',
        },
        ticks: {
          stepSize: 1,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Mention Rate (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  const getEntityTypeLabel = (type: EntityType): string => {
    switch (type) {
      case 'competitor': return 'Competitor';
      case 'source': return 'Source';
      case 'domain': return 'Domain';
      default: return 'Entity';
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Trend Data Available
          </h3>
          <p className="text-gray-600">
            No historical data found for "{entityName}" as a {getEntityTypeLabel(entityType).toLowerCase()}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {getEntityTypeLabel(entityType)} Trend Analysis
        </h3>
        <p className="text-gray-600 mt-1">
          Citation trends for "{entityName}" over time {queryFilter ? `(${queryFilter} only)` : '(all queries)'}
        </p>
      </div>
      
      <Line data={chartData} options={options} />
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, d) => sum + d.mentions, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Mentions</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {data.length > 0 ? (data.reduce((sum, d) => sum + d.percentage, 0) / data.length).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-gray-600">Avg. Mention Rate</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Math.max(...data.map(d => d.mentions))}
          </div>
          <div className="text-sm text-gray-600">Peak Daily Mentions</div>
        </div>
      </div>
    </div>
  );
};

export default EntityTrendChart;