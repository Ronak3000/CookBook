import React from 'react';
import { Pencil, Lightbulb, Book } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white fixed bottom-0 w-full z-50 shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-around items-center">
        <a
          href="/post-blogs"
          className="flex flex-col items-center space-y-1 hover:text-yellow-400 transition duration-200"
        >
          <Pencil className="w-5 h-5" />
          <span className="text-xs">Post</span>
        </a>
        <a
          href="/suggest"
          className="flex flex-col items-center space-y-1 hover:text-yellow-400 transition duration-200"
        >
          <Lightbulb className="w-5 h-5" />
          <span className="text-xs">Suggest</span>
        </a>
        <a
          href="/get-user-blogs"
          className="flex flex-col items-center space-y-1 hover:text-yellow-400 transition duration-200"
        >
          <Book className="w-5 h-5" />
          <span className="text-xs">My Blogs</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
