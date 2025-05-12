import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Flag } from 'lucide-react';
import { IdeaContext, Idea } from '../contexts/IdeaContext';
import { AuthContext } from '../contexts/AuthContext';
import CommentList from '../components/Ideas/CommentList';
import CommentForm from '../components/Ideas/CommentForm';

const IdeaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getIdeaById, voteIdea, ideas } = useContext(IdeaContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!id) {
      setError('Idea not found');
      setIsLoading(false);
      return;
    }
    
    const ideaData = getIdeaById(id);
    if (ideaData) {
      setIdea(ideaData);
      setIsLoading(false);
    } else {
      setError('Idea not found');
      setIsLoading(false);
    }
  }, [id, getIdeaById, ideas]);
  
  const handleVote = async (voteType: 'up' | 'down') => {
    if (!isAuthenticated || !idea) {
      return;
    }
    
    try {
      // If user already voted this way, remove the vote
      if (idea.userVote === voteType) {
        await voteIdea(idea.id, null);
      } else {
        await voteIdea(idea.id, voteType);
      }
      
      // Refresh idea data
      const updatedIdea = getIdeaById(id!);
      if (updatedIdea) {
        setIdea(updatedIdea);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !idea) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-700">{error || 'Idea not found'}</p>
            <div className="mt-6">
              <Link to="/" className="btn btn-primary">
                Back to Ideas
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mr-2">
              {idea.category}
            </span>
            <span className="text-sm text-gray-600">
              Posted by{' '}
              <Link 
                to={`/profile/${idea.username}`} 
                className="font-medium text-primary-600 hover:text-primary-800"
              >
                {idea.username}
              </Link>{' '}
              {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {idea.title}
          </h1>
          
          <p className="text-gray-700 whitespace-pre-line mb-6">
            {idea.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {idea.tags.map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between border-t border-b border-gray-200 py-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <button 
                  onClick={() => handleVote('up')}
                  className={`p-1.5 rounded-md transition-colors ${
                    idea.userVote === 'up' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  disabled={!isAuthenticated}
                  title={isAuthenticated ? 'Upvote' : 'Login to vote'}
                >
                  <ThumbsUp size={20} />
                </button>
                <span className="mx-1 font-medium">
                  {idea.upvotes}
                </span>
              </div>
              
              <div className="flex items-center">
                <button 
                  onClick={() => handleVote('down')}
                  className={`p-1.5 rounded-md transition-colors ${
                    idea.userVote === 'down' 
                      ? 'bg-error-100 text-error-600' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  disabled={!isAuthenticated}
                  title={isAuthenticated ? 'Downvote' : 'Login to vote'}
                >
                  <ThumbsDown size={20} />
                </button>
                <span className="mx-1 font-medium">
                  {idea.downvotes}
                </span>
              </div>
              
              <div className="flex items-center">
                <MessageCircle size={20} className="text-gray-500" />
                <span className="ml-1 text-gray-700">
                  {idea.comments.length}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleShare}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                title="Share idea"
              >
                <Share2 size={20} />
              </button>
              <button 
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                title="Report idea"
              >
                <Flag size={20} />
              </button>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Comments ({idea.comments.length})
            </h2>
            <CommentForm ideaId={idea.id} />
            
            <div className="mt-6">
              <CommentList comments={idea.comments} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailPage;