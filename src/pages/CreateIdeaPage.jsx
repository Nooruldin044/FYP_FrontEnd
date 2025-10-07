import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { IdeaContext } from "../contexts/IdeaContext";
import IdeaForm from "../components/Ideas/IdeaForm";
import IdeaCard from "../components/Ideas/IdeaCard";

function CreateIdeaPage() {
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);
  const { ideas } = useContext(IdeaContext);
  const navigate = useNavigate();

  const [redirecting, setRedirecting] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [sortedIdeas, setSortedIdeas] = useState([]);

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setRedirecting(true);
      const timer = setTimeout(() => navigate("/login"), 500); // small delay for UX
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Sort ideas whenever sortBy or ideas change
  useEffect(() => {
    if (!ideas) return;

    let sorted = [...ideas];

    if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "popular") {
      sorted.sort(
        (a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
      );
    } else if (sortBy === "trending") {
      // trending = score + recency
      sorted.sort((a, b) => {
        const scoreA = (a.upvotes - a.downvotes) + (a.comments?.length || 0);
        const scoreB = (b.upvotes - b.downvotes) + (b.comments?.length || 0);
        return scoreB - scoreA;
      });
    }

    setSortedIdeas(sorted);
  }, [sortBy, ideas]);

  // Loading spinner while auth status is being checked
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <svg
          className="animate-spin h-10 w-10 text-indigo-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 
            0 0 5.373 0 12h4zm2 5.291A7.962 
            7.962 0 014 12H0c0 3.042 1.135 
            5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  // Show redirect message if navigating to login
  if (redirecting) {
    return (
      <div className="text-center py-20 text-gray-500">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Share Your Idea 🚀
        </h1>
        {user ? <IdeaForm /> : null}
      </div>

      {/* Sorting Options */}
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Ideas</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        <div className="space-y-4">
          {sortedIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
          {sortedIdeas.length === 0 && (
            <p className="text-gray-500 text-center">No ideas yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateIdeaPage;
