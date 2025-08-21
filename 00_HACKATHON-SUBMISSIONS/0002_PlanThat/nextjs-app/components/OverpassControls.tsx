"use client"

interface OverpassControlsProps {
  amenity: 'restaurant' | 'bar' | 'nightlife' | 'nature' | 'arts' | 'entertainment' | 'sports' | 'shopping' | 'live_music' | 'cafes' | 'fast_desserts' | 'results' | 'bookmarks' | null
  radius: number
  currentlyOpen: boolean
  onChange: (next: { amenity: 'restaurant' | 'bar' | 'nightlife' | 'nature' | 'arts' | 'entertainment' | 'sports' | 'shopping' | 'live_music' | 'cafes' | 'fast_desserts' | 'results' | 'bookmarks' | null; radius: number; currentlyOpen: boolean }) => void
}

const RADII = [300, 500, 750, 1000, 1500, 2000]

export default function OverpassControls({ amenity, radius, currentlyOpen, onChange }: OverpassControlsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => onChange({ amenity: 'restaurant', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'restaurant' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Restaurants
        </button>
        <button
          onClick={() => onChange({ amenity: 'arts', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'arts' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Arts
        </button>
        <button
          onClick={() => onChange({ amenity: 'bar', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bars
        </button>
        <button
          onClick={() => onChange({ amenity: 'cafes', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'cafes' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cafes
        </button>
        <button
          onClick={() => onChange({ amenity: 'entertainment', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'entertainment' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Entertainment
        </button>
        <button
          onClick={() => onChange({ amenity: 'fast_desserts', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'fast_desserts' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Fast Food / Desserts
        </button>
        <button
          onClick={() => onChange({ amenity: 'live_music', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'live_music' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Live Music
        </button>
        <button
          onClick={() => onChange({ amenity: 'nature', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'nature' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Nature
        </button>
        <button
          onClick={() => onChange({ amenity: 'nightlife', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'nightlife' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Nightlife
        </button>
        <button
          onClick={() => onChange({ amenity: 'shopping', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'shopping' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Shopping
        </button>
        <button
          onClick={() => onChange({ amenity: 'sports', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'sports' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Sports
        </button>
        <button
          onClick={() => onChange({ amenity: 'results', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'results' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Results
        </button>
        <button
          onClick={() => onChange({ amenity: 'bookmarks', radius, currentlyOpen })}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            amenity === 'bookmarks' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bookmarks
        </button>
        <button
          onClick={() => onChange({ amenity: null, radius, currentlyOpen })}
          className="px-3 py-1 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700">Radius:</label>
        <select
          value={radius}
          onChange={(e) => onChange({ amenity, radius: Number(e.target.value), currentlyOpen })}
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
            onChange={(e) => onChange({ amenity, radius, currentlyOpen: e.target.checked })}
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
  )
} 