import Navbar from '../../components/Navbar';

export default function About() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-indigo-100">
      <Navbar />
      <div className="pt-24 flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">About Solana Token Deployer</h1>
            
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">What is Solana Token Deployer?</h2>
              <p className="text-gray-700 mb-4">
                Solana Token Deployer is an open-source application that simplifies the creation and deployment of 
                SPL tokens on the Solana blockchain. This platform is designed for developers, entrepreneurs, and 
                crypto enthusiasts who want to launch their own tokens without deep technical knowledge.
              </p>
              <p className="text-gray-700 mb-4">
                Our platform leverages the power and speed of Solana, one of the fastest blockchain networks available,
                to create tokens that can be used for various purposes including DeFi projects, NFT marketplaces, 
                community rewards, and more.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Easy-to-use interface for token creation</li>
                <li>Customizable token parameters (name, symbol, decimals, supply)</li>
                <li>Integration with Raydium for liquidity pool creation</li>
                <li>Full Solana wallet integration</li>
                <li>Open-source and community-driven</li>
                <li>Supports both mainnet and devnet deployments</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold mb-4">Security & Transparency</h2>
              <p className="text-gray-700 mb-4">
                All our code is open-source and available for review by the community. We prioritize security and follow 
                best practices in blockchain development. Our token creation process is transparent, and you maintain full 
                control over your tokens.
              </p>
              <p className="text-gray-700">
                We do not store your private keys or have access to your funds. All interactions with the Solana blockchain 
                are conducted directly through your connected wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">© {new Date().getFullYear()} Solana Token Deployer</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-indigo-600">Terms</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600">Privacy</a>
              <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600">Solana</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
} 