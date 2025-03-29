import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ReflectionPrompt } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function ReflectionPrompts() {
  const { user } = useAuth();
  const { data: prompts, isLoading } = useQuery<ReflectionPrompt[]>({
    queryKey: ["/api/reflection-prompts"],
  });

  // Filter prompts based on user's premium status
  const availablePrompts = prompts?.filter(prompt => !prompt.isPremium || user?.isPremium);
  const premiumPrompts = prompts?.filter(prompt => prompt.isPremium && !user?.isPremium);

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Reflection Prompts</h2>
        <Link href="/journal" className="text-primary hover:text-primary-700 text-sm font-medium">
          View all
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availablePrompts && availablePrompts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-gray-900">Today's Prompt</h3>
              <p className="mt-3 text-gray-700">{availablePrompts[0].prompt}</p>
              <Link href="/journal">
                <Button variant="outline" className="mt-4 w-full border-primary text-primary hover:bg-primary-50">
                  Write Response
                </Button>
              </Link>
            </div>
          )}
          
          {premiumPrompts && premiumPrompts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow relative">
              <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-gradient-to-r from-primary to-primary-600 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                PRO
              </span>
              <h3 className="font-medium text-gray-900">Deep Reflection</h3>
              <p className="mt-3 text-gray-700">{premiumPrompts[0].prompt}</p>
              <Link href="/premium">
                <Button className="mt-4 w-full bg-primary hover:bg-primary-600">
                  <Lock className="h-4 w-4 mr-2" />
                  Unlock Premium
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
