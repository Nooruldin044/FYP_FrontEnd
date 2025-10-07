import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import { IdeaContext } from "../../contexts/IdeaContext";

const categories = [
  "Technology",
  "Business",
  "Health",
  "Education",
  "Environment",
  "Social",
  "Entertainment",
  "Other",
];

const IdeaForm = () => {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { user } = useContext(AuthContext);
  const { createIdea } = useContext(IdeaContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const newIdea = createIdea({
        ...data,
        userId: user.id,
        username: user.username,
        avatar:
          user.avatar ||
          `https://ui-avatars.com/api/?name=${user.username}&background=random`,
        tags,
      });
      // Navigate to idea detail page after creation
      navigate(`/ideas/${newIdea.id}`);
    } catch (err) {
      console.error("Failed to create idea:", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-8">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">💡 Share Your Idea</h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-600 p-3 rounded-md mb-4 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Give your idea a descriptive title"
            {...register("title", {
              required: "Title is required",
              minLength: { value: 10, message: "At least 10 characters" },
              maxLength: { value: 100, message: "Max 100 characters" },
            })}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
            {...register("category", { required: "Category is required" })}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={6}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Describe your idea in detail..."
            {...register("description", {
              required: "Description is required",
              minLength: { value: 30, message: "At least 30 characters" },
            })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (max 5)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Type a tag and press Enter"
              disabled={tags.length >= 5}
            />
            {tagInput && tags.length < 5 && (
              <button
                type="button"
                onClick={() => {
                  const newTag = tagInput.trim().toLowerCase();
                  if (newTag && !tags.includes(newTag)) {
                    setTags([...tags, newTag]);
                    setTagInput("");
                  }
                }}
                className="absolute right-3 top-2.5 text-blue-500 hover:text-blue-700"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Add up to 5 tags. Press Enter or comma.</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 
                       0 5.373 0 12h4zm2 5.291A7.962 
                       7.962 0 014 12H0c0 3.042 1.135 
                       5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Idea"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdeaForm;
