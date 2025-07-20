import { useState } from 'react'
import { auth } from '../lib/supabase.js'

export function AuthForm({ mode = 'login', onSuccess, onModeChange }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        // Validate form
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        if (!formData.full_name.trim()) {
          throw new Error('Full name is required')
        }

        // Sign up user
        await auth.signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          phone: formData.phone
        })

        alert('Account created successfully! Please check your email to verify your account, then you can login.')
        onModeChange('login')
      } else {
        // Sign in user
        const { user } = await auth.signIn(formData.email, formData.password)
        
        if (user) {
          // Get user profile
          const profile = await auth.getUserProfile(user.id)
          onSuccess({ user, profile })
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="auth-form">
      <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
      <p>{mode === 'login' ? 'Sign in to access trusted services' : 'Join HereForYou today'}</p>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <>
            <div className="form-group">
              <label htmlFor="full_name">Full Name *</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
          />
        </div>

        {mode === 'signup' && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
            </>
          ) : (
            <>
              <i className={`fas fa-${mode === 'login' ? 'sign-in-alt' : 'user-plus'}`}></i>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </>
          )}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button 
            type="button" 
            className="link-button"
            onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign up here' : 'Sign in here'}
          </button>
        </p>
      </div>

      <style jsx>{`
        .auth-form {
          max-width: 400px;
          margin: 0 auto;
          padding: 2rem;
          background: var(--white);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
        }

        .auth-form h2 {
          text-align: center;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .auth-form p {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--text-secondary);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid var(--error-color);
          border-radius: 6px;
          color: var(--error-color);
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
          transition: var(--transition);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .btn-primary {
          width: 100%;
          padding: 1rem;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-switch {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .link-button {
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          text-decoration: underline;
          margin-left: 0.5rem;
        }

        .link-button:hover {
          color: var(--primary-color);
        }
      `}</style>
    </div>
  )
}