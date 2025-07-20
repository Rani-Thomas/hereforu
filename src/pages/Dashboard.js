import { useState, useEffect } from 'react'
import { services, locations } from '../lib/supabase.js'
import { LocationPicker } from '../components/LocationPicker.js'
import { ProfessionalCard } from '../components/ProfessionalCard.js'

export function Dashboard({ user, profile, onLogout }) {
  const [serviceCategories, setServiceCategories] = useState([])
  const [selectedService, setSelectedService] = useState('')
  const [professionals, setProfessionals] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadServiceCategories()
    loadUserLocation()
  }, [])

  useEffect(() => {
    if (selectedService && userLocation) {
      loadProfessionals()
    }
  }, [selectedService, userLocation])

  const loadServiceCategories = async () => {
    try {
      const categories = await services.getCategories()
      setServiceCategories(categories)
    } catch (error) {
      console.error('Error loading service categories:', error)
    }
  }

  const loadUserLocation = async () => {
    try {
      const userLocations = await locations.getUserLocations(user.id)
      if (userLocations.length > 0) {
        setUserLocation(userLocations.find(loc => loc.is_default) || userLocations[0])
      }
    } catch (error) {
      console.error('Error loading user location:', error)
    }
  }

  const loadProfessionals = async () => {
    setIsLoading(true)
    try {
      const professionalsData = await services.getProfessionals(
        selectedService,
        userLocation?.latitude,
        userLocation?.longitude
      )
      setProfessionals(professionalsData)
    } catch (error) {
      console.error('Error loading professionals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleServiceSelect = (serviceCategory) => {
    setSelectedService(serviceCategory)
  }

  const handleLocationSelect = async (locationData) => {
    try {
      // Save location to database
      const savedLocation = await locations.saveUserLocation(user.id, {
        ...locationData,
        is_default: true
      })
      setUserLocation(savedLocation)
    } catch (error) {
      console.error('Error saving location:', error)
      // Still update UI even if save fails
      setUserLocation(locationData)
    }
  }

  const handleBookProfessional = (professional) => {
    // Navigate to booking page
    window.location.href = `/booking.html?professional=${professional.id}&service=${selectedService}`
  }

  const handleContactProfessional = (professional) => {
    alert(`Contact ${professional.user_profiles.full_name} at ${professional.user_profiles.phone}`)
  }

  const handleViewProfile = (professionalId) => {
    window.location.href = `/professional-profile.html?id=${professionalId}&service=${selectedService}`
  }

  const filteredCategories = serviceCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h1>Welcome back, {profile.full_name}!</h1>
            <p>Find trusted professionals for all your home service needs</p>
          </div>
          <div className="header-actions">
            <LocationPicker 
              currentLocation={userLocation}
              onLocationSelect={handleLocationSelect}
            />
            <button className="btn-secondary" onClick={onLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`service-card ${selectedService === category.category ? 'selected' : ''}`}
              onClick={() => handleServiceSelect(category.category)}
            >
              <i className={category.icon}></i>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <div className="price-range">
                ₹{category.base_price_min} - ₹{category.base_price_max}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Professionals Section */}
      {selectedService && (
        <section className="professionals-section">
          <div className="section-header">
            <h2>Available Professionals</h2>
            <p>
              {userLocation ? (
                <>Showing professionals near {userLocation.name}</>
              ) : (
                <>Select your location to see nearby professionals</>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Finding professionals near you...</p>
            </div>
          ) : professionals.length > 0 ? (
            <div className="professionals-grid">
              {professionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onBook={handleBookProfessional}
                  onContact={handleContactProfessional}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          ) : (
            <div className="no-professionals">
              <i className="fas fa-search"></i>
              <h3>No professionals found</h3>
              <p>Try selecting a different service or location</p>
            </div>
          )}
        </section>
      )}

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: var(--background-color);
        }

        .dashboard-header {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: var(--white);
          padding: 2rem;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .user-info h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .user-info p {
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-section {
          padding: 2rem;
          background: var(--white);
          box-shadow: var(--shadow);
        }

        .search-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .search-box {
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 1rem 3rem 1rem 1rem;
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          font-size: 1rem;
          transition: var(--transition);
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .search-box i {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .services-section {
          padding: 3rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .services-section h2 {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--text-primary);
          font-size: 2.5rem;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .service-card {
          background: var(--white);
          border-radius: var(--border-radius);
          padding: 2rem;
          text-align: center;
          box-shadow: var(--shadow);
          transition: var(--transition);
          cursor: pointer;
          border: 2px solid transparent;
        }

        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-hover);
          border-color: var(--primary-color);
        }

        .service-card.selected {
          border-color: var(--primary-color);
          background: rgba(76, 175, 80, 0.05);
        }

        .service-card i {
          font-size: 3rem;
          color: var(--primary-color);
          margin-bottom: 1rem;
        }

        .service-card h3 {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .service-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .price-range {
          color: var(--primary-color);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .professionals-section {
          padding: 3rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 2rem;
        }

        .section-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .professionals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
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

        .no-professionals {
          text-align: center;
          padding: 4rem;
          background: var(--white);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
        }

        .no-professionals i {
          font-size: 3rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .no-professionals h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .no-professionals p {
          color: var(--text-secondary);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .user-info h1 {
            font-size: 2rem;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .professionals-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}