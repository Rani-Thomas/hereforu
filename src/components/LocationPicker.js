import { useState, useEffect } from 'react'
import { locations } from '../lib/supabase.js'

export function LocationPicker({ onLocationSelect, currentLocation }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [userLocations, setUserLocations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Trivandrum areas for suggestions
  const trivandumAreas = [
    'Pattom', 'Kazhakkoottam', 'Technopark', 'Vazhuthacaud', 'Ulloor',
    'Medical College', 'Sasthamangalam', 'Peroorkada', 'Thirumala',
    'Palayam', 'East Fort', 'Thampanoor', 'Vellayambalam', 'Kowdiar',
    'Jagathy', 'Mannanthala', 'Enchakkal', 'Balaramapuram', 'Neyyattinkara',
    'Attingal', 'Nedumangad', 'Varkala', 'Kovalam', 'Vizhinjam'
  ]

  useEffect(() => {
    if (searchQuery.length > 2) {
      const filtered = trivandumAreas.filter(area =>
        area.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [searchQuery])

  const handleLocationSelect = async (locationName) => {
    setIsLoading(true)
    try {
      // Get coordinates for the location
      const coords = await locations.geocodeAddress(locationName + ', Trivandrum, Kerala')
      
      const locationData = {
        name: locationName,
        address: locationName + ', Trivandrum, Kerala',
        city: 'Trivandrum',
        state: 'Kerala',
        pincode: '695001', // Default pincode
        latitude: coords?.latitude || 8.5241,
        longitude: coords?.longitude || 76.9366
      }
      
      onLocationSelect(locationData)
      setIsOpen(false)
      setSearchQuery('')
    } catch (error) {
      console.error('Error selecting location:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const locationData = {
            name: 'Current Location',
            address: 'Current Location, Trivandrum, Kerala',
            city: 'Trivandrum',
            state: 'Kerala',
            pincode: '695001',
            latitude,
            longitude
          }
          onLocationSelect(locationData)
          setIsOpen(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Unable to get your location. Please select manually.')
        }
      )
    }
  }

  return (
    <div className="location-picker">
      <button 
        className="location-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-map-marker-alt"></i>
        <span>{currentLocation?.name || 'Select Location'}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>

      {isOpen && (
        <div className="location-dropdown">
          <div className="location-search">
            <input
              type="text"
              placeholder="Search for area in Trivandrum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>

          <div className="location-options">
            <button 
              className="location-option current-location"
              onClick={handleManualLocation}
            >
              <i className="fas fa-crosshairs"></i>
              <span>Use Current Location</span>
            </button>

            {suggestions.length > 0 && (
              <div className="suggestions">
                <h4>Suggested Areas</h4>
                {suggestions.map((area) => (
                  <button
                    key={area}
                    className="location-option"
                    onClick={() => handleLocationSelect(area)}
                    disabled={isLoading}
                  >
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{area}, Trivandrum</span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length <= 2 && (
              <div className="popular-areas">
                <h4>Popular Areas</h4>
                {trivandumAreas.slice(0, 8).map((area) => (
                  <button
                    key={area}
                    className="location-option"
                    onClick={() => handleLocationSelect(area)}
                    disabled={isLoading}
                  >
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{area}, Trivandrum</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .location-picker {
          position: relative;
        }

        .location-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--white);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition);
          width: 100%;
          justify-content: space-between;
        }

        .location-button:hover {
          border-color: var(--primary-color);
        }

        .location-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--white);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow-hover);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
        }

        .location-search {
          position: relative;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .location-search input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          outline: none;
        }

        .location-search i {
          position: absolute;
          right: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .location-options {
          padding: 0.5rem;
        }

        .location-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          border-radius: 6px;
          transition: var(--transition);
        }

        .location-option:hover {
          background: var(--background-color);
        }

        .location-option.current-location {
          color: var(--primary-color);
          font-weight: 600;
        }

        .location-option i {
          color: var(--primary-color);
          width: 16px;
        }

        .suggestions, .popular-areas {
          margin-top: 0.5rem;
        }

        .suggestions h4, .popular-areas h4 {
          padding: 0.5rem 0.75rem;
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  )
}