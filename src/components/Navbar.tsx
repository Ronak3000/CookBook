'use client';

import { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import React from 'react';
import { Button } from './ui/button';
import Link from 'next/link';

const Navbar = () => {
  const { data: session } = useSession();
  const user: User = session?.user;

  return (
    <nav className="bg-gray-800 text-white fixed top-0 w-full z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="/dashboard" className="text-2xl font-bold text-yellow-400">
          CookBook
        </a>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-sm md:text-base">
                Welcome, <strong>{user?.username || user?.email}</strong>
              </span>
              <Button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
