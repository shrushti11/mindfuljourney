import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MoodEntry, CalendarDay } from "@/types";
import { Loader2 } from "lucide-react";

export default function MoodHistory() {
  const { data: moodEntries, isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood"],
  });

  const generateCalendarDays = (): CalendarDay[][] => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get the last day of the month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get the last day of the previous month
    const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0);
    const daysInPrevMonth = lastDayOfPrevMonth.getDate();
    
    // Create calendar grid
    const weeks: CalendarDay[][] = [];
    let days: CalendarDay[] = [];
    
    // Add days from previous month to fill the first row
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateString = date.toISOString().split('T')[0];
      
      const moodForDay = moodEntries?.find(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate.toISOString().split('T')[0] === dateString;
      });
      
      days.push({
        date: i,
        isCurrentMonth: true,
        mood: moodForDay?.mood as any,
        isToday: i === today.getDate(),
      });
      
      if (days.length === 7) {
        weeks.push([...days]);
        days = [];
      }
    }
    
    // Add days from next month to fill the last row
    if (days.length > 0) {
      const daysToAdd = 7 - days.length;
      for (let i = 1; i <= daysToAdd; i++) {
        days.push({
          date: i,
          isCurrentMonth: false,
        });
      }
      weeks.push([...days]);
    }
    
    return weeks;
  };

  const moodToEmoji = (mood: string | undefined): string => {
    if (!mood) return "";
    const emojiMap: Record<string, string> = {
      happy: "😊",
      calm: "😌",
      neutral: "😐",
      sad: "😔",
      stressed: "😖",
    };
    return emojiMap[mood] || "";
  };

  const weeks = generateCalendarDays();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Mood History</h2>
        <Link href="/mood" className="text-primary hover:text-primary-600 text-sm font-medium">
          View analytics
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="grid grid-cols-7 gap-1 mb-2">
            <div className="text-xs text-center text-gray-500">M</div>
            <div className="text-xs text-center text-gray-500">T</div>
            <div className="text-xs text-center text-gray-500">W</div>
            <div className="text-xs text-center text-gray-500">T</div>
            <div className="text-xs text-center text-gray-500">F</div>
            <div className="text-xs text-center text-gray-500">S</div>
            <div className="text-xs text-center text-gray-500">S</div>
          </div>
          
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-2">
              {week.map((day, dayIndex) => (
                <div 
                  key={`${weekIndex}-${dayIndex}`} 
                  className={`calendar-day text-center relative ${
                    !day.isCurrentMonth ? "text-gray-400" : ""
                  } ${
                    day.isToday ? "bg-primary-100 border border-primary-300 rounded-lg" : ""
                  } ${
                    day.mood ? "has-mood" : ""
                  }`}
                >
                  {day.date}
                  {day.mood && (
                    <span className="absolute bottom-1 text-xs">{moodToEmoji(day.mood)}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
          
          <div className="mt-2 text-sm text-gray-500 flex items-center">
            <span className="w-3 h-3 bg-primary-100 border border-primary-300 rounded-sm inline-block mr-2"></span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  );
}
