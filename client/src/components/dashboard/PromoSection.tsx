import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function PromoSection() {
  const { user } = useAuth();

  // If user is already premium, don't show promo section
  if (user?.isPremium) {
    return null;
  }

  return (
    <section className="mb-6">
      <div className="bg-gradient-to-r from-primary to-primary-800 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-64 h-64">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold mb-3">Unlock Premium Features</h2>
          <p className="mb-4 max-w-lg">Get access to deep reflection prompts, advanced analytics, and exclusive mindfulness content to enhance your mental health journey.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/premium">
              <Button className="bg-white text-primary-700 hover:bg-gray-100">
                Upgrade to Pro
              </Button>
            </Link>
            <Link href="/premium">
              <Button variant="secondary" className="bg-primary-700 bg-opacity-40 hover:bg-opacity-50 text-white">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
