import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { IdeaContext } from '../../contexts/IdeaContext';

interface CommentFormProps {
  ideaId: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ ideaId }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useContext(AuthContext);
  const { addComment } = useContext(IdeaContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!comment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await addComment(ideaId, {
        userId: user!.id,
        username: user!.username,
        avatar: user!.avatar || '',
        content: comment.trim(),
      });
      
      setComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-center text-gray-600">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            Sign in
          </a> to leave a comment
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          <img 
            src={user?.avatar} 
            alt={user?.username} 
            className="h-8 w-8 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="input w-full"
              disabled={isSubmitting}
            />
            {error && (
              <p className="mt-1 text-sm text-error-600">{error}</p>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </div>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;