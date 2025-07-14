export interface CitationColorData {
  color: string;
  bgColor: string;
  borderColor: string;
  level: 'high' | 'medium' | 'low';
}

export const getCitationColorData = (citations: number, allCitations: number[]): CitationColorData => {
  if (allCitations.length === 0) {
    return {
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      level: 'low',
    };
  }

  // Calculate thresholds based on citation distribution
  const sortedCitations = [...allCitations].sort((a, b) => b - a);
  const maxCitations = sortedCitations[0];
  const minCitations = sortedCitations[sortedCitations.length - 1];
  
  // Use percentile-based thresholds
  const highThreshold = maxCitations * 0.6; // Top 40% 
  const mediumThreshold = maxCitations * 0.2; // Middle 40%
  
  if (citations >= highThreshold) {
    return {
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      level: 'high',
    };
  } else if (citations >= mediumThreshold) {
    return {
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100', 
      borderColor: 'border-yellow-300',
      level: 'medium',
    };
  } else {
    return {
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      level: 'low',
    };
  }
};

export const getCitationBadgeClass = (citations: number, allCitations: number[]): string => {
  const colorData = getCitationColorData(citations, allCitations);
  
  if (colorData.level === 'high') {
    return 'bg-green-100 text-green-800 border-green-200';
  } else if (colorData.level === 'medium') {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else {
    return 'bg-red-100 text-red-800 border-red-200';
  }
};