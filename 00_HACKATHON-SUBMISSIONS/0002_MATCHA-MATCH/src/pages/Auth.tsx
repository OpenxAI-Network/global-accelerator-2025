import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Save a lightweight "session" locally so Header can show a profile
  const finishLogin = (email: string) => {
    const name = email?.split("@")[0] || "Matcha Lover";
    localStorage.setItem("mm_user", JSON.stringify({ email, name }));
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    const confirmPassword = String(fd.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setIsLoading(false);
      toast({ title: "Passwords don’t match", variant: "destructive" });
      return;
    }

    // TODO: replace with real auth call (e.g., Supabase)
    setTimeout(() => {
      finishLogin(email);
      setIsLoading(false);
      toast({ title: "Account created! 🍃", description: "Welcome to your matcha journey" });
      navigate("/preferences");
    }, 600);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    // const password = String(fd.get("password") || "");

    // TODO: replace with real auth call
    setTimeout(() => {
      finishLogin(email);
      setIsLoading(false);
      toast({ title: "Welcome back! 🍵", description: "Let’s find your perfect matcha" });
      navigate("/preferences");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-matcha">
      <Header />
      <div className="flex items-center justify-center p-4 flex-1">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-matcha-800">🍃 Matcha Finder</h1>
            <p className="text-matcha-600">Discover your perfect matcha experience</p>
          </div>

          <Card className="border-matcha-200 shadow-xl bg-white/95 backdrop-blur">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-matcha-800">Welcome</CardTitle>
              <CardDescription className="text-center text-matcha-600">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-matcha-50">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-matcha-100">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-matcha-100">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4 mt-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-matcha-700">Email</Label>
                      <Input id="signin-email" name="email" type="email" placeholder="you@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-matcha-700">Password</Label>
                      <Input id="signin-password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full bg-matcha-600 hover:bg-matcha-700 text-white" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In 🍵"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-matcha-700">Email</Label>
                      <Input id="signup-email" name="email" type="email" placeholder="you@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-matcha-700">Password</Label>
                      <Input id="signup-password" name="password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-matcha-700">Confirm Password</Label>
                      <Input id="signup-confirm-password" name="confirmPassword" type="password" required />
                    </div>
                    <Button type="submit" className="w-full bg-matcha-600 hover:bg-matcha-700 text-white" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account 🍃"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}