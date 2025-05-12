import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { Idea } from '../../contexts/IdeaContext';
import { AuthContext } from '../../contexts/AuthContext';
import { IdeaContext } from '../../contexts/IdeaContext';

interface IdeaCardProps {
  idea: Idea;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const { voteIdea } = useContext(IdeaContext);
  
  const handleVote = async (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return;
    }
    
    try {
      // If user already voted this way, remove the vote
      if (idea.userVote === voteType) {
        await voteIdea(idea.id, null);
      } else {
        await voteIdea(idea.id, voteType);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };
  
  return (
    <div className="card card-hover animate-enter p-5 transition-all">
      <div className="flex items-start">
        <div className="hidden sm:flex flex-col items-center mr-4 space-y-2">
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
          <span className="text-sm font-medium">
            {idea.upvotes - idea.downvotes}
          </span>
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
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {idea.category}
              </span>
              <div className="mt-2 flex items-center space-x-1.5">
                <img 
                  src={idea.avatar} 
                  alt={idea.username} 
                  className="h-5 w-5 rounded-full"
                />
                <span className="text-sm text-gray-600">
                  Posted by {idea.username} {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <div className="sm:hidden flex items-center space-x-2">
              <button 
                onClick={() => handleVote('up')}
                className={`p-1 rounded-md transition-colors ${
                  idea.userVote === 'up'
                    ? 'bg-primary-100 text-primary-600' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                disabled={!isAuthenticated}
              >
                <ThumbsUp size={16} />
              </button>
              <span className="text-sm font-medium">
                {idea.upvotes - idea.downvotes}
              </span>
              <button 
                onClick={() => handleVote('down')}
                className={`p-1 rounded-md transition-colors ${
                  idea.userVote === 'down' 
                    ? 'bg-error-100 text-error-600' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                disabled={!isAuthenticated}
              >
                <ThumbsDown size={16} />
              </button>
            </div>
          </div>
          
          <Link to={`/ideas/${idea.id}`} className="mt-2 block">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
              {idea.title}
            </h3>
            <p className="mt-1 text-gray-700 line-clamp-2">
              {idea.description}
            </p>
          </Link>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {idea.tags.map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Link 
              to={`/ideas/${idea.id}`} 
              className="flex items-center text-sm text-gray-600 hover:text-primary-600"
            >
              <MessageCircle size={16} className="mr-1" />
              {idea.comments.length} comment{idea.comments.length !== 1 && 's'}
            </Link>
            
            <Link 
              to={`/ideas/${idea.id}`} 
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Read more →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;