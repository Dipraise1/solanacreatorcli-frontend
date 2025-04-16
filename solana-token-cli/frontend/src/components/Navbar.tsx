'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const { publicKey } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'backdrop-blur-lg bg-indigo-950/80 shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-9 w-auto"
                src="/solana-logo.svg"
                alt="Solana Logo"
              />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">Solana Token Deployer</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link 
                href="/" 
                className="text-gray-100 hover:text-purple-300 px-3 py-2 text-sm font-medium transition-colors"
              >
                Create Token
              </Link>
              <Link 
                href="/my-tokens" 
                className="text-gray-100 hover:text-purple-300 px-3 py-2 text-sm font-medium transition-colors"
              >
                My Tokens
              </Link>
              <Link 
                href="/about" 
                className="text-gray-100 hover:text-purple-300 px-3 py-2 text-sm font-medium transition-colors"
              >
                About
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:block">
              <WalletMultiButton className="wallet-adapter-button !bg-gradient-to-r !from-pink-500 !to-purple-600 !rounded-full !px-6 !py-2 !font-medium !transition-all !shadow-md hover:!shadow-lg" />
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2"
              >
                {mobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-indigo-950/95 backdrop-blur-lg transition-all duration-300`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/" 
            className="block text-gray-100 hover:bg-indigo-800/50 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Create Token
          </Link>
          <Link 
            href="/my-tokens" 
            className="block text-gray-100 hover:bg-indigo-800/50 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            My Tokens
          </Link>
          <Link 
            href="/about" 
            className="block text-gray-100 hover:bg-indigo-800/50 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <div className="mt-4 px-3">
            <WalletMultiButton className="wallet-adapter-button w-full !bg-gradient-to-r !from-pink-500 !to-purple-600 !rounded-full !py-2 !font-medium !transition-all !text-center" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 