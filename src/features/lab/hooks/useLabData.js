import { useState, useEffect } from 'react';
import { getVirtualLabs } from '../../../lib/api';

export const useLabData = (activeTab, searchQuery, selectedCategory, currentPage) => {
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUncompletedAssignment, setHasUncompletedAssignment] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Main fetch for labs
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setIsLoading(true);
        const params = {
          type: activeTab,
          page: currentPage,
          size: 8, // 8 items per page
        };
        
        if (debouncedQuery) {
          params.keyword = debouncedQuery;
        }
        
        if (selectedCategory && selectedCategory !== 'ALL') {
          params.category = selectedCategory;
        }

        const data = await getVirtualLabs(params);
        if (data && data.content) {
          setFilteredLabs(data.content);
          setTotalPages(data.totalPages);
        } else {
          setFilteredLabs([]);
          setTotalPages(0);
        }
      } catch (error) {
        console.error("Error fetching labs:", error);
        setFilteredLabs([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, [activeTab, debouncedQuery, selectedCategory, currentPage]);

  // Lightweight request to check for assignments (red dot notification)
  useEffect(() => {
    const checkAssignments = async () => {
      try {
        const data = await getVirtualLabs({ type: 'ASSIGNMENT', size: 1 });
        if (data && data.totalElements > 0) {
          setHasUncompletedAssignment(true);
        } else {
          setHasUncompletedAssignment(false);
        }
      } catch (error) {
        console.error("Error checking assignments:", error);
      }
    };
    
    checkAssignments();
  }, []);

  return {
    filteredLabs,
    totalPages,
    isLoading,
    hasUncompletedAssignment
  };
};
