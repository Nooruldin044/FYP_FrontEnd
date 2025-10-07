import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { AuthContext } from "../contexts/AuthContext";
import { IdeaContext } from "../contexts/IdeaContext";
import IdeaCard from "../components/Ideas/IdeaCard";

const UserProfilePage = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("ideas");
  const [editableProfile, setEditableProfile] = useState({ bio: "", location: "", socialLinks: {}, avatar: "" });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null); // 👈 keep selected file
  const [userIdeas, setUserIdeas] = useState([]);
  const [likedIdeas, setLikedIdeas] = useState([]);
  const [dislikedIdeas, setDislikedIdeas] = useState([]);
  const [commentedIdeas, setCommentedIdeas] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const { user, updateProfile } = useContext(AuthContext);
  const { ideas } = useContext(IdeaContext);

  const isOwnProfile = user?.username === username;

  const profileUser = isOwnProfile
    ? user
    : {
        id: "demo",
        username,
        avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
        email: `${username}@gmail.com`,
        createdAt: new Date(Date.now() - 86400000 * 30),
        bio: "",
        location: "",
        socialLinks: {},
      };

  // Editable profile
  useEffect(() => {
    setEditableProfile({
      bio: profileUser.bio || "",
      location: profileUser.location || "",
      socialLinks: profileUser.socialLinks || {},
      avatar: profileUser.avatar || "",
    });
    setAvatarPreview(profileUser.avatar || "");
  }, [profileUser]);

  // Sorting helper
  const sortIdeas = (ideasToSort, sortOption) => {
    switch (sortOption) {
      case "popular":
        return [...ideasToSort].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      case "trending":
        return [...ideasToSort].sort((a, b) => {
          const scoreA =
            (a.upvotes - a.downvotes) / (Date.now() - new Date(a.createdAt).getTime() + 1);
          const scoreB =
            (b.upvotes - b.downvotes) / (Date.now() - new Date(b.createdAt).getTime() + 1);
          return scoreB - scoreA;
        });
      case "newest":
      default:
        return [...ideasToSort].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  // Filter ideas for this user (deduplicate + sort)
  useEffect(() => {
    if (!ideas) return;
    const filtered = ideas.filter((idea) => idea.username === username);

    const unique = Array.from(new Map(filtered.map((i) => [i.id, i])).values());

    const mergedWithComments = unique.map((idea) => {
      const storedComments =
        JSON.parse(localStorage.getItem(`idea-comments-${idea.id}`)) || [];
      return {
        ...idea,
        comments: storedComments.length ? storedComments : idea.comments || [],
      };
    });

    setUserIdeas(sortIdeas(mergedWithComments, sortBy));
  }, [ideas, username, sortBy]);

  // Activity tab calculations including localStorage comments
  useEffect(() => {
    if (!user || !ideas) return;

    const allIdeas = ideas.map((idea) => {
      const storedComments =
        JSON.parse(localStorage.getItem(`idea-comments-${idea.id}`)) || [];
      return {
        ...idea,
        comments: storedComments.length ? storedComments : idea.comments || [],
      };
    });

    setLikedIdeas(allIdeas.filter((idea) => idea.userVotes?.[user.id] === "up"));
    setDislikedIdeas(allIdeas.filter((idea) => idea.userVotes?.[user.id] === "down"));
    setCommentedIdeas(
      allIdeas.filter(
        (idea) =>
          Array.isArray(idea.comments) &&
          idea.comments.some((c) => c.userId === user.id)
      )
    );
  }, [user, ideas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["linkedin", "twitter", "github"].includes(name)) {
      setEditableProfile({
        ...editableProfile,
        socialLinks: { ...editableProfile.socialLinks, [name]: value },
      });
    } else {
      setEditableProfile({ ...editableProfile, [name]: value });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file); // 👈 save file for uploading
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setEditableProfile({ ...editableProfile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedData = { ...editableProfile };
    if (avatarFile) {
      updatedData.avatarFile = avatarFile; // 👈 pass file to AuthContext
    }
    updateProfile(updatedData);
    setIsEditing(false);
  };

  const handleIdeaUpdate = (updatedIdea) => {
    const storedComments =
      JSON.parse(localStorage.getItem(`idea-comments-${updatedIdea.id}`)) || [];
    const updatedWithComments = {
      ...updatedIdea,
      comments: storedComments.length ? storedComments : updatedIdea.comments || [],
    };

    setUserIdeas((prevIdeas) => {
      const withoutDupes = prevIdeas.filter((i) => i.id !== updatedWithComments.id);
      const merged = [...withoutDupes, updatedWithComments];
      return sortIdeas(merged, sortBy);
    });

    if (user) {
      setCommentedIdeas((prev) => {
        const userHasComment = updatedWithComments.comments.some((c) => c.userId === user.id);
        const exists = prev.some((i) => i.id === updatedWithComments.id);
        if (userHasComment && !exists) return [...prev, updatedWithComments];
        if (!userHasComment && exists) return prev.filter((i) => i.id !== updatedWithComments.id);
        if (userHasComment && exists)
          return prev.map((i) => (i.id === updatedWithComments.id ? updatedWithComments : i));
        return prev;
      });

      setLikedIdeas((prev) => {
        const isLiked = updatedWithComments.userVotes?.[user.id] === "up";
        const exists = prev.some((i) => i.id === updatedWithComments.id);
        if (isLiked && !exists) return [...prev, updatedWithComments];
        if (!isLiked && exists) return prev.filter((i) => i.id !== updatedWithComments.id);
        return prev.map((i) => (i.id === updatedWithComments.id ? updatedWithComments : i));
      });

      setDislikedIdeas((prev) => {
        const isDisliked = updatedWithComments.userVotes?.[user.id] === "down";
        const exists = prev.some((i) => i.id === updatedWithComments.id);
        if (isDisliked && !exists) return [...prev, updatedWithComments];
        if (!isDisliked && exists) return prev.filter((i) => i.id !== updatedWithComments.id);
        return prev.map((i) => (i.id === updatedWithComments.id ? updatedWithComments : i));
      });
    }
  };

  const totalComments = userIdeas.reduce((acc, idea) => {
    const storedComments =
      JSON.parse(localStorage.getItem(`idea-comments-${idea.id}`)) || [];
    return acc + (storedComments.length || idea.comments?.length || 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-accent"></div>

          <div className="px-6 py-6 sm:px-8">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-end -mt-16">
              <img
                src={avatarPreview || profileUser.avatar}
                alt={profileUser.username}
                className="h-24 w-24 rounded-full border-4 border-white object-cover"
              />
              <div className="mt-4 sm:mt-0 sm:ml-4">
                <h1 className="text-2xl font-bold text-darkText">{profileUser.username}</h1>
                <p className="text-sm text-lightText">
                  Member for {formatDistanceToNow(new Date(profileUser.createdAt))}
                </p>
              </div>
              {isOwnProfile && !isEditing && (
                <div className="mt-4 sm:mt-0 sm:ml-auto">
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b mt-6 flex flex-col sm:flex-row sm:items-center justify-between">
              <nav className="flex space-x-6">
                <button
                  onClick={() => setActiveTab("ideas")}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "ideas"
                      ? "border-primary text-primary"
                      : "border-transparent text-lightText hover:text-darkText"
                  }`}
                >
                  Ideas ({userIdeas.length})
                  {totalComments > 0 && (
                    <span className="ml-1 inline-block bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                      {totalComments}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("about")}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "about"
                      ? "border-primary text-primary"
                      : "border-transparent text-lightText hover:text-darkText"
                  }`}
                >
                  About
                </button>

                {isOwnProfile && (
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "activity"
                        ? "border-primary text-primary"
                        : "border-transparent text-lightText hover:text-darkText"
                  }`}
                >
                  Activity
                  {commentedIdeas.length > 0 && (
                    <span className="ml-1 inline-block bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                      {commentedIdeas.length}
                    </span>
                  )}
                </button>
                )}
              </nav>

              {/* Sort Dropdown */}
              {activeTab === "ideas" && (
                <div className="mt-2 sm:mt-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-2 pr-3 py-1 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Popular</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
              )}
            </div>

            {/* Ideas Tab */}
            {activeTab === "ideas" && (
              <div className="mt-6 space-y-6">
                {userIdeas.length === 0 ? (
                  <div className="text-center py-8 text-lightText">
                    {isOwnProfile
                      ? "You haven't shared any ideas yet."
                      : `${profileUser.username} hasn't shared any ideas yet.`}
                    {isOwnProfile && (
                      <div className="mt-4">
                        <Link to="/create" className="btn btn-primary">
                          Share your first idea
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  userIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      showUserComment={false}
                      onUpdate={handleIdeaUpdate}
                    />
                  ))
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="mt-6 space-y-6">
                {likedIdeas.length === 0 &&
                dislikedIdeas.length === 0 &&
                commentedIdeas.length === 0 ? (
                  <div className="text-center py-8 text-lightText">No activity yet.</div>
                ) : (
                  <div className="space-y-4">
                    {likedIdeas.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-darkText mb-2">Liked Ideas</h3>
                        {likedIdeas.map((idea) => (
                          <IdeaCard key={idea.id} idea={idea} onUpdate={handleIdeaUpdate} />
                        ))}
                      </div>
                    )}
                    {dislikedIdeas.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-darkText mb-2">Disliked Ideas</h3>
                        {dislikedIdeas.map((idea) => (
                          <IdeaCard key={idea.id} idea={idea} onUpdate={handleIdeaUpdate} />
                        ))}
                      </div>
                    )}
                    {commentedIdeas.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-darkText mb-2">Commented Ideas</h3>
                        {commentedIdeas.map((idea) => (
                          <IdeaCard
                            key={idea.id}
                            idea={idea}
                            showUserComment={true}
                            onUpdate={handleIdeaUpdate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === "about" && (
              <div className="mt-6 space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    {/* Avatar Upload */}
                    <div>
                      <label className="block text-sm font-medium text-darkText">Profile Picture</label>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} />
                      {avatarPreview && (
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="mt-2 h-20 w-20 rounded-full object-cover border"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-darkText">Bio</label>
                      <textarea
                        name="bio"
                        value={editableProfile.bio}
                        onChange={handleChange}
                        className="mt-1 w-full border rounded p-2"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-darkText">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={editableProfile.location}
                        onChange={handleChange}
                        className="mt-1 w-full border rounded p-2"
                      />
                    </div>
                    {["linkedin", "twitter", "github"].map((platform) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-darkText">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </label>
                        <input
                          type="text"
                          name={platform}
                          value={editableProfile.socialLinks[platform] || ""}
                          onChange={handleChange}
                          className="mt-1 w-full border rounded p-2"
                        />
                      </div>
                    ))}
                    <button onClick={handleSave} className="btn btn-primary mt-4">
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>
                      <strong>Bio:</strong> {profileUser.bio || "No bio added."}
                    </p>
                    <p>
                      <strong>Location:</strong> {profileUser.location || "Not specified."}
                    </p>
                    <p>
                      <strong>LinkedIn:</strong> {profileUser.socialLinks.linkedin || "-"}
                    </p>
                    <p>
                      <strong>Twitter:</strong> {profileUser.socialLinks.twitter || "-"}
                    </p>
                    <p>
                      <strong>GitHub:</strong> {profileUser.socialLinks.github || "-"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
