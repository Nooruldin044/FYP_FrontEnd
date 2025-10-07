import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, TrendingUp, Clock, ThumbsUp } from "lucide-react";
import { IdeaContext } from "../contexts/IdeaContext";
import { AuthContext } from "../contexts/AuthContext";
import IdeaCard from "../components/Ideas/IdeaCard";

function HomePage() {
  const [searchParams] = useSearchParams();
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [yourIdeas, setYourIdeas] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { ideas } = useContext(IdeaContext);
  const { user } = useContext(AuthContext);

  // --- Sorting function ---
  const sortIdeas = (ideasToSort, sortOption) => {
    switch (sortOption) {
      case "popular":
        return [...ideasToSort].sort(
          (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
        );
      case "trending":
        return [...ideasToSort].sort((a, b) => {
          const scoreA =
            (a.upvotes - a.downvotes + (a.comments?.length || 0)) /
            ((Date.now() - new Date(a.createdAt).getTime()) / 3600000 + 1);
          const scoreB =
            (b.upvotes - b.downvotes + (b.comments?.length || 0)) /
            ((Date.now() - new Date(b.createdAt).getTime()) / 3600000 + 1);
          return scoreB - scoreA;
        });
      case "newest":
      default:
        return [...ideasToSort].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  // Initialize search term from URL params
  useEffect(() => {
    const searchFromParams = searchParams.get("search");
    if (searchFromParams) setSearchTerm(searchFromParams);
  }, [searchParams]);

  // Filter, sort, and split ideas
  useEffect(() => {
    if (!ideas) return;

    let result = [...ideas];

    if (categoryFilter) {
      result = result.filter((idea) => idea.category === categoryFilter);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchLower) ||
          idea.description.toLowerCase().includes(searchLower) ||
          idea.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    const sortedIdeas = sortIdeas(result, sortBy);
    setFilteredIdeas(sortedIdeas);

    if (user) {
      setYourIdeas(sortedIdeas.filter((idea) => idea.userId === user.id));
    }
  }, [ideas, categoryFilter, searchTerm, sortBy, user]);

  const handleSearch = (e) => e.preventDefault();
  const uniqueCategories = ideas
    ? Array.from(new Set(ideas.map((idea) => idea.category)))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 to-white/40">
      <div className="container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4 md:mb-0">
                Discover Ideas
              </h1>
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="w-full md:w-80 relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  size={18}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
              </form>
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative">
                <Filter
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <select
                  id="categoryFilter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-grow flex justify-start sm:justify-end">
                <div className="inline-flex rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setSortBy("newest")}
                    className={`flex items-center px-3 py-2 text-sm font-medium transition ${
                      sortBy === "newest"
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Clock size={16} className="mr-1.5" /> Newest
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("popular")}
                    className={`flex items-center px-3 py-2 text-sm font-medium transition ${
                      sortBy === "popular"
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ThumbsUp size={16} className="mr-1.5" /> Popular
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortBy("trending")}
                    className={`flex items-center px-3 py-2 text-sm font-medium transition ${
                      sortBy === "trending"
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <TrendingUp size={16} className="mr-1.5" /> Trending
                  </button>
                </div>
              </div>
            </div>

            {/* Your Ideas */}
            {user && yourIdeas.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Your Ideas
                </h2>
                <div className="space-y-6">
                  {yourIdeas.map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                </div>
              </div>
            )}

            {/* Filtered Ideas */}
            {filteredIdeas.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                  <Search size={24} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  No ideas found
                </h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm
                    ? `No ideas match "${searchTerm}"`
                    : categoryFilter
                    ? `No ideas found in "${categoryFilter}"`
                    : "No ideas have been shared yet."}
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
      </div>
    </div>
  );
}

export default HomePage;
