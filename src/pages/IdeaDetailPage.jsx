import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Flag } from "lucide-react";
import { IdeaContext } from "../contexts/IdeaContext";
import { AuthContext } from "../contexts/AuthContext";
import CommentList from "../components/Ideas/CommentList";
import CommentForm from "../components/Ideas/CommentForm";

const IdeaDetailPage = () => {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getIdeaById, voteIdea, ideas } = useContext(IdeaContext);
  const { isAuthenticated, user } = useContext(AuthContext);

  // Load idea details whenever id, ideas, or context changes
  useEffect(() => {
    if (!id) {
      setError("Idea not found");
      setIsLoading(false);
      return;
    }

    const ideaData = getIdeaById(id);
    if (ideaData) {
      setIdea(ideaData);
      setIsLoading(false);
    } else {
      setError("Idea not found");
      setIsLoading(false);
    }
  }, [id, ideas, getIdeaById]);

  // Compute the current user's vote
  const userVote = user && idea ? idea.userVotes[user.id] : null;

  // Handle voting
  const handleVote = async (voteType) => {
    if (!isAuthenticated || !idea) return;

    try {
      if (userVote === voteType) {
        await voteIdea(idea.id, null);
      } else {
        await voteIdea(idea.id, voteType);
      }
      const updatedIdea = getIdeaById(id);
      if (updatedIdea) setIdea(updatedIdea);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  // Handle sharing link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-8 w-8 text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-white shadow rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-gray-600">{error || "Idea not found"}</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
          Back to Ideas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        
        {/* Header */}
        <div className="flex items-center mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 mr-2">
            {idea.category}
          </span>
          <span className="text-sm text-gray-600">
            Posted by{" "}
            <Link to={`/profile/${idea.username}`}
              className="font-medium text-indigo-600 hover:underline">
              {idea.username}
            </Link>{" "}
            {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Title + Description */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {idea.title}
        </h1>
        <p className="text-gray-700 leading-relaxed mb-6">
          {idea.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {idea.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-700">
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-y py-4 mb-6">
          <div className="flex items-center space-x-4">
            {/* Upvote */}
            <button
              onClick={() => handleVote("up")}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition ${
                userVote === "up"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <ThumbsUp size={20} /> {idea.upvotes}
            </button>

            {/* Downvote */}
            <button
              onClick={() => handleVote("down")}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition ${
                userVote === "down"
                  ? "bg-red-100 text-red-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <ThumbsDown size={20} /> {idea.downvotes}
            </button>

            {/* Comments count */}
            <div className="flex items-center gap-1 text-gray-500">
              <MessageCircle size={20} /> {idea.comments.length}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              title="Share idea"
            >
              <Share2 size={20} />
            </button>
            <button
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              title="Report idea"
            >
              <Flag size={20} />
            </button>
          </div>
        </div>

        {/* Comments */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Comments ({idea.comments.length})
          </h2>
          <CommentForm ideaId={idea.id} />
          <div className="mt-6">
            <CommentList comments={idea.comments} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailPage;
