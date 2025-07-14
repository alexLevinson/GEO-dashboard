import React from 'react';
import { getCitationColorData, getCitationBadgeClass } from '../utils/citationColors';

interface CitationCardProps {
  name: string;
  citations: number;
  allCitations: number[];
  percentage?: number;
  size?: 'small' | 'large';
}

const CitationCard: React.FC<CitationCardProps> = ({ 
  name,
  citations,
  allCitations,
  percentage,
  size = 'large'
}) => {
  const isLarge = size === 'large';
  const colorData = getCitationColorData(citations, allCitations);
  
  return (
    <div className={`bg-white rounded-xl shadow-lg p-${isLarge ? '8' : '6'} border border-gray-100 hover:shadow-xl transition-shadow`}>
      <div className="text-center">
        <h3 className={`font-semibold text-gray-700 mb-${isLarge ? '6' : '4'} ${isLarge ? 'text-lg' : 'text-sm'} leading-tight`} title={name}>
          <div className="break-words hyphens-auto">
            {name}
          </div>
        </h3>
        
        {/* Citation Count Display */}
        <div className={`relative mx-auto mb-${isLarge ? '6' : '4'}`}>
          <div className={`${colorData.bgColor} ${colorData.borderColor} border-2 rounded-full p-${isLarge ? '8' : '6'} mx-auto`} 
               style={{ width: isLarge ? '120px' : '80px', height: isLarge ? '120px' : '80px' }}>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className={`font-bold ${colorData.color} ${isLarge ? 'text-3xl' : 'text-xl'}`}>
                  {citations}
                </div>
                <div className={`text-gray-500 ${isLarge ? 'text-sm' : 'text-xs'} mt-1`}>
                  citations
                </div>
              </div>
            </div>
          </div>
        </div>
        
        
        {/* Additional Stats */}
        {percentage !== undefined && (
          <div className="text-center">
            <div className={`font-semibold ${colorData.color} ${isLarge ? 'text-lg' : 'text-base'}`}>
              {percentage.toFixed(1)}%
            </div>
            <div className={`text-gray-500 ${isLarge ? 'text-sm' : 'text-xs'}`}>
              Market Share
            </div>
          </div>
        )}
        
        {isLarge && (
          <div className="mt-4 text-xs text-gray-400">
            Citation-based ranking
          </div>
        )}
      </div>
    </div>
  );
};

export default CitationCard;