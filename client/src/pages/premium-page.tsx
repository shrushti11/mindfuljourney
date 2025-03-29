import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Brain, BarChart2, LockOpen } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Initialize Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";
const stripePromise = loadStripe(stripeKey);

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/premium?success=true",
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now a premium subscriber!",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary-600" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Subscribe Now"
        )}
      </Button>
    </form>
  );
}

export default function PremiumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/create-subscription", {});
      return await res.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowPaymentModal(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpgradeClick = () => {
    if (user?.isPremium) return;
    createSubscriptionMutation.mutate();
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    setShowPaymentModal(false);
  };

  const benefits = [
    {
      icon: Brain,
      title: "Deep Reflection Prompts",
      description: "Access to advanced journaling prompts designed to foster deeper self-awareness and emotional growth."
    },
    {
      icon: BarChart2,
      title: "Advanced Analytics",
      description: "Detailed insights into your mood patterns and emotional trends over time with interactive visualizations."
    },
    {
      icon: LockOpen,
      title: "Premium Audio Sessions",
      description: "Exclusive access to expert-guided mindfulness meditations and specialized relaxation techniques."
    }
  ];

  const features = [
    "Unlimited journal storage",
    "No ads or interruptions",
    "Weekly email insights",
    "Priority support",
    "Download your data anytime",
    "Early access to new features"
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Premium Features</h1>
          <p className="mt-2 text-gray-600">Unlock advanced tools for your mental wellness journey</p>
        </header>
        
        {user?.isPremium ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center mb-8">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">You're a Premium Member!</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              Thank you for your support. You now have full access to all premium features and content.
            </p>
            <Button variant="outline" className="mt-2">
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary to-primary-800 rounded-xl shadow-sm p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Upgrade to Premium</h2>
                <p className="text-white/90 max-w-md mb-4">
                  Take your mental wellness to the next level with our premium features designed to help you gain deeper insights and foster meaningful growth.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold">$4.99</div>
                  <div className="text-white/80">per month</div>
                </div>
              </div>
              <Button 
                size="lg" 
                className="bg-white text-primary-700 hover:bg-gray-100"
                onClick={handleUpgradeClick}
                disabled={createSubscriptionMutation.isPending}
              >
                {createSubscriptionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upgrade Now"
                )}
              </Button>
            </div>
          </div>
        )}
        
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Premium Benefits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
              <CardDescription>
                Everything in the free plan, plus these premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-primary-100 rounded-full p-1 mt-0.5 mr-3">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                Important information about your subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Your subscription will automatically renew each month. You can cancel anytime from your account settings.
              </p>
              <p className="text-gray-600">
                All payments are processed securely through Stripe. We don't store your payment information.
              </p>
              <p className="text-gray-600">
                Have questions? Contact our support team at support@mindapp.com
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleUpgradeClick}
                disabled={user?.isPremium || createSubscriptionMutation.isPending}
              >
                {user?.isPremium ? "Already Subscribed" : "Subscribe Now"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              Enter your payment details to access premium features
            </DialogDescription>
          </DialogHeader>
          
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm onSuccess={handlePaymentSuccess} />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
      
      <MobileNavigation />
    </div>
  );
}
