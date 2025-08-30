import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

export default function Preferences() {
  const [preferences, setPreferences] = useState({
    matchaType: "",
    sweetness: [50],
    priceRange: "",
    atmosphere: [] as string[],
    experience: "",
    notes: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAtmosphereChange = (atmosphere: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      atmosphere: checked 
        ? [...prev.atmosphere, atmosphere]
        : prev.atmosphere.filter(item => item !== atmosphere)
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    
    // TODO: Save to Supabase database
    // const { data, error } = await supabase
    //   .from('user_preferences')
    //   .insert([
    //     {
    //       user_id: user.id,
    //       matcha_type: preferences.matchaType,
    //       sweetness_level: preferences.sweetness[0],
    //       price_range: preferences.priceRange,
    //       preferred_atmosphere: preferences.atmosphere,
    //       experience_level: preferences.experience,
    //       notes: preferences.notes
    //     }
    //   ]);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Preferences saved! 🌿",
        description: "We'll find the perfect matcha spots for you",
      });
      navigate("/");
    }, 1000);
  };

  const canProceed = preferences.matchaType && preferences.priceRange && preferences.experience;

  return (
    <div className="min-h-screen bg-gradient-matcha">
      <Header />
      <div className="max-w-2xl mx-auto space-y-8 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-matcha-800">🍃 Tell us about you</h1>
          <p className="text-matcha-600">Help us find your perfect matcha experience</p>
        </div>

        <Card className="border-matcha-200 shadow-xl bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-matcha-800">Your Matcha Preferences</CardTitle>
            <CardDescription className="text-matcha-600">
              This helps us recommend the best spots for your taste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Matcha Type Preference */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                What's your favorite type of matcha? ✨
              </Label>
              <RadioGroup 
                value={preferences.matchaType} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, matchaType: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="traditional" id="traditional" />
                  <Label htmlFor="traditional" className="text-matcha-700">Traditional ceremonial matcha</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="latte" id="latte" />
                  <Label htmlFor="latte" className="text-matcha-700">Matcha lattes & drinks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="desserts" id="desserts" />
                  <Label htmlFor="desserts" className="text-matcha-700">Matcha desserts & sweets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="text-matcha-700">I love all matcha! 🍃</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sweetness Preference */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                How sweet do you like your matcha? 🍯
              </Label>
              <div className="space-y-2">
                <Slider
                  value={preferences.sweetness}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, sweetness: value }))}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-matcha-600">
                  <span>Unsweet</span>
                  <span>Perfectly Sweet</span>
                  <span>Very Sweet</span>
                </div>
                <div className="text-center text-matcha-700 font-medium">
                  Sweetness: {preferences.sweetness[0]}%
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                What's your preferred price range? 💰
              </Label>
              <RadioGroup 
                value={preferences.priceRange} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, priceRange: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-matcha-700">Budget-friendly ($)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-matcha-700">Mid-range ($$)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-matcha-700">Premium ($$$)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="luxury" id="luxury" />
                  <Label htmlFor="luxury" className="text-matcha-700">Luxury experience ($$$$)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Atmosphere */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                What atmosphere do you prefer? 🌟
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Cozy & Quiet",
                  "Modern & Trendy", 
                  "Traditional & Serene",
                  "Social & Lively",
                  "Outdoor & Scenic",
                  "Artistic & Creative"
                ].map((atmosphere) => (
                  <div key={atmosphere} className="flex items-center space-x-2">
                    <Checkbox
                      id={atmosphere}
                      checked={preferences.atmosphere.includes(atmosphere)}
                      onCheckedChange={(checked) => 
                        handleAtmosphereChange(atmosphere, checked as boolean)
                      }
                    />
                    <Label htmlFor={atmosphere} className="text-matcha-700 text-sm">
                      {atmosphere}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <Label className="text-lg font-medium text-matcha-800">
                What's your matcha experience level? 🎯
              </Label>
              <RadioGroup 
                value={preferences.experience} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, experience: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="text-matcha-700">New to matcha - learning!</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="text-matcha-700">I know what I like</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expert" id="expert" />
                  <Label htmlFor="expert" className="text-matcha-700">Matcha connoisseur</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Additional Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-lg font-medium text-matcha-800">
                Any other preferences or notes? 📝
              </Label>
              <Textarea
                id="notes"
                placeholder="e.g., I prefer organic matcha, love outdoor seating, want to avoid crowds..."
                value={preferences.notes}
                onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-matcha-200 text-matcha-700 hover:bg-matcha-50"
          >
            ← Back to Discovery
          </Button>
          <Button
            onClick={handleSavePreferences}
            disabled={!canProceed || isLoading}
            className="bg-matcha-600 hover:bg-matcha-700 text-white px-8"
          >
            {isLoading ? "Saving..." : "Save Preferences & Find Spots 🍃"}
          </Button>
        </div>
      </div>
    </div>
  );
}