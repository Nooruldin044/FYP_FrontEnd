import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { IdeaContext } from "../../contexts/IdeaContext";

const CommentForm = ({ ideaId }) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { user, isAuthenticated } = useContext(AuthContext);
  const { addComment } = useContext(IdeaContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!comment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addComment(ideaId, {
        userId: user?.id,
        username: user?.username,
        avatar: user?.avatar || "",
        content: comment.trim(),
      });

      setComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
        <p className="text-gray-600">
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Sign in
          </button>{" "}
          to leave a comment
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={user?.avatar || "https://ui-avatars.com/api/?name=User"}
            alt={user?.username}
            className="h-10 w-10 rounded-full border"
          />
          <div className="flex-1">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm resize-none"
              disabled={isSubmitting}
            />
            {error && (
              <p className="mt-1 text-sm text-red-500 font-medium">{error}</p>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
                      />
                    </svg>
                    Posting...
                  </>
                ) : (
                  "Post"
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
