import React, { createContext, useState, useEffect } from "react";

// Auth context with default values
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateProfile: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          bio: parsedUser.bio || "",
          location: parsedUser.location || "",
          socialLinks: parsedUser.socialLinks || {},
          ideasSubmitted: parsedUser.ideasSubmitted || [],
          likedIdeas: parsedUser.likedIdeas || [],
          comments: parsedUser.comments || [],
        });
      } catch (err) {
        console.error("Invalid stored user:", err);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Helper to get all registered users
  const getRegisteredUsers = () => {
    const users = localStorage.getItem("registeredUsers");
    return users ? JSON.parse(users) : [];
  };

  // Login
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const users = getRegisteredUsers();
      const existingUser = users.find((u) => u.email === email);

      if (!existingUser) throw new Error("User not registered.");
      if (existingUser.password !== password) throw new Error("Invalid password.");

      const updatedUser = {
        ...existingUser,
        bio: existingUser.bio || "",
        location: existingUser.location || "",
        socialLinks: existingUser.socialLinks || {},
        ideasSubmitted: existingUser.ideasSubmitted || [],
        likedIdeas: existingUser.likedIdeas || [],
        comments: existingUser.comments || [],
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error("Login failed:", err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
      if (!username.trim()) throw new Error("Username is required.");
      if (!/\S+@\S+\.\S+/.test(email)) throw new Error("Invalid email.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters long.");

      const users = getRegisteredUsers();
      if (users.some((u) => u.email === email)) throw new Error("Email already registered.");

      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // ⚠️ plain text for demo
        avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
        bio: "",
        location: "",
        socialLinks: {},
        ideasSubmitted: [],
        likedIdeas: [],
        comments: [],
        createdAt: new Date(),
      };

      users.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(users));
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (err) {
      console.error("Registration failed:", err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile (supports avatarFile upload)
  const updateProfile = (updatedData) => {
    const saveUpdatedUser = (updatedUser) => {
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      const users = getRegisteredUsers();
      const index = users.findIndex((u) => u.id === updatedUser.id);
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem("registeredUsers", JSON.stringify(users));
      }
    };

    if (updatedData.avatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = { ...user, ...updatedData, avatar: reader.result };
        delete updatedUser.avatarFile;
        saveUpdatedUser(updatedUser);
      };
      reader.readAsDataURL(updatedData.avatarFile);
    } else {
      const updatedUser = { ...user, ...updatedData };
      saveUpdatedUser(updatedUser);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
