import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { User, LogOut, Settings } from 'lucide-react';

interface UserProfileProps {
  isDarkMode: boolean;
  onSignOut: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isDarkMode, onSignOut }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <button
        onClick={handleSignOut}
        className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
          isDarkMode 
            ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        title="Sign out"
      >
        <LogOut size={16} />
        <span className="text-sm font-medium">Sign Out</span>
      </button>
    </div>
  );
};

export default UserProfile;
