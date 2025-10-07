import React, { useContext, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, MessageCircle, Edit, Trash2, Check, X, Send } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import { IdeaContext } from "../../contexts/IdeaContext";

const IdeaCard = ({ idea, showUserComment = false, onUpdate }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { voteIdea, deleteIdea, updateIdea } = useContext(IdeaContext);

  const [userVote, setUserVote] = useState(user ? idea.userVotes?.[user.id] || null : null);
  const [upvotes, setUpvotes] = useState(idea.upvotes || 0);
  const [downvotes, setDownvotes] = useState(idea.downvotes || 0);
  const [comments, setComments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: idea.title,
    description: idea.description,
    category: idea.category,
    tags: idea.tags?.join(", ") || "",
  });
  const [newComment, setNewComment] = useState("");

  const isOwner = user?.id === idea.userId;

  // Load comments from localStorage
  useEffect(() => {
    const storedComments = JSON.parse(localStorage.getItem(`idea-comments-${idea.id}`)) || [];
    const merged = storedComments.length ? storedComments : idea.comments || [];
    setComments(merged);
  }, [idea]);

  // Save comments
  const saveComments = (commentsArray) => {
    localStorage.setItem(`idea-comments-${idea.id}`, JSON.stringify(commentsArray));
    setComments(commentsArray);

    // update parent for sorting refresh
    if (onUpdate) onUpdate({ ...idea, comments: commentsArray });
  };

  // Handle voting
  const handleVote = async (voteType) => {
    if (!isAuthenticated || !user) return;
    try {
      let newVote = voteType;
      if (userVote === voteType) newVote = null;

      await voteIdea(idea.id, newVote);

      // Optimistic update
      if (userVote === "up") setUpvotes((v) => v - 1);
      if (userVote === "down") setDownvotes((v) => v - 1);
      if (newVote === "up") setUpvotes((v) => v + 1);
      if (newVote === "down") setDownvotes((v) => v + 1);
      setUserVote(newVote);

      if (onUpdate) {
        onUpdate({
          ...idea,
          userVotes: { ...idea.userVotes, [user.id]: newVote },
          upvotes: upvotes + (newVote === "up" ? 1 : userVote === "up" ? -1 : 0),
          downvotes: downvotes + (newVote === "down" ? 1 : userVote === "down" ? -1 : 0),
        });
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this idea?")) return;
    try {
      await deleteIdea(idea.id);
      localStorage.removeItem(`idea-comments-${idea.id}`);
      if (onUpdate) onUpdate({ ...idea, deleted: true });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle edit
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleEditSave = async () => {
    try {
      const updatedIdea = {
        ...editData,
        tags: editData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const savedIdea = await updateIdea(idea.id, updatedIdea);
      if (onUpdate) onUpdate(savedIdea || { ...idea, ...updatedIdea });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save idea:", err);
    }
  };

  const handleEditCancel = () => {
    setEditData({
      title: idea.title,
      description: idea.description,
      category: idea.category,
      tags: idea.tags?.join(", ") || "",
    });
    setIsEditing(false);
  };

  // Handle new comment
  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    const commentObj = {
      userId: user.id,
      username: user.username,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...comments, commentObj];
    saveComments(updatedComments);
    setNewComment("");
  };

  const userComment =
    showUserComment &&
    user &&
    comments.find((c) => c.userId === user.id)?.content;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5 animate-enter">
      <div className="flex gap-4">
        {/* Votes */}
        <div className="hidden sm:flex flex-col items-center">
          <button
            onClick={() => handleVote("up")}
            className={`p-1.5 rounded-md ${userVote === "up" ? "bg-primary-100 text-primary-600" : "text-gray-500 hover:bg-gray-100"}`}
            disabled={!isAuthenticated}
          >
            <ThumbsUp size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-700 my-1">
            {upvotes - downvotes}
          </span>
          <button
            onClick={() => handleVote("down")}
            className={`p-1.5 rounded-md ${userVote === "down" ? "bg-red-100 text-red-600" : "text-gray-500 hover:bg-gray-100"}`}
            disabled={!isAuthenticated}
          >
            <ThumbsDown size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              {isEditing ? (
                <input
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  className="inline-block px-2 py-0.5 text-xs font-medium rounded-full border bg-primary-50 text-primary-700"
                />
              ) : (
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary-50 text-primary-700">
                  {idea.category}
                </span>
              )}

              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <img src={idea.avatar} alt={idea.username} className="h-6 w-6 rounded-full" />
                <span>
                  Posted by <span className="font-medium">{idea.username}</span>{" "}
                  {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex gap-2">
                <button onClick={handleDelete} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Delete Idea">
                  <Trash2 size={16} />
                </button>
                {isEditing ? (
                  <>
                    <button onClick={handleEditSave} className="p-1 text-green-500 hover:bg-green-50 rounded" title="Save Edit">
                      <Check size={16} />
                    </button>
                    <button onClick={handleEditCancel} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Cancel Edit">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Edit Idea">
                    <Edit size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Title & Description */}
          {isEditing ? (
            <div className="mt-3 space-y-2">
              <input
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                className="w-full text-lg font-semibold text-gray-900 border-b p-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                rows={3}
                className="w-full text-sm text-gray-700 border p-1 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded"
              />
              <input
                name="tags"
                value={editData.tags}
                onChange={handleEditChange}
                className="w-full text-xs text-gray-700 border p-1 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded"
                placeholder="Comma-separated tags"
              />
            </div>
          ) : (
            <>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{idea.title}</h3>
              <p className="mt-1 text-gray-700 text-sm line-clamp-3">{idea.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {idea.tags?.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* User Comment */}
          {userComment && (
            <div className="mt-2 p-2 border-l-4 border-primary-500 bg-primary-50 text-gray-800 text-sm rounded">
              Your comment: "{userComment}"
            </div>
          )}

          {/* Add Comment */}
          {isAuthenticated && !isEditing && (
            <div className="mt-3 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button onClick={handleAddComment} className="p-1 bg-primary-500 text-white rounded hover:bg-primary-600">
                <Send size={16} />
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <MessageCircle size={16} />
            <span>{comments.length} comment{comments.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="mt-2 space-y-2">
            {comments.map((c, idx) => (
              <div key={idx} className="p-2 border-l-4 border-gray-200 bg-gray-50 rounded text-gray-800">
                <span className="font-medium">{c.username}</span>: {c.content}
                <span className="ml-2 text-xs text-gray-500">
                  ({formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })})
                </span>
              </div>
            ))}
          </div>
          {comments.length === 0 && (
            <span className="flex items-center text-gray-600 mt-2">
              <MessageCircle size={16} className="mr-1" /> No comments yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;
