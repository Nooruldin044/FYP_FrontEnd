import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Lightbulb } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gray-50 rounded-2xl shadow-md p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-7 w-7 text-yellow-500" />
            <span className="text-xl font-bold text-gray-900">
              CrowdSourceIdeas
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 text-sm font-medium">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Browse Ideas
            </Link>
            <Link
              to="/create"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Submit Idea
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex space-x-5">
            <a
              href="https://github.com/Nooruldin044/"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/noor-ul-din-250225260/"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-center text-sm text-gray-500">
          &copy; {currentYear} CrowdSourceIdeas. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
