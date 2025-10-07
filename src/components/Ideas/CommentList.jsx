import { formatDistanceToNow } from "date-fns";

const CommentList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-sm">
          💬 No comments yet. Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200"
        >
          <div className="flex items-start gap-3">
            <img
              src={comment.avatar || "https://ui-avatars.com/api/?name=User"}
              alt={comment.username}
              className="h-10 w-10 rounded-full border"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">
                  {comment.username}
                </h4>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <p className="mt-2 text-gray-700 text-sm leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
