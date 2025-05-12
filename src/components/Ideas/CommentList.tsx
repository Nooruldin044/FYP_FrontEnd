import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '../../contexts/IdeaContext';

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white p-4 rounded-lg border border-gray-200 animate-enter">
          <div className="flex items-start space-x-3">
            <img 
              src={comment.avatar} 
              alt={comment.username} 
              className="h-8 w-8 rounded-full"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{comment.username}</h4>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-gray-700">
                {comment.content}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;