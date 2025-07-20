import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  // Sign up new user
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) throw error
    
    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: 'customer'
        })
      
      if (profileError) throw profileError
    }
    
    return data
  },

  // Sign in user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Services helpers
export const services = {
  // Get all service categories
  async getCategories() {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  // Get professionals by service and location
  async getProfessionals(serviceCategory, userLat, userLng, radius = 50) {
    let query = supabase
      .from('professionals')
      .select(`
        *,
        user_profiles!inner(full_name, phone, avatar_url),
        professional_services(*)
      `)
      .eq('is_verified', true)
      .eq('is_available', true)
      .contains('services', [serviceCategory])

    // Add location filtering if coordinates provided
    if (userLat && userLng) {
      query = query.rpc('professionals_within_radius', {
        lat: userLat,
        lng: userLng,
        radius_km: radius
      })
    }

    const { data, error } = await query.order('rating_average', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get professional by ID
  async getProfessional(professionalId) {
    const { data, error } = await supabase
      .from('professionals')
      .select(`
        *,
        user_profiles!inner(full_name, phone, avatar_url, email),
        professional_services(*),
        reviews(rating, review_text, created_at, user_profiles(full_name))
      `)
      .eq('id', professionalId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Bookings helpers
export const bookings = {
  // Create new booking
  async createBooking(bookingData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()
    
    if (error) throw error
    
    // Add initial timeline entry
    await supabase
      .from('booking_timeline')
      .insert({
        booking_id: data.id,
        status: 'pending',
        note: 'Booking created',
        updated_by: bookingData.customer_id
      })
    
    return data
  },

  // Get user bookings
  async getUserBookings(userId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        professionals(user_profiles(full_name)),
        booking_timeline(*)
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Update booking status
  async updateBookingStatus(bookingId, status, note, updatedBy) {
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
    
    if (bookingError) throw bookingError
    
    // Add timeline entry
    const { error: timelineError } = await supabase
      .from('booking_timeline')
      .insert({
        booking_id: bookingId,
        status,
        note,
        updated_by: updatedBy
      })
    
    if (timelineError) throw timelineError
  }
}

// Locations helpers
export const locations = {
  // Save user location
  async saveUserLocation(userId, locationData) {
    const { data, error } = await supabase
      .from('user_locations')
      .insert({
        user_id: userId,
        ...locationData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get user locations
  async getUserLocations(userId) {
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Geocode address (using a simple geocoding service)
  async geocodeAddress(address) {
    try {
      // For demo purposes, return Trivandrum coordinates
      // In production, use a proper geocoding service
      return {
        latitude: 8.5241 + (Math.random() - 0.5) * 0.1,
        longitude: 76.9366 + (Math.random() - 0.5) * 0.1
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }
}

// Reviews helpers
export const reviews = {
  // Add review
  async addReview(reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single()
    
    if (error) throw error
    
    // Update professional rating
    await this.updateProfessionalRating(reviewData.professional_id)
    
    return data
  },

  // Update professional rating
  async updateProfessionalRating(professionalId) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('professional_id', professionalId)
    
    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      
      await supabase
        .from('professionals')
        .update({
          rating_average: Math.round(avgRating * 10) / 10,
          rating_count: reviews.length
        })
        .eq('id', professionalId)
    }
  }
}