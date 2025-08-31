import { create } from 'zustand'
import { User } from './auth'

// UI状态接口
interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  modals: {
    auth: boolean
    invest: boolean
    createPost: boolean
    createYolo: boolean
  }
}

// 认证状态接口
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// 应用状态接口
interface AppState extends UIState, AuthState {
  // UI Actions
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  openModal: (modal: keyof UIState['modals']) => void
  closeModal: (modal: keyof UIState['modals']) => void
  closeAllModals: () => void
  
  // Auth Actions
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  login: (user: User) => void
  logout: () => void
}

// 创建应用状态store
export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  theme: 'dark',
  sidebarOpen: false,
  modals: {
    auth: false,
    invest: false,
    createPost: false,
    createYolo: false,
  },
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  // UI Actions
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (modal: keyof UIState['modals']) => set((state) => ({
    modals: { ...state.modals, [modal]: true }
  })),
  closeModal: (modal: keyof UIState['modals']) => set((state) => ({
    modals: { ...state.modals, [modal]: false }
  })),
  closeAllModals: () => set({
    modals: {
      auth: false,
      invest: false,
      createPost: false,
      createYolo: false,
    }
  }),
  
  // Auth Actions
  setUser: (user: User | null) => set({ user }),
  setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  login: (user: User) => set({ 
    user, 
    isAuthenticated: true, 
    isLoading: false 
  }),
  logout: () => set({ 
    user: null, 
    isAuthenticated: false, 
    isLoading: false 
  }),
}))

// 选择器hooks
export const useAuth = () => {
  return useAppStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login: state.login,
    logout: state.logout,
    setLoading: state.setLoading,
  }))
}

export const useUI = () => {
  return useAppStore((state) => ({
    theme: state.theme,
    sidebarOpen: state.sidebarOpen,
    modals: state.modals,
    setTheme: state.setTheme,
    toggleSidebar: state.toggleSidebar,
    openModal: state.openModal,
    closeModal: state.closeModal,
    closeAllModals: state.closeAllModals,
  }))
}