import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import DeniLogoLoan from '../assets/DeniLogo.png'
import { LogOut, User, LayoutDashboard } from 'lucide-react'

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center">
              <img src={DeniLogoLoan} alt="DeniLoans" />
            </div>
            
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {user.fullName || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
