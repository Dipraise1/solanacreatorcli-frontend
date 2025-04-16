'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  imageUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
}

export default function MyTokens() {
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    const fetchTokens = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch the user's tokens from the blockchain
        // For demo purposes, we'll use dummy data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dummy data
        const dummyTokens: TokenInfo[] = [
          {
            mint: '5YGgvtKCQrLpz3PyLQr9DxGsPqMihyMuK9UNnQoArWEu',
            name: 'Sample Token 1',
            symbol: 'ST1',
            balance: '1,000,000',
            decimals: 9,
            imageUrl: 'https://picsum.photos/id/237/200/200', // Random image
            twitterUrl: 'exampletoken',
            telegramUrl: 'exampletoken'
          },
          {
            mint: 'BxsKL6rFZ8PxGHFpuGMnx9cdFn7TUaMELBRCE9Z2FZzF',
            name: 'Sample Token 2',
            symbol: 'ST2',
            balance: '500,000',
            decimals: 6,
            imageUrl: 'https://picsum.photos/id/1/200/200', // Random image
            twitterUrl: 'example2',
            telegramUrl: 'example2'
          },
          {
            mint: 'AZ4LGqVSHtcQKJSZ2YMwxbdCTEDCbMjxFJe8TY7h2zFW',
            name: 'Moon Coin',
            symbol: 'MOON',
            balance: '10,000,000',
            decimals: 9,
            imageUrl: 'https://picsum.photos/id/110/200/200', // Random image
            twitterUrl: 'mooncoin',
            telegramUrl: 'mooncoin'
          },
          // Add more dummy tokens if needed
        ];
        
        setTokens(dummyTokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [publicKey]);

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 text-white">
      <Navbar />
      <div className="pt-24 flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">My Tokens</h1>
              <Link 
                href="/"
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Create New Token
              </Link>
            </div>
            
            {!publicKey ? (
              <div className="bg-indigo-800/40 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl border border-indigo-600/30 p-10 text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-indigo-700/50 rounded-full p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                <p className="text-lg text-blue-200 mb-6">Please connect your wallet to view your tokens.</p>
                <p className="text-blue-300 mb-4">Use the button in the top-right corner to connect.</p>
              </div>
            ) : isLoading ? (
              <div className="bg-indigo-800/40 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl border border-indigo-600/30 p-10 text-center">
                <div className="inline-flex items-center justify-center">
                  <svg className="animate-spin h-10 w-10 text-blue-300 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-xl font-medium text-blue-200">Loading your tokens...</span>
                </div>
              </div>
            ) : tokens.length === 0 ? (
              <div className="bg-indigo-800/40 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl border border-indigo-600/30 p-10 text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-indigo-700/50 rounded-full p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">No Tokens Found</h2>
                <p className="text-lg text-blue-200 mb-6">You don't have any tokens yet.</p>
                <Link 
                  href="/" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Create Your First Token
                </Link>
              </div>
            ) : (
              <div className="bg-indigo-800/40 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl border border-indigo-600/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-indigo-700/50">
                    <thead>
                      <tr className="bg-indigo-900/50">
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                          Token
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                          Balance
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                          Mint Address
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                          Social
                        </th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-blue-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-700/30">
                      {tokens.map((token, index) => (
                        <tr key={token.mint} className={index % 2 === 0 ? 'bg-indigo-900/20' : 'bg-indigo-900/10'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {token.imageUrl ? (
                                <div className="flex-shrink-0 h-12 w-12 mr-4">
                                  <img 
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500/50" 
                                    src={token.imageUrl} 
                                    alt={`${token.name} logo`}
                                  />
                                </div>
                              ) : (
                                <div className="flex-shrink-0 h-12 w-12 mr-4 bg-indigo-700/50 rounded-full flex items-center justify-center">
                                  <span className="text-lg font-bold text-white">{token.symbol.charAt(0)}</span>
                                </div>
                              )}
                              <div>
                                <div className="text-base font-medium text-white">{token.name}</div>
                                <div className="text-sm text-blue-300">${token.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-base text-white font-medium">{token.balance}</div>
                            <div className="text-xs text-blue-300">{token.decimals} decimals</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-blue-200 font-mono truncate max-w-[150px]">
                              {token.mint.substring(0, 8)}...{token.mint.substring(token.mint.length - 8)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-3">
                              {token.twitterUrl && (
                                <a 
                                  href={`https://twitter.com/${token.twitterUrl}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-300 hover:text-blue-100 transition-colors"
                                >
                                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                  </svg>
                                </a>
                              )}
                              {token.telegramUrl && (
                                <a 
                                  href={`https://t.me/${token.telegramUrl}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-300 hover:text-blue-100 transition-colors"
                                >
                                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.372-12 12 0 6.627 5.374 12 12 12 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12zm-3.536 13.659l-.698 4.363c.099 0 .142-.046.198-.1l.475-.458 2.467-2.253c.799 1.466 1.146 2.109 1.516 2.109.42 0 .68-.143.708-.566.021-.396-.171-.648-3.558-3.492-.364-.306-.761-.306-1.108.046zm11.175-9.117c-.066-.282-.213-.451-.497-.534-.38-.112-.866-.041-1.14.034-.793.218-6.905 2.71-8.254 3.258-1.56.636-3.468 1.446-3.464 2.694-.002.394.15.756.41 1.03.287.3.676.486 1.136.513.55.033 1.214-.122 4.738-1.568.546-.225.903-.694.897-1.23.007-.1-.046-.198-.128-.267-.203-.176-.518-.131-1.324.197l-3.6 1.313c-.456.165-.752.136-.826.043.026-.346.495-.633 2.085-1.347.78-.349 1.752-.784 2.94-1.304l3.476-1.532 3.148-1.292c.098-.038.197-.074.295-.113.261-.097.559-.21.748-.368.14-.116.238-.25.287-.41.068-.21.073-.514-.326-.514-.112 0-.249.027-.403.068z" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a 
                              href={`https://explorer.solana.com/address/${token.mint}?cluster=devnet`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center mr-3 px-3 py-1 bg-blue-900/30 text-blue-300 hover:text-white rounded-full text-xs transition-colors border border-blue-700/50"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Explorer
                            </a>
                            <a 
                              href="#" 
                              className="inline-flex items-center px-3 py-1 bg-purple-900/30 text-purple-300 hover:text-white rounded-full text-xs transition-colors border border-purple-700/50"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                              </svg>
                              Manage
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-indigo-950/80 py-8 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src="/solana-logo.svg" alt="Solana" className="h-8 w-auto" />
              <p className="text-blue-200 mt-2">© {new Date().getFullYear()} Solana Token Deployer</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">Privacy</a>
              <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">Solana</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
} 