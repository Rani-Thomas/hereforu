import { useState, useEffect } from 'react'
import { AuthForm } from '../components/AuthForm.js'
import { auth } from '../lib/supabase.js'

export function Login({ onLogin }) {
  const [authMode, setAuthMode] = useState('login')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const user = await auth.getCurrentUser()
      if (user) {
        const profile = await auth.getUserProfile(user.id)
        onLogin({ user, profile })
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = (userData) => {
    onLogin(userData)
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>HereForYou</h1>
          <p>Trusted Help at Your Doorstep</p>
        </div>

        <AuthForm 
          mode={authMode}
          onSuccess={handleAuthSuccess}
          onModeChange={setAuthMode}
        />

        <div className="login-footer">
          <p>By continuing, you agree to our <a href="/terms.html">Terms of Service</a> and <a href="/privacy.html">Privacy Policy</a></p>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-container {
          width: 100%;
          max-width: 500px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--white);
        }

        .login-header h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .login-header p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .login-footer {
          text-align: center;
          margin-top: 2rem;
          color: var(--white);
          opacity: 0.8;
        }

        .login-footer a {
          color: var(--white);
          text-decoration: underline;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .login-page {
            padding: 1rem;
          }

          .login-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  )
}