import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogIn, FiUserPlus } from 'react-icons/fi';
import Logo from '../ui/Logo';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <p className="hidden sm:block text-xs text-gray-500 font-medium">Voting Portal</p>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">About</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">How It Works</a>
            <a href="#membership" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Membership</a>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="flex items-center gap-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
              <FiLogIn className="h-4 w-4" /> Sign In
            </Link>
            <Link to="/register" className="btn-primary flex items-center gap-2 py-2 px-4">
              <FiUserPlus className="h-4 w-4" /> Join Now
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {open ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white py-4 px-4 space-y-3">
          <a href="#about" className="block text-gray-600 font-medium py-2">About</a>
          <a href="#how-it-works" className="block text-gray-600 font-medium py-2">How It Works</a>
          <a href="#membership" className="block text-gray-600 font-medium py-2">Membership</a>
          <div className="pt-3 border-t flex flex-col gap-2">
            <Link to="/login" className="btn-secondary text-center">Sign In</Link>
            <Link to="/register" className="btn-primary text-center">Join Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
