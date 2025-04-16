import Navbar from '../components/Navbar';
import TokenForm from '../components/TokenForm';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-24 flex-grow">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                Launch Your SPL Token with Ease
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-lg">
                Create, deploy, and manage your own Solana token in minutes. No coding required - just connect your wallet and go!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="#create-token" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-medium shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px]">
                  Create Token Now
                </Link>
                <a href="https://solana.com/developers" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-transparent border-2 border-blue-400 text-blue-200 rounded-full font-medium hover:bg-blue-900/30 transition-all">
                  Learn More
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-[350px] h-[350px]">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full opacity-20 blur-3xl"></div>
                <img src="/solana-logo.svg" alt="Solana" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 z-10" />
                <div className="absolute inset-0 border-4 border-white/10 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Token Deployer?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:translate-y-[-5px]">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-14 h-14 flex items-center justify-center rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-blue-100">Deploy your token in seconds with our optimized deployment process on Solana.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:translate-y-[-5px]">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-14 h-14 flex items-center justify-center rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
            <p className="text-blue-100">Built on Solana's proven blockchain technology with industry-standard security practices.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:translate-y-[-5px]">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 w-14 h-14 flex items-center justify-center rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Fully Customizable</h3>
            <p className="text-blue-100">Brand your token with custom images and link your social media accounts.</p>
          </div>
        </div>
      </div>
      
      {/* Token Creation Form */}
      <div id="create-token" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Create Your Token Now</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Fill out the form below to deploy your SPL token in minutes with our easy-to-use interface.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto backdrop-blur-lg">
          <TokenForm />
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
