import { useState } from 'react'

export function ProfessionalCard({ professional, onBook, onContact, onViewProfile }) {
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(!isSaved)
    // Save to localStorage or backend
    const savedProfessionals = JSON.parse(localStorage.getItem('savedProfessionals') || '[]')
    if (isSaved) {
      const filtered = savedProfessionals.filter(id => id !== professional.id)
      localStorage.setItem('savedProfessionals', JSON.stringify(filtered))
    } else {
      savedProfessionals.push(professional.id)
      localStorage.setItem('savedProfessionals', JSON.stringify(savedProfessionals))
    }
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDistance = (lat, lng, userLat, userLng) => {
    if (!userLat || !userLng) return 'Distance unknown'
    
    // Simple distance calculation (for demo)
    const distance = Math.sqrt(
      Math.pow(lat - userLat, 2) + Math.pow(lng - userLng, 2)
    ) * 111 // Rough km conversion
    
    return distance < 1 ? '< 1 km away' : `${distance.toFixed(1)} km away`
  }

  return (
    <div className="professional-card">
      <div className="professional-header">
        <div className="professional-avatar">
          {professional.user_profiles?.avatar_url ? (
            <img src={professional.user_profiles.avatar_url} alt={professional.user_profiles.full_name} />
          ) : (
            <span>{getInitials(professional.user_profiles.full_name)}</span>
          )}
        </div>
        <div className="professional-info">
          <h3>{professional.user_profiles.full_name}</h3>
          <p className="location">
            <i className="fas fa-map-marker-alt"></i>
            {professional.city}
          </p>
          <div className="badges">
            {professional.is_verified && (
              <span className="verified-badge">
                <i className="fas fa-check-circle"></i> Verified
              </span>
            )}
            <span className="experience-badge">
              {professional.experience_years} years exp.
            </span>
          </div>
        </div>
        <button 
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          title={isSaved ? 'Remove from saved' : 'Save professional'}
        >
          <i className={`fas fa-heart ${isSaved ? 'filled' : ''}`}></i>
        </button>
      </div>

      <div className="professional-details">
        <div className="rating-section">
          <div className="rating">
            <div className="stars">
              {Array.from({ length: 5 }, (_, i) => (
                <i 
                  key={i} 
                  className={`fas fa-star ${i < Math.floor(professional.rating_average) ? 'filled' : ''}`}
                ></i>
              ))}
            </div>
            <span className="rating-text">
              {professional.rating_average} ({professional.rating_count} reviews)
            </span>
          </div>
          <div className="price">
            <i className="fas fa-rupee-sign"></i>
            <span>₹{professional.hourly_rate}/hour</span>
          </div>
        </div>

        <div className="services-offered">
          <strong>Services:</strong>
          <div className="service-tags">
            {professional.services.map((service, index) => (
              <span key={index} className="service-tag">
                {service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>

        <div className="skills">
          <strong>Skills:</strong>
          <span>{professional.skills?.slice(0, 3).join(', ')}</span>
          {professional.skills?.length > 3 && (
            <span className="more-skills">+{professional.skills.length - 3} more</span>
          )}
        </div>

        <div className="availability-info">
          <div className="availability">
            <i className="fas fa-circle available"></i>
            <span>Available today</span>
          </div>
          <div className="response-time">
            <i className="fas fa-clock"></i>
            <span>Responds in ~{professional.response_time_minutes} min</span>
          </div>
        </div>
      </div>

      <div className="professional-actions">
        <button 
          className="btn-outline"
          onClick={() => onViewProfile(professional.id)}
        >
          <i className="fas fa-user"></i>
          View Profile
        </button>
        <button 
          className="btn-outline"
          onClick={() => onContact(professional)}
        >
          <i className="fas fa-phone"></i>
          Contact
        </button>
        <button 
          className="btn-primary"
          onClick={() => onBook(professional)}
        >
          <i className="fas fa-calendar"></i>
          Book Now
        </button>
      </div>

      <style jsx>{`
        .professional-card {
          background: var(--white);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          padding: 1.5rem;
          transition: var(--transition);
          border: 2px solid transparent;
        }

        .professional-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-hover);
          border-color: var(--primary-color);
        }

        .professional-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .professional-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          font-weight: bold;
          font-size: 1.2rem;
          overflow: hidden;
        }

        .professional-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .professional-info {
          flex: 1;
        }

        .professional-info h3 {
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .location {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .verified-badge, .experience-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .verified-badge {
          background: rgba(39, 174, 96, 0.1);
          color: var(--success-color);
        }

        .experience-badge {
          background: rgba(52, 152, 219, 0.1);
          color: var(--secondary-color);
        }

        .save-button {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          transition: var(--transition);
          padding: 0.5rem;
          border-radius: 50%;
        }

        .save-button:hover {
          background: rgba(231, 76, 60, 0.1);
          color: var(--error-color);
        }

        .save-button.saved {
          color: var(--error-color);
        }

        .professional-details {
          margin-bottom: 1.5rem;
        }

        .rating-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: var(--background-color);
          border-radius: 8px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stars {
          display: flex;
          gap: 0.1rem;
        }

        .stars i {
          color: var(--border-color);
          font-size: 0.9rem;
        }

        .stars i.filled {
          color: var(--warning-color);
        }

        .rating-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .price {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--primary-color);
          font-weight: 600;
        }

        .services-offered, .skills {
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .services-offered strong, .skills strong {
          color: var(--text-primary);
          margin-right: 0.5rem;
        }

        .service-tags {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
          margin-top: 0.25rem;
        }

        .service-tag {
          background: var(--primary-color);
          color: var(--white);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .more-skills {
          color: var(--text-secondary);
          font-style: italic;
        }

        .availability-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }

        .availability, .response-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .availability i.available {
          color: var(--success-color);
          font-size: 0.6rem;
        }

        .response-time {
          color: var(--text-secondary);
        }

        .professional-actions {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
        }

        .professional-actions button {
          padding: 0.6rem 0.5rem;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
        }

        @media (max-width: 768px) {
          .professional-actions {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .professional-actions button {
            padding: 0.75rem;
            font-size: 0.9rem;
          }

          .rating-section {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }

          .availability-info {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}