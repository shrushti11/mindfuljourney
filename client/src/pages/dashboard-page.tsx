import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNavigation from "@/components/layout/MobileNavigation";
import MoodTracker from "@/components/dashboard/MoodTracker";
import JournalActivity from "@/components/dashboard/JournalActivity";
import MoodHistory from "@/components/dashboard/MoodHistory";
import JournalEntries from "@/components/dashboard/JournalEntries";
import MindfulnessSessions from "@/components/dashboard/MindfulnessSessions";
import PromoSection from "@/components/dashboard/PromoSection";
import ReflectionPrompts from "@/components/dashboard/ReflectionPrompts";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Welcome back, {user?.username}
          </h1>
          <p className="mt-2 text-gray-600">How are you feeling today?</p>
        </header>
        
        <MoodTracker />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <JournalActivity />
          <MoodHistory />
        </div>
        
        <JournalEntries />
        <MindfulnessSessions />
        <PromoSection />
        <ReflectionPrompts />
      </main>
      
      <MobileNavigation />
    </div>
  );
}
