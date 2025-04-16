'use client';

import React, { useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createToken } from '../utils/program';

interface TokenFormData {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  imageUrl: string;
  twitterUrl: string;
  telegramUrl: string;
  addLiquidity: boolean;
}

const TokenForm: React.FC = () => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [isLoading, setIsLoading] = useState(false);
  const [tokenMint, setTokenMint] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    decimals: 9,
    initialSupply: 1000000,
    imageUrl: '',
    twitterUrl: '',
    telegramUrl: '',
    addLiquidity: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'decimals' || name === 'initialSupply' ? Number(value) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a production app, you would upload this to IPFS or another storage service
      // For this demo, we'll just create a local object URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormData(prev => ({
        ...prev,
        imageUrl: imageUrl // In a real app, this would be the IPFS URL
      }));
    }
  };

  const nextStep = () => {
    setFormStep(formStep + 1);
  };

  const prevStep = () => {
    setFormStep(formStep - 1);
  };

  const createTokenHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey || !wallet.signTransaction) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setIsLoading(true);

      // Connect to Solana devnet
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      console.log('Creating token with params:', formData);
      
      // Create a wallet adapter with the correct types
      const walletAdapter = {
        publicKey,
        signTransaction: wallet.signTransaction
      };
      
      // Create token using our updated SPL token implementation
      const result = await createToken(
        connection,
        walletAdapter,
        {
          name: formData.name,
          symbol: formData.symbol,
          decimals: formData.decimals,
          initialSupply: formData.initialSupply,
          imageUrl: formData.imageUrl,
          twitterUrl: formData.twitterUrl,
          telegramUrl: formData.telegramUrl,
        }
      );
      
      setTokenMint(result.mint);
      console.log('Token created successfully!', result);
    } catch (error) {
      console.error('Error creating token:', error);
      alert(`Error creating token: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepOne = () => (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-white">Basic Information</h3>
        <p className="text-blue-200/80 text-sm">Enter the core details for your token</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-blue-200">Token Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full bg-indigo-900/30 border border-indigo-700/50 text-white rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="My Token"
          />
        </div>
        
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-blue-200">Token Symbol</label>
          <input
            id="symbol"
            type="text"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            required
            className="mt-1 block w-full bg-indigo-900/30 border border-indigo-700/50 text-white rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="MTK"
          />
        </div>
        
        <div>
          <label htmlFor="decimals" className="block text-sm font-medium text-blue-200">Decimals</label>
          <input
            id="decimals"
            type="number"
            name="decimals"
            value={formData.decimals}
            onChange={handleChange}
            min="0"
            max="9"
            required
            className="mt-1 block w-full bg-indigo-900/30 border border-indigo-700/50 text-white rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-blue-300/70 mt-1">Most tokens use 9 decimals</p>
        </div>
        
        <div>
          <label htmlFor="initialSupply" className="block text-sm font-medium text-blue-200">Initial Supply</label>
          <input
            id="initialSupply"
            type="number"
            name="initialSupply"
            value={formData.initialSupply}
            onChange={handleChange}
            min="1"
            required
            className="mt-1 block w-full bg-indigo-900/30 border border-indigo-700/50 text-white rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          disabled={!formData.name || !formData.symbol}
          className={`px-6 py-2 rounded-full font-medium ${
            !formData.name || !formData.symbol 
              ? 'bg-indigo-800/50 text-indigo-300/50 cursor-not-allowed' 
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all'
          }`}
        >
          Next Step
        </button>
      </div>
    </>
  );

  const renderStepTwo = () => (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-white">Branding & Socials</h3>
        <p className="text-blue-200/80 text-sm">Add visuals and social links to your token</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="tokenImage" className="block text-sm font-medium text-blue-200 mb-2">Token Image/Logo</label>
          <div className="flex items-center space-x-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              previewImage ? '' : 'border-2 border-dashed border-indigo-500'
            }`}>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Token preview"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 border border-indigo-500 text-indigo-300 rounded-lg hover:bg-indigo-900/50 transition-colors"
              >
                {previewImage ? 'Change Image' : 'Upload Image'}
              </button>
              <input
                ref={fileInputRef}
                id="tokenImage"
                name="tokenImage"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <p className="mt-2 text-xs text-blue-300/70">Recommended size: 128x128px</p>
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="twitterUrl" className="block text-sm font-medium text-blue-200">Twitter Username (optional)</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-indigo-400 sm:text-sm">@</span>
            </div>
            <input
              id="twitterUrl"
              type="text"
              name="twitterUrl"
              value={formData.twitterUrl}
              onChange={handleChange}
              className="block w-full bg-indigo-900/30 border border-indigo-700/50 text-white rounded-lg shadow-sm py-3 pl-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="yourusername"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="telegramUrl" className="block text-sm font-medium text-blue-200">Telegram Group (optional)</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-indigo-400 sm:text-sm">t.me/</span>
            </div>
            <input
              id="telegramUrl"
              type="text"
              name="telegramUrl"
              value={formData.telegramUrl}
              onChange={handleChange}
              className="block w-full bg-indigo-900/30 border border-indigo-700/50 text-white rounded-lg shadow-sm py-3 pl-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your_group"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 border border-indigo-500 text-indigo-300 rounded-full hover:bg-indigo-900/50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all"
        >
          Next Step
        </button>
      </div>
    </>
  );

  const renderStepThree = () => (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-white">Final Options</h3>
        <p className="text-blue-200/80 text-sm">Review and set additional options</p>
      </div>
      
      <div className="bg-indigo-900/30 p-5 rounded-xl border border-indigo-700/50 mb-6">
        <h4 className="font-medium text-white mb-3">Token Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-300">Name:</p>
            <p className="text-white font-medium">{formData.name}</p>
          </div>
          <div>
            <p className="text-blue-300">Symbol:</p>
            <p className="text-white font-medium">{formData.symbol}</p>
          </div>
          <div>
            <p className="text-blue-300">Decimals:</p>
            <p className="text-white font-medium">{formData.decimals}</p>
          </div>
          <div>
            <p className="text-blue-300">Initial Supply:</p>
            <p className="text-white font-medium">{formData.initialSupply.toLocaleString()}</p>
          </div>
          {formData.twitterUrl && (
            <div>
              <p className="text-blue-300">Twitter:</p>
              <p className="text-white font-medium">@{formData.twitterUrl}</p>
            </div>
          )}
          {formData.telegramUrl && (
            <div>
              <p className="text-blue-300">Telegram:</p>
              <p className="text-white font-medium">t.me/{formData.telegramUrl}</p>
            </div>
          )}
        </div>
        {previewImage && (
          <div className="mt-4 flex justify-center">
            <img src={previewImage} alt="Token" className="h-16 w-16 rounded-full" />
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex items-center p-4 bg-indigo-900/30 rounded-lg border border-indigo-700/50">
          <input
            id="addLiquidity"
            type="checkbox"
            name="addLiquidity"
            checked={formData.addLiquidity}
            onChange={handleChange}
            className="h-5 w-5 text-purple-500 focus:ring-purple-500 border-indigo-500 rounded"
          />
          <div className="ml-3">
            <label htmlFor="addLiquidity" className="font-medium text-white">Add to Raydium Liquidity Pool</label>
            <p className="text-xs text-blue-300/70 mt-1">This will allow trading of your token on Raydium DEX</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 border border-indigo-500 text-indigo-300 rounded-full hover:bg-indigo-900/50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading || !publicKey}
          className={`px-6 py-2 rounded-full font-medium ${
            !publicKey 
              ? 'bg-indigo-800/50 text-indigo-300/50 cursor-not-allowed' 
              : isLoading
                ? 'bg-purple-700 text-white'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </div>
          ) : publicKey ? 'Create Token' : 'Connect Wallet First'}
        </button>
      </div>
    </>
  );

  return (
    <div className="bg-indigo-800/40 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-indigo-600/30">
      {tokenMint ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 text-green-500 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Token Created Successfully!</h3>
          <p className="text-blue-200 mb-4">Your token is now live on the Solana network.</p>
          
          <div className="bg-indigo-900/50 border border-indigo-700/50 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm mb-1">Mint Address:</p>
            <p className="font-mono text-white break-all">{tokenMint}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
            <a 
              href={`https://explorer.solana.com/address/${tokenMint}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
            >
              View on Explorer
            </a>
            <button 
              onClick={() => setTokenMint(null)}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-emerald-500 to-teal-700 hover:from-emerald-600 hover:to-teal-800 shadow-md hover:shadow-lg transition-all"
            >
              Create Another Token
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={createTokenHandler} className="space-y-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 1 ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-indigo-900/50 text-indigo-400'} text-white font-medium text-sm`}>
                1
              </div>
              <div className={`w-12 h-1 ${formStep >= 2 ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-indigo-900/50'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 2 ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-indigo-900/50 text-indigo-400'} text-white font-medium text-sm`}>
                2
              </div>
              <div className={`w-12 h-1 ${formStep >= 3 ? 'bg-gradient-to-r from-purple-600 to-green-500' : 'bg-indigo-900/50'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 3 ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-indigo-900/50 text-indigo-400'} text-white font-medium text-sm`}>
                3
              </div>
            </div>
          </div>
          
          {formStep === 1 && renderStepOne()}
          {formStep === 2 && renderStepTwo()}
          {formStep === 3 && renderStepThree()}
        </form>
      )}
    </div>
  );
};

export default TokenForm; 