"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GrowtherCard } from "@/components/growther-card"
import { LayoutHeader } from "@/components/layout-header"
import { mockGrowthers } from "@/lib/mock-data"
import { Search, Filter, TrendingUp, Star, Eye } from "lucide-react"
import Link from "next/link"

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("all")
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [selectedSchool, setSelectedSchool] = useState("all")

  const countries = ["all", "Singapore", "Mexico", "South Korea", "Canada"]
  const domains = ["all", "AI & Research", "Design & UX", "Blockchain & DeFi", "Climate & Impact"]
  const schools = ["all", "NUS", "ITESM", "KAIST", "UofT"]

  const filteredGrowthers = mockGrowthers.filter((growther) => {
    const matchesSearch =
      growther.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      growther.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      growther.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCountry = selectedCountry === "all" || growther.country === selectedCountry
    const matchesDomain = selectedDomain === "all" || growther.domain === selectedDomain
    const matchesSchool = selectedSchool === "all" || growther.school === selectedSchool

    return matchesSearch && matchesCountry && matchesDomain && matchesSchool
  })

  const trendingTags = ["AI", "Web3", "Design", "DeFi", "OpenSource", "ClimaTech", "Research", "UX"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LayoutHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Explore Growthers</h1>
          <p className="text-slate-400 text-lg">Discover talented individuals and invest in their growth potential</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, skills, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-700 text-white pl-12 pr-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country} className="text-white hover:bg-slate-700">
                        {country === "all" ? "All Countries" : country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Domain" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {domains.map((domain) => (
                      <SelectItem key={domain} value={domain} className="text-white hover:bg-slate-700">
                        {domain === "all" ? "All Domains" : domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="School" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {schools.map((school) => (
                      <SelectItem key={school} value={school} className="text-white hover:bg-slate-700">
                        {school === "all" ? "All Schools" : school}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCountry("all")
                    setSelectedDomain("all")
                    setSelectedSchool("all")
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-dimensional Rankings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Market Rankings</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white bg-transparent"
            >
              📈 Price Rising
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white bg-transparent"
            >
              💰 Market Cap
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white bg-transparent"
            >
              🔥 Hot Newcomers
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white bg-transparent"
            >
              ⚡ GXP Leaders
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white bg-transparent"
            >
              🎯 Circle Stars
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white bg-transparent"
            >
              📊 YOLO Index
            </Button>
          </div>
        </div>

        {/* Trending Tags */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Trending Tags</h2>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-purple-600 hover:border-purple-500 hover:text-white bg-transparent"
                onClick={() => setSearchQuery(tag)}
              >
                #{tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Tabs */}
        <Tabs defaultValue="top" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="top" className="data-[state=active]:bg-purple-600">
              <Star className="w-4 h-4 mr-2" />
              Top
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-purple-600">
              <Eye className="w-4 h-4 mr-2" />
              Watchlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top" className="mt-6">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGrowthers
                .sort((a, b) => b.gxp - a.gxp)
                .map((growther) => (
                  <GrowtherCard key={growther.id} {...growther} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGrowthers
                .filter((g) => g.isRising)
                .sort(
                  (a, b) =>
                    Number.parseFloat(b.growthRate.replace("%", "").replace("+", "")) -
                    Number.parseFloat(a.growthRate.replace("%", "").replace("+", "")),
                )
                .map((growther) => (
                  <GrowtherCard key={growther.id} {...growther} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your Watchlist is Empty</h3>
              <p className="text-slate-400 mb-4">Start following growthers to see them here</p>
              <Link href="/explore">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Explore Growthers
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        {/* Results */}
        {filteredGrowthers.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
            <p className="text-slate-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
