import React from 'react';
import { GEOScoreData, getScoreColor, getScoreGradient } from '../utils/geoScore';

interface GEOScoreCardProps {
  geoData: GEOScoreData;
  size?: 'small' | 'large';
  title?: string;
}

const GEOScoreCard: React.FC<GEOScoreCardProps> = ({ 
  geoData, 
  size = 'large',
  title = 'GEO Score'
}) => {
  const isLarge = size === 'large';
  
  return (
    <div className={`bg-white rounded-xl shadow-lg p-${isLarge ? '8' : '6'} border border-gray-100`}>
      <div className="text-center">
        <h3 className={`font-semibold text-gray-700 mb-${isLarge ? '6' : '4'} ${isLarge ? 'text-lg' : 'text-sm'} leading-tight`} title={title}>
          <div className="break-words hyphens-auto">
            {title}
          </div>
        </h3>
        
        {/* Circular Progress */}
        <div className={`relative mx-auto mb-${isLarge ? '6' : '4'}`} style={{ width: isLarge ? '120px' : '80px', height: isLarge ? '120px' : '80px' }}>
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth={isLarge ? "8" : "6"}
              fill="transparent"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#gradient)"
              strokeWidth={isLarge ? "8" : "6"}
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - geoData.score / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`stop-color-${getScoreGradient(geoData.score).split('-')[1]}-500`} />
                <stop offset="100%" className={`stop-color-${getScoreGradient(geoData.score).split('-')[3]}-600`} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`font-bold ${getScoreColor(geoData.score)} ${isLarge ? 'text-2xl' : 'text-lg'}`}>
                {geoData.score}
              </div>
              <div className={`text-gray-500 ${isLarge ? 'text-sm' : 'text-xs'}`}>
                out of 100
              </div>
            </div>
          </div>
        </div>
        
        {/* Metrics breakdown */}
        <div className={`grid grid-cols-2 gap-${isLarge ? '4' : '2'} text-center`}>
          <div>
            <div className={`font-semibold text-blue-600 ${isLarge ? 'text-xl' : 'text-lg'}`}>
              {geoData.mentionedPct.toFixed(1)}%
            </div>
            <div className={`text-gray-500 ${isLarge ? 'text-sm' : 'text-xs'}`}>
              Mentioned
            </div>
          </div>
          <div>
            <div className={`font-semibold text-green-600 ${isLarge ? 'text-xl' : 'text-lg'}`}>
              {geoData.topRankedPct.toFixed(1)}%
            </div>
            <div className={`text-gray-500 ${isLarge ? 'text-sm' : 'text-xs'}`}>
              Top Ranked
            </div>
          </div>
        </div>
        
        {isLarge && (
          <div className="mt-4 text-xs text-gray-400">
            Based on {geoData.totalRecords} records (past 30 days)
          </div>
        )}
      </div>
    </div>
  );
};

export default GEOScoreCard;