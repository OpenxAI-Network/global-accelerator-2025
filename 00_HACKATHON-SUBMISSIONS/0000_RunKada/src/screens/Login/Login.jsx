import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import Squares from "../../components/Squares";
import { useAuth } from "../../contexts/AuthContext";

export const Login = () => {
  const { loginWithStrava, handleStravaCallback, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle Strava callback if code is present in URL
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleStravaCallback(code)
        .then(() => {
          navigate('/');
        })
        .catch((error) => {
          console.error('Authentication failed:', error);
          // You might want to show an error message to the user
        });
    }
  }, [searchParams, handleStravaCallback, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleStravaLogin = async () => {
    try {
      await loginWithStrava();
    } catch (error) {
      console.error('Login error:', error);
      // You might want to show an error message to the user
    }
  };

  return (
    <div className="bg-[#f5f5f5] overflow-hidden w-full min-h-screen relative flex items-center justify-center">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-auto">
        <Squares 
          speed={0.2} 
          squareSize={40}
          direction='diagonal'
          borderColor='#56504a'
          hoverFillColor='#fcd96b'
        />
      </div>

      {/* Logo in top left */}
      <Link to="/" className="absolute top-2 left-50 z-50 hover:opacity-80 transition-opacity">
        <img
          className="h-[80px] lg:h-[100px] w-auto"
          alt="RunKada Logo"
          src="https://c.animaapp.com/mgqjxiy6qqDflS/img/logofull-1.svg"
        />
      </Link>

      {/* Main Login Card */}
            {/* Login Card */}
      <div className="relative z-10 w-full max-w-[450px] mx-auto px-6">
        <div className="bg-white rounded-3xl border-4 border-[#56504a] shadow-[8px_8px_0px_0px_rgba(86,80,74,1)] p-8">
          {/* Welcome Text */}
          <h1 className="font-porter text-3xl text-[#56504a] text-center mb-2 uppercase">
            WELCOME BACK
          </h1>

          {/* Strava Login Button */}
          <button
            onClick={handleStravaLogin}
            className="w-full bg-[#fc4c02] hover:bg-[#e34402] text-white rounded-[30px] px-6 py-4 border-[3px] border-black shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 mb-5"
          >
            {/* Strava Icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
            </svg>
            <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-lg uppercase">
              Connect with Strava
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-[2px] border-black"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 [font-family:'Poppins',Helvetica] font-medium text-black text-sm">
                WHY STRAVA?
              </span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#fcd96b] border-[2px] border-black flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#56504a] text-base">✓</span>
              </div>
              <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm">
                <span className="font-bold">Automatic tracking</span> - Your runs sync automatically from Strava
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#fcd96b] border-[2px] border-black flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#56504a] text-base">✓</span>
              </div>
              <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm">
                <span className="font-bold">Secure connection</span> - We only read your running activities
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#fcd96b] border-[2px] border-black flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#56504a] text-base">✓</span>
              </div>
              <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm">
                <span className="font-bold">Join your clan</span> - Compete with friends and track team progress
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-5 border-t-[2px] border-black">
            <p className="[font-family:'Poppins',Helvetica] font-medium text-black text-sm mb-3">
              Don't have a Strava account?
            </p>
            <a
              href="https://www.strava.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                variant="outline"
                className="border-2 border-[#56504a] bg-transparent hover:bg-[#f7e2c6] text-[#56504a] rounded-[30px] px-6 py-2.5"
              >
                <span className="[font-family:'Porter_Sans_Block-Block',Helvetica] font-normal text-sm uppercase">
                  Create Strava Account
                </span>
              </Button>
            </a>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-8">
          <Link to="/">
            <button className="[font-family:'Poppins',Helvetica] font-medium text-[#56504a] hover:text-black transition-colors text-base underline">
              Back to Home
            </button>
          </Link>
        </div>
      </div>

      {/* Info Section - Bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="max-w-[800px] mx-auto px-6">
          <p className="[font-family:'Poppins',Helvetica] font-medium text-[#56504a] text-xs text-center">
            By connecting with Strava, you agree to our Terms of Service and Privacy Policy. 
            We will never post to Strava without your permission.
          </p>
        </div>
      </div>
    </div>
  );
};
