import { useState, useEffect } from 'react'
import { Login } from './pages/Login.js'
import { Dashboard } from './pages/Dashboard.js'
import { auth } from './lib/supabase.js'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication state on app load
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const currentUser = await auth.getCurrentUser()
      if (currentUser) {
        const userProfile = await auth.getUserProfile(currentUser.id)
        setUser(currentUser)
        setProfile(userProfile)
      }
    } catch (error) {
      console.error('Auth state check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = ({ user, profile }) => {
    setUser(user)
    setProfile(profile)
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <h2>HereForYou</h2>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {user && profile ? (
        <Dashboard 
          user={user} 
          profile={profile} 
          onLogout={handleLogout}
        />
      ) : (
        <Login onLogin={handleLogin} />
      )}

      <style jsx>{`
        .app {
          min-height: 100vh;
        }

        .app-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: var(--white);
          text-align: center;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid var(--white);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 2rem;
        }

        .app-loading h2 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .app-loading p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default App