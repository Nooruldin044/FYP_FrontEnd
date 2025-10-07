import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const IdeaContext = createContext();

export const IdeaProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Demo ideas always available
  const demoIdeas = [
    {
      id: "demo1",
      title: "AI-powered personal development coach",
      description:
        "An app that uses AI to analyze your habits, goals, and progress to provide personalized coaching.",
      userId: "demo_user1",
      username: "sarah_tech",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Tech&background=random",
      upvotes: 42,
      downvotes: 5,
      userVotes: {},
      tags: ["AI", "Personal Development", "Productivity"],
      category: "Technology",
      comments: [],
      createdAt: new Date(Date.now() - 172800000),
    },
    {
      id: "demo2",
      title: "Eco-friendly smart home system",
      description:
        "A smart home system that reduces energy consumption and monitors environmental impact.",
      userId: "demo_user2",
      username: "green_eco",
      avatar: "https://ui-avatars.com/api/?name=Green+Eco&background=random",
      upvotes: 15,
      downvotes: 2,
      userVotes: {},
      tags: ["Environment", "Smart Home", "Eco"],
      category: "Environment",
      comments: [],
      createdAt: new Date(Date.now() - 259200000),
    },
  ];

  // Load ideas from localStorage + merge with demo ideas
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ideas");
      let storedIdeas = stored ? JSON.parse(stored) : [];

      // restore comments for demo ideas separately
      const demoWithComments = demoIdeas.map((demo) => {
        const storedComments = JSON.parse(
          localStorage.getItem(`idea-comments-${demo.id}`)
        ) || [];
        return {
          ...demo,
          comments: storedComments.map((c) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          })),
        };
      });

      storedIdeas = storedIdeas.map((idea) => ({
        ...idea,
        createdAt: new Date(idea.createdAt),
        comments:
          idea.comments?.map((c) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          })) || [],
        userVotes: idea.userVotes || {},
      }));

      const mergedIdeas = [
        ...demoWithComments,
        ...storedIdeas.filter((i) => !demoIdeas.some((d) => d.id === i.id)),
      ];

      setIdeas(mergedIdeas);
    } catch (err) {
      console.error("Failed to load ideas, using demo only", err);
      setIdeas(demoIdeas);
    }
  }, []);

  // Save only user-created ideas
  const saveUserIdeas = (ideasArray) => {
    const nonDemoIdeas = ideasArray.filter((i) => !i.id.startsWith("demo"));
    localStorage.setItem("ideas", JSON.stringify(nonDemoIdeas));
  };

  // Save demo idea comments separately
  const saveDemoComments = (ideaId, comments) => {
    localStorage.setItem(`idea-comments-${ideaId}`, JSON.stringify(comments));
  };

  // Create new idea
  const createIdea = (ideaData) => {
    const newIdea = {
      ...ideaData,
      id: Date.now().toString(),
      userId: user?.id || "unknown",
      username: user?.username || "Unknown",
      avatar:
        user?.avatar ||
        `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`,
      upvotes: 0,
      downvotes: 0,
      userVotes: {},
      comments: [],
      createdAt: new Date(),
    };
    setIdeas((prev) => {
      const updatedIdeas = [newIdea, ...prev];
      saveUserIdeas(updatedIdeas);
      return updatedIdeas;
    });
    return newIdea;
  };

  // Update existing idea
  const updateIdea = (id, updatedFields) => {
    let updatedIdea = null;
    setIdeas((prev) => {
      const updatedIdeas = prev.map((idea) => {
        if (idea.id === id) {
          updatedIdea = { ...idea, ...updatedFields };
          if (id.startsWith("demo")) {
            saveDemoComments(id, updatedIdea.comments);
          }
          return updatedIdea;
        }
        return idea;
      });
      saveUserIdeas(updatedIdeas);
      return updatedIdeas;
    });
    return updatedIdea;
  };

  // Delete idea
  const deleteIdea = (id) => {
    setIdeas((prev) => {
      const updatedIdeas = prev.filter((i) => i.id !== id);
      saveUserIdeas(updatedIdeas);
      if (id.startsWith("demo")) {
        localStorage.removeItem(`idea-comments-${id}`);
      }
      return updatedIdeas;
    });
  };

  // Vote for idea
  const voteIdea = (id, voteType) => {
    if (!user) return;
    setIdeas((prev) => {
      const updatedIdeas = prev.map((idea) => {
        if (idea.id !== id) return idea;
        const userVotes = { ...idea.userVotes };
        const prevVote = userVotes[user.id];

        if (prevVote === "up") idea.upvotes--;
        if (prevVote === "down") idea.downvotes--;

        if (voteType === "up") idea.upvotes++;
        if (voteType === "down") idea.downvotes++;

        userVotes[user.id] = voteType || null;
        const updatedIdea = { ...idea, userVotes };

        if (id.startsWith("demo")) {
          saveDemoComments(id, updatedIdea.comments);
        }
        return updatedIdea;
      });
      saveUserIdeas(updatedIdeas);
      return updatedIdeas;
    });
  };

  // Add comment
  const addComment = (ideaId, commentData) => {
    const newComment = {
      ...commentData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setIdeas((prev) => {
      const updatedIdeas = prev.map((idea) => {
        if (idea.id === ideaId) {
          const updatedIdea = { ...idea, comments: [...idea.comments, newComment] };
          if (ideaId.startsWith("demo")) {
            saveDemoComments(ideaId, updatedIdea.comments);
          }
          return updatedIdea;
        }
        return idea;
      });
      saveUserIdeas(updatedIdeas);
      return updatedIdeas;
    });
  };

  // Get idea by ID
  const getIdeaById = (id) => ideas.find((idea) => idea.id === id) || null;

  return (
    <IdeaContext.Provider
      value={{
        ideas,
        isLoading,
        error,
        createIdea,
        updateIdea,
        deleteIdea,
        voteIdea,
        addComment,
        getIdeaById,
      }}
    >
      {children}
    </IdeaContext.Provider>
  );
};
