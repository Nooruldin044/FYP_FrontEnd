import React from 'react';
import { Link } from 'react-router-dom';
import { Github as GitHub, Twitter, Linkedin, Lightbulb } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gray-50 rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">CrowdSourceIdeas</span>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link to="/" className="text-base text-gray-600 hover:text-primary-600">
              Browse Ideas
            </Link>
            <Link to="/create" className="text-base text-gray-600 hover:text-primary-600">
              Submit Idea
            </Link>
          </div>

          <div className="flex space-x-4">
            <a href="https://github.com/Nooruldin044/" target="_blank" className="text-gray-400 hover:text-gray-500" aria-label="GitHub">
              <GitHub className="h-5 w-5" />
            </a>
            <a href="#" target="_blank" className="text-gray-400 hover:text-gray-500" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://www.linkedin.com/in/noor-ul-din-250225260/" target="_blank" className="text-gray-400 hover:text-gray-500" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          &copy; {currentYear} CrowdSourceIdeas. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
