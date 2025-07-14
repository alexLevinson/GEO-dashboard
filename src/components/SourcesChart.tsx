import React, { useState, useMemo } from 'react';
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
import { ChatGPTScrape } from '../lib/supabase';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SourcesChartProps {
  data: ChatGPTScrape[];
}

const SourcesChart: React.FC<SourcesChartProps> = ({ data }) => {
  const [startDate, setStartDate] = useState(() => {
    if (data.length === 0) return '';
    const dates = data.map(d => d.created_at).sort();
    return format(parseISO(dates[0]), 'yyyy-MM-dd');
  });
  
  const [endDate, setEndDate] = useState(() => {
    if (data.length === 0) return '';
    const dates = data.map(d => d.created_at).sort();
    return format(parseISO(dates[dates.length - 1]), 'yyyy-MM-dd');
  });

  const chartData = useMemo(() => {
    let filteredData = data;
    
    if (startDate && endDate) {
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));
      
      filteredData = data.filter(row => {
        const rowDate = parseISO(row.created_at);
        return rowDate >= start && rowDate <= end;
      });
    }

    const allSources: string[] = [];
    filteredData.forEach(row => {
      if (row.cited_sources && Array.isArray(row.cited_sources)) {
        allSources.push(...row.cited_sources);
      }
    });

    const sourceCounts: Record<string, number> = {};
    allSources.forEach(source => {
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const sortedSources = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      labels: sortedSources.map(([source]) => 
        source.length > 30 ? source.substring(0, 30) + '...' : source
      ),
      datasets: [
        {
          label: 'Citations',
          data: sortedSources.map(([, count]) => count),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  }, [data, startDate, endDate]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Top 10 Cited Sources${startDate && endDate ? ` (${startDate} to ${endDate})` : ''}`,
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

  const minDate = data.length > 0 ? format(parseISO(data.map(d => d.created_at).sort()[0]), 'yyyy-MM-dd') : '';
  const maxDate = data.length > 0 ? format(parseISO(data.map(d => d.created_at).sort().reverse()[0]), 'yyyy-MM-dd') : '';

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🔗 Top Cited Sources</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        {chartData.labels.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No cited sources found for the selected time period
          </div>
        )}
      </div>
    </div>
  );
};

export default SourcesChart;