import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Mail, MapPin, Link as LinkIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';
import { IdeaContext, Idea } from '../contexts/IdeaContext';
import IdeaCard from '../components/Ideas/IdeaCard';

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]);
  const [activeTab, setActiveTab] = useState<'ideas' | 'about'>('ideas');
  
  const { user } = useContext(AuthContext);
  const { ideas } = useContext(IdeaContext);
  
  const isOwnProfile = user?.username === username;
  
  // Get profile details - in a real app, we would fetch this from an API
  const profileUser = isOwnProfile ? user : {
    id: '1',
    username: username,
    avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
    email: username + '@gmail.com',
    createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
  };
  
  useEffect(() => {
    if (username) {
      // Filter ideas by username
      const filteredIdeas = ideas.filter(idea => idea.username === username);
      setUserIdeas(filteredIdeas);
    }
  }, [username, ideas]);
  
  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User not found</h2>
            <p className="text-gray-700">The user you're looking for doesn't exist or has been deleted.</p>
            <div className="mt-6">
              <Link to="/" className="btn btn-primary">
                Back to Ideas
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-600 to-accent-500"></div>
          <div className="px-6 py-4 sm:px-8 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-4">
              <div className="flex-shrink-0">
                <img 
                  src={profileUser.avatar}
                  alt={profileUser.username}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover"
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{profileUser.username}</h1>
                <p className="text-sm text-gray-600">
                  Member for {formatDistanceToNow(new Date(profileUser.createdAt), { addSuffix: false })}
                </p>
              </div>
              {isOwnProfile && (
                <div className="mt-4 sm:mt-0 sm:ml-auto">
                  <Link to="/settings" className="btn btn-secondary">
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>
            
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-6">
                <button 
                  onClick={() => setActiveTab('ideas')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ideas'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ideas ({userIdeas.length})
                </button>
                <button 
                  onClick={() => setActiveTab('about')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'about'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  About
                </button>
              </nav>
            </div>
            
            {activeTab === 'ideas' && (
              <div>
                {userIdeas.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {isOwnProfile 
                        ? "You haven't shared any ideas yet." 
                        : `${profileUser.username} hasn't shared any ideas yet.`}
                    </p>
                    {isOwnProfile && (
                      <div className="mt-4">
                        <Link to="/create" className="btn btn-primary">
                          Share your first idea
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userIdeas.map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700">
                    {isOwnProfile 
                      ? "You haven't added a bio yet." 
                      : `${profileUser.username} hasn't added a bio yet.`}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Mail size={18} className="mr-2" />
                      <span>{profileUser.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar size={18} className="mr-2" />
                      <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    {isOwnProfile && (
                      <div className="mt-4">
                        <Link to="/settings" className="text-primary-600 hover:text-primary-800 font-medium">
                          Add more information to your profile
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;