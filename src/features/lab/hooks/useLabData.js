import { useMemo } from 'react';
import { mockLabs } from '../data/mockLabsData';

export const useLabData = (activeTab, searchQuery) => {
  const filteredLabs = useMemo(() => {
    return mockLabs.filter((lab) =>
      lab.type === activeTab && lab.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, searchQuery]);

  const tabCounts = useMemo(() => {
    return {
      premade: mockLabs.filter(l => l.type === 'PREMADE').length,
      sandbox: mockLabs.filter(l => l.type === 'SANDBOX').length,
      assignment: mockLabs.filter(l => l.type === 'ASSIGNMENT').length,
    };
  }, []);

  const hasUncompletedAssignment = useMemo(() => {
    return mockLabs.some(l => l.type === 'ASSIGNMENT' && l.status !== 'SUBMITTED');
  }, []);

  return {
    filteredLabs,
    tabCounts,
    hasUncompletedAssignment
  };
};
