// Authentication utilities and types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  tags: string[]
  school?: string
  domain?: string
  location?: string
  isProfileComplete: boolean
  hasPostedGrowth: boolean
  hasCreatedStock: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock auth functions (replace with Supabase later)
export const mockUser: User = {
  id: "user-1",
  email: "john@example.com",
  name: "John Doe",
  avatar: "/placeholder.svg?height=80&width=80",
  bio: "Full-stack developer passionate about growth and innovation",
  tags: ["AI", "Web3", "Design"],
  school: "Stanford University",
  domain: "Technology",
  location: "San Francisco, CA",
  isProfileComplete: true,
  hasPostedGrowth: true,
  hasCreatedStock: false,
  createdAt: "2024-01-15",
}

export const getAuthState = (): AuthState => {
  // In real app, this would check Supabase session
  const isLoggedIn = typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") === "true" : false

  return {
    user: isLoggedIn ? mockUser : null,
    isLoading: false,
    isAuthenticated: isLoggedIn,
  }
}

export const login = async (email: string, password: string) => {
  // Mock login - replace with Supabase auth
  localStorage.setItem("isLoggedIn", "true")
  return mockUser
}

export const logout = async () => {
  localStorage.removeItem("isLoggedIn")
}

export const signUp = async (email: string, password: string, name: string) => {
  // Mock signup - replace with Supabase auth
  localStorage.setItem("isLoggedIn", "true")
  return { ...mockUser, email, name }
}
