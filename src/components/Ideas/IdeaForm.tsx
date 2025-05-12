import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { IdeaContext } from '../../contexts/IdeaContext';

interface IdeaFormInputs {
  title: string;
  description: string;
  category: string;
}

const categories = [
  'Technology',
  'Business',
  'Health',
  'Education',
  'Environment',
  'Social',
  'Entertainment',
  'Other',
];

const IdeaForm: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { user } = useContext(AuthContext);
  const { createIdea } = useContext(IdeaContext);
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<IdeaFormInputs>();

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      
      const newTag = tagInput.trim().toLowerCase();
      
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: IdeaFormInputs) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      const newIdea = await createIdea({
        title: data.title,
        description: data.description,
        userId: user.id,
        username: user.username,
        avatar: user.avatar || '',
        tags,
        category: data.category,
      });
      
      navigate(`/ideas/${newIdea.id}`);
    } catch (err) {
      console.error('Failed to create idea:', err);
      setErrorMessage('Failed to create idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Share your idea</h2>
      
      {errorMessage && (
        <div className="bg-error-50 text-error-600 p-3 rounded-md mb-4 text-sm animate-fade-in">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            className={`input w-full ${errors.title ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Give your idea a descriptive title"
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 10,
                message: 'Title must be at least 10 characters',
              },
              maxLength: {
                value: 100,
                message: 'Title must be less than 100 characters',
              },
            })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            className={`input w-full ${errors.category ? 'border-error-500 focus:ring-error-500' : ''}`}
            {...register('category', {
              required: 'Category is required',
            })}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-error-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={6}
            className={`input w-full ${errors.description ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Describe your idea in detail. What problem does it solve? How would it work?"
            {...register('description', {
              required: 'Description is required',
              minLength: {
                value: 30,
                message: 'Description must be at least 30 characters',
              },
            })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (max 5)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 text-primary-500 hover:text-primary-700 focus:outline-none"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="relative">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="input w-full"
              placeholder="Type a tag and press Enter or comma (,)"
              disabled={tags.length >= 5}
            />
            {tagInput && tags.length < 5 && (
              <button
                type="button"
                onClick={() => {
                  const newTag = tagInput.trim().toLowerCase();
                  if (newTag && !tags.includes(newTag)) {
                    setTags([...tags, newTag]);
                    setTagInput('');
                  }
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-500 hover:text-primary-700"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Add up to 5 tags to help others find your idea. Press Enter or comma to add.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit Idea'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdeaForm;