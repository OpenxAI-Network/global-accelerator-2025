import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar as UICalendar } from "@/components/ui/calendar";
import Header from "@/components/Header";
import { Trophy, Flame, Star, ChevronLeft, ChevronRight } from "lucide-react";
import matchaIcon from "@/assets/matcha.svg";
import ChatWidget from "@/components/ChatWidget";

// Import all 10 matcha images
import img1 from "@/assets/matcha_images/1.jpg";
import img2 from "@/assets/matcha_images/2.jpg";
import img3 from "@/assets/matcha_images/3.jpg";
import img4 from "@/assets/matcha_images/4.jpg";
import img5 from "@/assets/matcha_images/5.jpg";
import img6 from "@/assets/matcha_images/6.jpg";
import img7 from "@/assets/matcha_images/7.jpg";
import img8 from "@/assets/matcha_images/8.jpg";
import img9 from "@/assets/matcha_images/9.jpg";
import img10 from "@/assets/matcha_images/10.jpg";

const matchaImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

// Function to get image for a specific day (deterministic assignment)
function getImageForDay(day: number) {
  return matchaImages[day % matchaImages.length];
}

// Function to get image for a specific date
function getImageForDate(date: Date) {
  const day = date.getDate();
  return getImageForDay(day);
}

// Simulate matcha days with localStorage (or use mock data)
function getMatchaDays() {
  const data = localStorage.getItem("matcha_days");
  if (data) return JSON.parse(data);
  
  // Initialize with mock data if no localStorage data exists - use all 10 images!
  const mockData = [
    "2025-08-21", // 10 days ago - Image 1
    "2025-08-22", // 9 days ago  - Image 2  
    "2025-08-23", // 8 days ago  - Image 3
    "2025-08-24", // 7 days ago  - Image 4
    "2025-08-25", // 6 days ago  - Image 5
    "2025-08-26", // 5 days ago  - Image 6
    "2025-08-27", // 4 days ago  - Image 7
    "2025-08-28", // 3 days ago  - Image 8
    "2025-08-29", // 2 days ago  - Image 9
    "2025-08-30", // yesterday    - Image 10
  ];
  
  // Set the mock data in localStorage
  localStorage.setItem("matcha_days", JSON.stringify(mockData));
  return mockData;
}
function setMatchaDay(dateStr: string) {
  const days = getMatchaDays();
  if (!days.includes(dateStr)) {
    days.push(dateStr);
    localStorage.setItem("matcha_days", JSON.stringify(days));
  }
}

// Function to reset to mock data for testing
function resetToMockData() {
  const mockData = [
    "2025-08-21", // 10 days ago - Image 1
    "2025-08-22", // 9 days ago  - Image 2  
    "2025-08-23", // 8 days ago  - Image 3
    "2025-08-24", // 7 days ago  - Image 4
    "2025-08-25", // 6 days ago  - Image 5
    "2025-08-26", // 5 days ago  - Image 6
    "2025-08-27", // 4 days ago  - Image 7
    "2025-08-28", // 3 days ago  - Image 8
    "2025-08-29", // 2 days ago  - Image 9
    "2025-08-30", // yesterday    - Image 10
  ];
  localStorage.setItem("matcha_days", JSON.stringify(mockData));
  return mockData;
}
function getStreak(days: string[]) {
  // Sort and count consecutive days
  const sorted = days.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
  let maxStreak = 0, currentStreak = 0, prev: Date | null = null;
  for (const d of sorted) {
    if (prev) {
      const diff = (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    if (currentStreak > maxStreak) maxStreak = currentStreak;
    prev = d;
  }
  return maxStreak;
}
function toLocalDateString(date: Date) {
  // Returns YYYY-MM-DD in local time, not UTC
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getCurrentStreak(days: string[]) {
  // Returns the current streak up to today
  if (!days.length) return 0;
  const sorted = days.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
  let streak = 0;
  let prev = null;
  const today = new Date();
  today.setHours(0,0,0,0);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    if (!prev) {
      // Start from today or yesterday
      const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 0 || diff === 1) {
        streak = 1;
        prev = d;
      } else {
        break;
      }
    } else {
      const diff = (prev.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        prev = d;
      } else {
        break;
      }
    }
  }
  return streak;
}

// Function to check if a specific date is part of a streak
function checkIfInStreak(dateStr: string) {
  const days = getMatchaDays();
  if (!days.length) return false;
  
  const sorted = days.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
  const targetDate = new Date(dateStr);
  
  // Find the target date in the sorted array
  const targetIndex = sorted.findIndex(d => isSameDay(d, targetDate));
  if (targetIndex === -1) return false;
  
  // Check if it's part of a consecutive sequence
  let isStreak = false;
  
  // Check forward streak
  for (let i = targetIndex; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const diff = (next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      isStreak = true;
    } else {
      break;
    }
  }
  
  // Check backward streak
  for (let i = targetIndex; i > 0; i--) {
    const current = sorted[i];
    const previous = sorted[i - 1];
    const diff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      isStreak = true;
    } else {
      break;
    }
  }
  
  return isStreak;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [matchaDays, setMatchaDays] = useState<string[]>(getMatchaDays());
  const highestStreak = getStreak(matchaDays);
  const currentStreak = getCurrentStreak(matchaDays);

  // Add custom CSS to force calendar tile sizes
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .rdp-button {
        width: 128px !important;
        height: 128px !important;
        min-width: 128px !important;
        min-height: 128px !important;
        max-width: 128px !important;
        max-height: 128px !important;
      }
      .rdp-td {
        width: 128px !important;
        height: 128px !important;
        min-width: 128px !important;
        min-height: 128px !important;
        max-width: 128px !important;
        max-height: 128px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    setMatchaDays(getMatchaDays());
  }, []);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const dateStr = toLocalDateString(date);
    setMatchaDay(dateStr);
    setMatchaDays(getMatchaDays());
    setSelected(date);
  }

  // Ensure the selected date is always one of the matcha days if just clicked
  useEffect(() => {
    if (selected) {
      const dateStr = toLocalDateString(selected);
      if (!matchaDays.includes(dateStr)) {
        setSelected(undefined);
      }
    }
  }, [matchaDays]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-appaccent via-appaccent/90 to-appprimary">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
                        <div className="text-center mb-12">
                  <h1 className="text-3xl font-cute font-bold mb-4 text-appbg/80 drop-shadow-lg">
                    Calendar
                  </h1>
                  <p className="text-lg text-appbg/80 mb-2 font-cute">
                    Click a day to mark as a Matcha day! Build your streak!
                  </p>
                  <div className="w-24 h-1 bg-appbg/60 rounded-full mx-auto"></div>
                </div>

        {/* Enhanced Calendar Container - Layered Card Background */}
        <div className="bg-green-50 rounded-xl p-8 md:p-12 shadow-xl border border-green-300/30">

          {/* Calendar Display - 3 Months */}
          <div className="w-full flex justify-center">
            <UICalendar
              className="w-full max-w-[1400px] [&_.rdp-table]:w-full [&_.rdp-tbody]:w-full [&_.rdp-tr]:w-full [&_.rdp-td]:w-full [&_.rdp-button]:!w-32 [&_.rdp-button]:!h-32 [&_.rdp-button]:!min-w-[128px] [&_.rdp-button]:!min-h-[128px] [&_.rdp-button]:text-xl [&_.rdp-button]:font-medium [&_.rdp-button]:rounded-xl [&_.rdp-button]:shadow-md [&_.rdp-button]:transition-all [&_.rdp-button]:hover:scale-105 [&_.rdp-button]:hover:shadow-md [&_.rdp-button]:hover:border-green-400 [&_.rdp-button]:focus:ring-4 [&_.rdp-button]:focus:ring-green-400/30 [&_.rdp-button]:focus:outline-none [&_.rdp-button]:border [&_.rdp-button]:border-green-300 [&_.rdp-button]:hover:border-green-500 [&_.rdp-caption]:text-lg [&_.rdp-caption]:font-semibold [&_.rdp-caption]:text-green-800 [&_.rdp-caption]:pb-3 [&_.rdp-caption]:px-4 [&_.rdp-caption]:py-2 [&_.rdp-caption]:rounded-full [&_.rdp-caption]:bg-green-200/50 [&_.rdp-caption]:shadow-sm [&_.rdp-caption]:mb-6 [&_.rdp-head_cell]:text-green-700 [&_.rdp-head_cell]:font-semibold [&_.rdp-head_cell]:text-lg [&_.rdp-head_cell]:pb-4 [&_.rdp-button]:hover:bg-gradient-to-br [&_.rdp-button]:hover:from-green-50 [&_.rdp-button]:hover:to-green-100"
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              numberOfMonths={3}
              pagedNavigation
              modifiers={{
                matcha: matchaDays.map(d => {
                  const [y, m, day] = d.split('-').map(Number);
                  return new Date(y, m - 1, day);
                }),
              }}
              modifiersClassNames={{
                matcha: "!bg-gradient-to-br !from-appbg !to-appaccent !text-white !font-bold !border-2 !border-appaccent !shadow-lg !relative !overflow-hidden",
              }}
              components={{
                Day: ({ date, displayMonth, ...props }) => {
                  const dateStr = toLocalDateString(date);
                  const isMatchaDay = matchaDays.includes(dateStr);
                  const today = new Date();
                  const isToday = isSameDay(date, today);
                  
                  // Check if this day is part of a streak
                  const isInStreak = checkIfInStreak(dateStr);
                  
                  return (
                    <div className="relative w-full h-full">
                      <button
                        {...props}
                        className={`w-full h-full flex items-center justify-center relative rounded-xl overflow-hidden border transition-all duration-300 focus:ring-4 focus:ring-green-400/30 focus:outline-none group ${
                          isMatchaDay ? "border-green-400" : "border-green-200 bg-green-50"
                        } ${
                          isToday ? "ring-4 ring-green-500 shadow-lg" : ""
                        } ${
                          isInStreak ? "ring-2 ring-orange-400 ring-opacity-60" : ""
                        } hover:scale-105 hover:shadow-md hover:border-green-500`}
                      >
                        {isMatchaDay ? (
                          // Show matcha image for marked days with date overlay
                          <div className="w-full h-full relative">
                            <img
                              src={getImageForDate(date)}
                              alt="Matcha Day"
                              className="w-full h-full object-cover"
                            />
                            {/* Date overlay on bottom-right corner */}
                            <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 to-transparent"></div>
                            <span className="absolute bottom-1 right-1 text-xs font-bold text-white bg-green-900/40 px-1 rounded">
                              {date.getDate()}
                            </span>
                          </div>
                        ) : (
                          // Show day number with soft background for unmarked days
                          <span className="text-gray-700 font-medium">
                            {date.getDate()}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                }
              }}
            />
          </div>

          {/* Enhanced Streak Indicators - Directly Under Calendar */}
          <div className="mt-12 flex justify-center">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              {/* Highest Streak */}
              <div className="relative group">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-md px-6 py-3 border border-yellow-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <div className="text-sm font-medium text-yellow-800">Highest Streak</div>
                      <div className="text-3xl font-black text-yellow-900">{highestStreak}</div>
                      <div className="text-xs text-yellow-700">{highestStreak === 1 ? 'day' : 'days'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Streak */}
              <div className="relative group">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-md px-6 py-3 border border-red-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <div className="text-sm font-medium text-red-800">Current Streak</div>
                      <div className="text-3xl font-black text-red-900">{currentStreak}</div>
                      <div className="text-xs text-red-700">{currentStreak === 1 ? 'day' : 'days'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Achievement */}
              {highestStreak >= 10 && (
                <div className="relative group">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-md px-8 py-3 border border-purple-200/50 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="flex items-center space-x-3">
                      <Star className="w-8 h-8 text-purple-600" />
                      <span className="text-xl font-black text-purple-800">✨ 10+ Day Streak! You are a Matcha Master! ✨</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Back Button */}
        <div className="text-center mt-12 space-x-4">
          <button
            onClick={() => navigate("/home")}
            className="bg-gradient-to-r from-appbg to-appaccent hover:from-appaccent hover:to-appbg text-white font-bold py-4 px-8 rounded-2xl shadow-xl border-2 border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl transform"
          >
            ← Back to Home
          </button>
          
          {/* Reset to Mock Data Button */}
          <button
            onClick={() => {
              const newData = resetToMockData();
              setMatchaDays(newData);
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-2xl shadow-xl border-2 border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl transform"
          >
            🔄 Reset to Mock Data
          </button>
        </div>
      </div>
      
      {/* Chat Widget - Fixed at bottom-right corner */}
      <ChatWidget />
    </div>
  );
}
