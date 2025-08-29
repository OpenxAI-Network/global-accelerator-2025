"use client"

interface CityTab {
  id: string
  type: 'restaurant' | 'bar' | 'nightlife' | 'nature' | 'arts' | 'entertainment' | 'sports' | 'shopping' | 'live_music' | 'cafes' | 'fast_desserts' | 'results' | 'bookmarks'
  label: string
  color: string
}

interface CityTabsProps {
  tabs: CityTab[]
  selectedTabIds: Set<string>
  onAddTab: (type: 'restaurant' | 'bar' | 'nightlife' | 'nature' | 'arts' | 'entertainment' | 'sports' | 'shopping' | 'live_music' | 'cafes' | 'fast_desserts' | 'results' | 'bookmarks') => void
  onRemoveTab: (tabId: string) => void
  onToggleTab: (tabId: string) => void
  radius: number
  currentlyOpen: boolean
  onRadiusChange: (radius: number) => void
  onCurrentlyOpenChange: (currentlyOpen: boolean) => void
}

const RADII = [300, 500, 750, 1000, 1500, 2000]

const availableTypes = [
  { type: 'restaurant' as const, label: 'Restaurants', color: 'bg-blue-500' },
  { type: 'bar' as const, label: 'Bars', color: 'bg-indigo-500' },
  { type: 'nightlife' as const, label: 'Nightlife', color: 'bg-purple-500' },
  { type: 'nature' as const, label: 'Nature', color: 'bg-green-500' },
  { type: 'arts' as const, label: 'Arts', color: 'bg-pink-500' },
  { type: 'entertainment' as const, label: 'Entertainment', color: 'bg-yellow-500' },
  { type: 'sports' as const, label: 'Sports', color: 'bg-orange-500' },
  { type: 'shopping' as const, label: 'Shopping', color: 'bg-teal-500' },
  { type: 'live_music' as const, label: 'Live Music', color: 'bg-red-500' },
  { type: 'cafes' as const, label: 'Cafes', color: 'bg-amber-500' },
  { type: 'fast_desserts' as const, label: 'Fast Food / Desserts', color: 'bg-lime-500' },
  { type: 'results' as const, label: 'Results', color: 'bg-emerald-500' },
  { type: 'bookmarks' as const, label: 'Bookmarks', color: 'bg-violet-500' }
]

export default function CityTabs({
  tabs,
  selectedTabIds,
  onAddTab,
  onRemoveTab,
  onToggleTab,
  radius,
  currentlyOpen,
  onRadiusChange,
  onCurrentlyOpenChange
}: CityTabsProps) {
  // Get types that are already added as tabs
  const addedTypes = new Set(tabs.map(tab => tab.type))
  
  // Filter out types that are already added
  const availableToAdd = availableTypes.filter(type => !addedTypes.has(type.type))

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
                            {tabs.map((tab) => (
                      <div
                        key={tab.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                          selectedTabIds.has(tab.id)
                            ? `${tab.color} text-white`
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => onToggleTab(tab.id)}
                      >
                        <span>{tab.label}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveTab(tab.id)
                          }}
                          className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
        
        {/* Add Tab Button */}
        {availableToAdd.length > 0 && (
          <div className="relative group">
            <button className="px-3 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Tab
            </button>
            
            {/* Dropdown for available types */}
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-[9999] min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {availableToAdd.map((type) => (
                <button
                  key={type.type}
                  onClick={() => onAddTab(type.type)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm flex items-center gap-2"
                >
                  <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

                        {/* Controls */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Multi-select indicator */}
                    {selectedTabIds.size > 1 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedTabIds.size} tabs selected - showing real data
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Radius:</label>
                      <select
                        value={radius}
                        onChange={(e) => onRadiusChange(Number(e.target.value))}
                        className="text-sm border-gray-300 rounded-md px-2 py-1"
                      >
                        {RADII.map(r => (
                          <option key={r} value={r}>{r} m</option>
                        ))}
                      </select>
                    </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Show Only Currently Open:</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentlyOpen}
              onChange={(e) => onCurrentlyOpenChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          {currentlyOpen && (
            <span className="text-xs text-gray-500">
              (Current time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
