import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  createdAt: Date;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  userId: string;
  username: string;
  avatar: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  tags: string[];
  category: string;
  comments: Comment[];
  createdAt: Date;
}

interface IdeaContextType {
  ideas: Idea[];
  isLoading: boolean;
  error: string | null;
  fetchIdeas: () => Promise<void>;
  getIdeaById: (id: string) => Idea | undefined;
  createIdea: (idea: Omit<Idea, 'id' | 'upvotes' | 'downvotes' | 'comments' | 'createdAt'>) => Promise<Idea>;
  updateIdea: (id: string, ideaData: Partial<Idea>) => Promise<Idea>;
  deleteIdea: (id: string) => Promise<void>;
  voteIdea: (id: string, voteType: 'up' | 'down' | null) => Promise<void>;
  addComment: (ideaId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
}

const defaultIdeaContext: IdeaContextType = {
  ideas: [],
  isLoading: false,
  error: null,
  fetchIdeas: async () => {},
  getIdeaById: () => undefined,
  createIdea: async () => ({ 
    id: '', 
    title: '', 
    description: '', 
    userId: '', 
    username: '', 
    avatar: '',
    upvotes: 0, 
    downvotes: 0, 
    tags: [], 
    category: '', 
    comments: [], 
    createdAt: new Date() 
  }),
  updateIdea: async () => ({ 
    id: '', 
    title: '', 
    description: '', 
    userId: '', 
    username: '', 
    avatar: '',
    upvotes: 0, 
    downvotes: 0, 
    tags: [], 
    category: '', 
    comments: [], 
    createdAt: new Date() 
  }),
  deleteIdea: async () => {},
  voteIdea: async () => {},
  addComment: async () => {},
};

export const IdeaContext = createContext<IdeaContextType>(defaultIdeaContext);

interface IdeaProviderProps {
  children: ReactNode;
}

export const IdeaProvider: React.FC<IdeaProviderProps> = ({ children }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load ideas from localStorage on mount
  useEffect(() => {
    const storedIdeas = localStorage.getItem('ideas');
    if (storedIdeas) {
      try {
        const parsedIdeas = JSON.parse(storedIdeas);
        setIdeas(parsedIdeas.map((idea: any) => ({
          ...idea,
          createdAt: new Date(idea.createdAt),
          comments: idea.comments.map((comment: any) => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
          })),
        })));
      } catch (err) {
        console.error('Failed to parse stored ideas:', err);
        setError('Failed to load ideas. Please try refreshing the page.');
      }
    } else {
      // Generate some mock data if none exists
      generateMockData();
    }
  }, []);

  // Save ideas to localStorage whenever they change
  useEffect(() => {
    if (ideas.length > 0) {
      localStorage.setItem('ideas', JSON.stringify(ideas));
    }
  }, [ideas]);

  const generateMockData = () => {
    const mockIdeas: Idea[] = [
      {
        id: '1',
        title: 'AI-powered personal development coach',
        description: 'An app that uses AI to analyze your habits, goals, and progress to provide personalized coaching for personal development. It would offer daily challenges, track your progress, and adapt to your unique needs.',
        userId: 'user1',
        username: 'sarah_tech',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Tech&background=random',
        upvotes: 42,
        downvotes: 5,
        tags: ['AI', 'Personal Development', 'Productivity'],
        category: 'Technology',
        comments: [
          {
            id: 'comment1',
            userId: 'user2',
            username: 'john_dev',
            avatar: 'https://ui-avatars.com/api/?name=John+Dev&background=random',
            content: 'This would be incredibly useful. I\'d love to see integration with existing habit tracking apps.',
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
          },
          {
            id: 'comment2',
            userId: 'user3',
            username: 'tech_enthusiast',
            avatar: 'https://ui-avatars.com/api/?name=Tech+Enthusiast&background=random',
            content: 'How would you handle privacy concerns with AI analyzing personal data?',
            createdAt: new Date(Date.now() - 43200000), // 12 hours ago
          },
        ],
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
      },
      {
        id: '2',
        title: 'Sustainable food delivery platform',
        description: 'A food delivery platform that exclusively partners with restaurants using sustainable practices and packaging. Users could see the carbon footprint of their orders and earn rewards for making eco-friendly choices.',
        userId: 'user4',
        username: 'eco_innovator',
        avatar: 'https://ui-avatars.com/api/?name=Eco+Innovator&background=random',
        upvotes: 28,
        downvotes: 3,
        tags: ['Sustainability', 'Food', 'Delivery'],
        category: 'Environment',
        comments: [
          {
            id: 'comment3',
            userId: 'user5',
            username: 'green_living',
            avatar: 'https://ui-avatars.com/api/?name=Green+Living&background=random',
            content: 'Love this idea! Would be great to include local farms as partners too.',
            createdAt: new Date(Date.now() - 36000000), // 10 hours ago
          },
        ],
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
      },
      {
        id: '3',
        title: 'Community-based elderly care network',
        description: 'An app connecting elderly people with volunteers in their neighborhood for assistance with daily tasks, companionship, and emergencies. Would include a point system where volunteers earn points that can be used when they need help in the future.',
        userId: 'user6',
        username: 'community_builder',
        avatar: 'https://ui-avatars.com/api/?name=Community+Builder&background=random',
        upvotes: 35,
        downvotes: 1,
        tags: ['Elderly Care', 'Community', 'Social Impact'],
        category: 'Health',
        comments: [
          {
            id: 'comment4',
            userId: 'user7',
            username: 'healthcare_pro',
            avatar: 'https://ui-avatars.com/api/?name=Healthcare+Pro&background=random',
            content: 'This addresses a real need. Consider adding basic health monitoring features as well.',
            createdAt: new Date(Date.now() - 72000000), // 20 hours ago
          },
        ],
        createdAt: new Date(Date.now() - 345600000), // 4 days ago
      },
    ];

    setIdeas(mockIdeas);
    localStorage.setItem('ideas', JSON.stringify(mockIdeas));
  };

  const fetchIdeas = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll just use the data from state
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
      setError('Failed to fetch ideas. Please try again.');
      setIsLoading(false);
    }
  };

  const getIdeaById = (id: string) => {
    return ideas.find(idea => idea.id === id);
  };

  const createIdea = async (ideaData: Omit<Idea, 'id' | 'upvotes' | 'downvotes' | 'comments' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newIdea: Idea = {
        ...ideaData,
        id: Date.now().toString(),
        upvotes: 0,
        downvotes: 0,
        comments: [],
        createdAt: new Date(),
      };
      
      setIdeas(prevIdeas => [newIdea, ...prevIdeas]);
      setIsLoading(false);
      return newIdea;
    } catch (err) {
      console.error('Failed to create idea:', err);
      setError('Failed to create idea. Please try again.');
      setIsLoading(false);
      throw err;
    }
  };

  const updateIdea = async (id: string, ideaData: Partial<Idea>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedIdeas = ideas.map(idea => 
        idea.id === id ? { ...idea, ...ideaData } : idea
      );
      
      setIdeas(updatedIdeas);
      setIsLoading(false);
      return updatedIdeas.find(idea => idea.id === id) as Idea;
    } catch (err) {
      console.error('Failed to update idea:', err);
      setError('Failed to update idea. Please try again.');
      setIsLoading(false);
      throw err;
    }
  };

  const deleteIdea = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to delete idea:', err);
      setError('Failed to delete idea. Please try again.');
      setIsLoading(false);
      throw err;
    }
  };

  const voteIdea = async (id: string, voteType: 'up' | 'down' | null) => {
    setError(null);
    
    try {
      setIdeas(prevIdeas => prevIdeas.map(idea => {
        if (idea.id !== id) return idea;
        
        let upvotes = idea.upvotes;
        let downvotes = idea.downvotes;
        
        // Remove previous vote if any
        if (idea.userVote === 'up') upvotes--;
        if (idea.userVote === 'down') downvotes--;
        
        // Add new vote
        if (voteType === 'up') upvotes++;
        if (voteType === 'down') downvotes++;
        
        return {
          ...idea,
          upvotes,
          downvotes,
          userVote: voteType,
        };
      }));
    } catch (err) {
      console.error('Failed to vote:', err);
      setError('Failed to register vote. Please try again.');
      throw err;
    }
  };

  const addComment = async (ideaId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    setError(null);
    
    try {
      const newComment: Comment = {
        ...commentData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      
      setIdeas(prevIdeas => prevIdeas.map(idea => {
        if (idea.id !== ideaId) return idea;
        
        return {
          ...idea,
          comments: [...idea.comments, newComment],
        };
      }));
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment. Please try again.');
      throw err;
    }
  };

  return (
    <IdeaContext.Provider
      value={{
        ideas,
        isLoading,
        error,
        fetchIdeas,
        getIdeaById,
        createIdea,
        updateIdea,
        deleteIdea,
        voteIdea,
        addComment,
      }}
    >
      {children}
    </IdeaContext.Provider>
  );
};

export default IdeaContext;