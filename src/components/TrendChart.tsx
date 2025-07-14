import React, { useMemo } from 'react';
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
import { ChatGPTScrape } from '../lib/supabase';
import { format, parseISO } from 'date-fns';

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

interface TrendChartProps {
  data: ChatGPTScrape[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const dailyStats = data.reduce((acc, row) => {
      const date = format(parseISO(row.created_at), 'yyyy-MM-dd');
      
      if (!acc[date]) {
        acc[date] = {
          date,
          mentioned: 0,
          topRanked: 0,
          total: 0,
        };
      }
      
      acc[date].total += 1;
      if (row.customer_mentioned) acc[date].mentioned += 1;
      if (row.customer_top_ranked) acc[date].topRanked += 1;
      
      return acc;
    }, {} as Record<string, { date: string; mentioned: number; topRanked: number; total: number }>);

    const sortedDates = Object.keys(dailyStats).sort();
    
    const labels = sortedDates;
    const mentionedData = sortedDates.map(date => 
      dailyStats[date].total > 0 ? (dailyStats[date].mentioned / dailyStats[date].total) * 100 : 0
    );
    const topRankedData = sortedDates.map(date => 
      dailyStats[date].total > 0 ? (dailyStats[date].topRanked / dailyStats[date].total) * 100 : 0
    );

    return {
      labels,
      datasets: [
        {
          label: 'Customer Mentioned %',
          data: mentionedData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        },
        {
          label: 'Customer Top Ranked %',
          data: topRankedData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.1,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Customer Performance Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Trends Over Time</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TrendChart;