import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, Filter, TrendingUp, Clock, ThumbsUp } from 'lucide-react';
import { IdeaContext, Idea } from '../contexts/IdeaContext';
import IdeaCard from '../components/Ideas/IdeaCard';

type SortOption = 'newest' | 'popular' | 'trending';

const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isLoading, setIsLoading] = useState(false);
  
  const { ideas, fetchIdeas, error } = useContext(IdeaContext);
  
  // Initialize search term from URL params
  useEffect(() => {
    const searchFromParams = searchParams.get('search');
    if (searchFromParams) {
      setSearchTerm(searchFromParams);
    }
  }, [searchParams]);
  
  // Fetch ideas when component mounts
  useEffect(() => {
    const loadIdeas = async () => {
      setIsLoading(true);
      try {
        await fetchIdeas();
      } catch (error) {
        console.error('Error fetching ideas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIdeas();
  }, [fetchIdeas]);
  
  // Filter and sort ideas when dependencies change
  useEffect(() => {
    let result = [...ideas];
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter((idea) => idea.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((idea) => 
        idea.title.toLowerCase().includes(searchLower) || 
        idea.description.toLowerCase().includes(searchLower) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    result = sortIdeas(result, sortBy);
    
    setFilteredIdeas(result);
  }, [ideas, categoryFilter, searchTerm, sortBy]);
  
  const sortIdeas = (ideasToSort: Idea[], sortOption: SortOption): Idea[] => {
    switch (sortOption) {
      case 'popular':
        return [...ideasToSort].sort((a, b) => 
          (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
        );
      case 'trending':
        // For "trending", we consider both votes and recency
        return [...ideasToSort].sort((a, b) => {
          const scoreA = (a.upvotes - a.downvotes) * (1 + 1 / (Date.now() - new Date(a.createdAt).getTime()));
          const scoreB = (b.upvotes - b.downvotes) * (1 + 1 / (Date.now() - new Date(b.createdAt).getTime()));
          return scoreB - scoreA;
        });
      case 'newest':
      default:
        return [...ideasToSort].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  // Get unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(ideas.map(idea => idea.category)));
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Discover Ideas
          </h1>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10 w-full"
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </form>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div>
            <label htmlFor="categoryFilter" className="sr-only">Filter by category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input pl-10 w-full sm:w-auto"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex justify-start sm:justify-end">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setSortBy('newest')}
                  className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-md border ${
                    sortBy === 'newest'
                      ? 'bg-primary-50 text-primary-600 border-primary-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Clock size={16} className="mr-1.5" />
                  Newest
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('popular')}
                  className={`relative inline-flex items-center px-3 py-2 text-sm font-medium border-t border-b ${
                    sortBy === 'popular'
                      ? 'bg-primary-50 text-primary-600 border-primary-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ThumbsUp size={16} className="mr-1.5" />
                  Popular
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('trending')}
                  className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-md border ${
                    sortBy === 'trending'
                      ? 'bg-primary-50 text-primary-600 border-primary-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp size={16} className="mr-1.5" />
                  Trending
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw size={24} className="animate-spin text-primary-500" />
            <span className="ml-2 text-gray-600">Loading ideas...</span>
          </div>
        ) : error ? (
          <div className="bg-error-50 text-error-600 p-4 rounded-md">
            {error}
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="inline-flex items-center justify-center p-2 bg-primary-100 rounded-full mb-4">
              <Search size={24} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No ideas found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm 
                ? `No ideas match "${searchTerm}"`
                : categoryFilter 
                  ? `No ideas found in the "${categoryFilter}" category` 
                  : 'No ideas have been shared yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;