"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Bell, BarChart3, User, Settings, LogOut, TrendingUp, Wallet } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreateYoloButton } from "./create-yolo-button"
import { AuthModal } from "./auth-modal"
import { getAuthState, logout } from "@/lib/auth"

export function LayoutHeader() {
  const pathname = usePathname()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const authState = getAuthState()

  const navItems = [
    { href: "/", label: "Market", icon: TrendingUp },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/missions", label: "Missions", icon: BarChart3 },
    { href: "/circles", label: "Circles", icon: User },
    { href: "/scout", label: "Portfolio", icon: Wallet },
  ]

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (!authState.isAuthenticated && href !== "/") {
      e.preventDefault()
      setIsAuthModalOpen(true)
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-lg flex items-center justify-center tech-glow">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    YOLO
                  </span>
                  <p className="text-xs text-gray-400 hidden sm:block">Growth Exchange</p>
                </div>
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href} onClick={(e) => handleNavClick(item.href, e)}>
                      <Button
                        variant="ghost"
                        className={
                          pathname === item.href
                            ? "text-blue-300 hover:text-white bg-blue-500/20 tech-glow"
                            : "text-gray-400 hover:text-white hover:bg-gray-800 tech-glow"
                        }
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search stocks, tags, schools..."
                  className="bg-gray-900 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none w-80 tech-glow"
                />
              </div>

              {authState.isAuthenticated && (
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white tech-glow">
                  <Bell className="w-5 h-5" />
                </Button>
              )}

              <CreateYoloButton className="hidden md:flex tech-glow" />

              {authState.isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full tech-glow">
                      <Avatar className="h-8 w-8 border-2 border-blue-500/50 tech-glow">
                        <AvatarImage
                          src={authState.user?.avatar || "/placeholder.svg?height=32&width=32"}
                          alt="Profile"
                        />
                        <AvatarFallback className="bg-gray-800 text-white">
                          {authState.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 tech-glow">
                      <User className="mr-2 h-4 w-4" />
                      <Link href="/me">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 tech-glow">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 tech-glow" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 tech-glow"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  )
}
