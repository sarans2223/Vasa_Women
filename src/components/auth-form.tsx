
"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { KeyRound, Mail, User, Users, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/firebase/provider";

type AuthFormProps = {
  type: "login" | "signup";
};

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const [showForgot, setShowForgot] = useState(false);


  const handleAuthSuccess = () => {
    localStorage.setItem("userName", name || email.split('@')[0] || "VaSa Member");
    if (email) {
      localStorage.setItem("userEmail", email.toLowerCase());
    }
    // Simulate verification for immediate access
    localStorage.setItem('isPanVerified', 'true');
    localStorage.setItem('isAadhaarVerified', 'true');
    
    router.push("/dashboard");
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    toast({
        title: "Login Successful",
        description: "Welcome! Redirecting you to the dashboard.",
    });

    // Directly handle \"successful\" dummy authentication
    setTimeout(() => {
        localStorage.setItem("userName", "user");
        // Simulate verification for immediate access
        localStorage.setItem('isPanVerified', 'true');
        localStorage.setItem('isAadhaarVerified', 'true');
        
        router.push("/dashboard");
        setIsLoading(false);
    }, 1000);
  }

  const handleForgotPassword = () => {
    toast({
      title: "Forgot password",
      description:
        "In a real VaSa app, we would send a password reset link to your email.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (type === "signup") {
      if (!name || !email || !password) {
         toast({ title: "Missing fields", description: "Please fill in all fields to proceed.", variant: "destructive" });
         setIsLoading(false);
         return;
      }
      if (!agreeTerms || !isAdult) {
        toast({ title: "Agreement required", description: "You must agree to the terms and age confirmation.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    if (type === "login") {
       if (!email || !password) {
         toast({ title: "Missing fields", description: "Please enter your email and password.", variant: "destructive" });
         setIsLoading(false);
         return;
      }
    }
    
    toast({
        title: "Login Successful",
        description: "Welcome! Redirecting you to the dashboard.",
    });

    // Directly handle \"successful\" dummy authentication
    setTimeout(() => {
        handleAuthSuccess();
        setIsLoading(false);
    }, 1000);
  };

  return (
    <Dialog>
      <div className="flex w-full min-h-screen items-center justify-center bg-background">
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#E0BBE4] via-[#957DAD] to-[#D291BC]">
                {type === "login"
                  ? "Welcome Back to VaSa"
                  : "Join the VaSa Community"}
              </CardTitle>
              <CardDescription>
                {type === "login"
                  ? "Enter any credentials to access your account."
                  : "Create a dummy account to get started."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {type === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Savitri Bai"
                        required
                        minLength={2}
                        maxLength={50}
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="any@email.com"
                      required
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="any password"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  {type === "login" && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="mt-1 text-xs text-accent underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {type === "signup" && (
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                      />
                      <span>
                        I agree to VaSa&apos;s{" "}
                        <DialogTrigger asChild>
                          <span className="underline hover:text-accent cursor-pointer">
                            Terms and Privacy Policy
                          </span>
                        </DialogTrigger>
                        .
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={isAdult}
                        onChange={(e) => setIsAdult(e.target.checked)}
                      />
                      <span>
                        I am 18+ or have guardian permission to use this platform.
                      </span>
                    </label>
                  </div>
                )}

                <Button
                  disabled={isLoading}
                  type="submit"
                  className="w-full font-semibold bg-gradient-to-r from-[#E0BBE4] to-[#957DAD] hover:opacity-90 transition-opacity text-primary-foreground"
                >
                  {isLoading
                    ? "Processing..."
                    : type === "login"
                    ? "Log In"
                    : "Create Account"}
                </Button>
              </form>

              {type === "login" && (
                <>
                  <div className="my-6 flex items-center">
                    <Separator className="flex-1" />
                    <span className="mx-4 text-sm text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                  </div>
                   <Button
                    variant="outline"
                    className="w-full mb-2"
                    onClick={handleGoogleSignIn}
                  >
                    Sign in with Google
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => router.push("/onsite-login")}
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Onsite Member Login
                  </Button>
                </>
              )}
            </CardContent>

            <CardFooter className="justify-center text-sm">
              {type === "login" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-accent hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-accent hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms and Conditions</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[50vh] pr-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <h3 className="font-semibold text-foreground">1. Introduction</h3>
            <p>Welcome to VaSa. By using our application, you agree to these Terms and Conditions. If you disagree, you may not use the service.</p>

            <h3 className="font-semibold text-foreground">2. User Accounts</h3>
            <p>You must provide accurate and complete information when creating an account. You are responsible for safeguarding your password and for all activities that occur under your account.</p>

            <h3 className="font-semibold text-foreground">3. Content</h3>
            <p>You are responsible for any content you post, including its legality and appropriateness. By posting content, you grant us a license to use, modify, and distribute it in connection with the service.</p>
            
            <h3 className="font-semibold text-foreground">4. Prohibited Uses</h3>
            <p>You agree not to use the service for any unlawful purpose, to solicit others to perform or participate in any unlawful acts, or to harass, abuse, or harm another person.</p>

            <h3 className="font-semibold text-foreground">5. SOS Feature</h3>
            <p>The SOS feature is intended for genuine emergencies only. Misuse of this feature may result in suspension of your account. We are not liable for any delays or failures in the SOS system but will make a best effort to notify your emergency contacts.</p>

            <h3 className="font-semibold text-foreground">6. Termination</h3>
            <p>We may terminate or suspend your account at any time, without prior notice, for any reason, including a breach of these Terms.</p>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
