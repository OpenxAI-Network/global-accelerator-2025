"use client";

import { useMemo, useState } from "react";

import { Badge } from "@pocketpenny/ui/components/badge";
import { Button } from "@pocketpenny/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pocketpenny/ui/components/card";
import { Input } from "@pocketpenny/ui/components/input";
import { Label } from "@pocketpenny/ui/components/label";
import { Progress } from "@pocketpenny/ui/components/progress";
import { Slider } from "@pocketpenny/ui/components/slider";
import { AlertTriangle, Calendar, CheckCircle, DollarSign, Shield } from "lucide-react";

interface EmergencyFundCalculatorProps {
  onInteract: () => void;
}

export const EmergencyFundCalculator: React.FC<EmergencyFundCalculatorProps> = ({ onInteract }) => {
  const [monthlyExpenses, setMonthlyExpenses] = useState(3000);
  const [currentSavings, setCurrentSavings] = useState(2000);
  const [targetMonths, setTargetMonths] = useState([6]);
  const [monthlySavings, setMonthlySavings] = useState(300);
  const [riskProfile, setRiskProfile] = useState<"low" | "medium" | "high">("medium");

  const calculations = useMemo(() => {
    onInteract();

    const targetAmount = monthlyExpenses * (targetMonths[0] ?? 6);
    const shortfall = Math.max(0, targetAmount - currentSavings);
    const monthsToGoal = shortfall > 0 ? Math.ceil(shortfall / monthlySavings) : 0;
    const progressPercentage = Math.min(100, (currentSavings / targetAmount) * 100);

    return {
      targetAmount,
      shortfall,
      monthsToGoal,
      progressPercentage,
    };
  }, [monthlyExpenses, currentSavings, targetMonths, monthlySavings, onInteract]);

  const riskProfiles = {
    low: {
      name: "Stable Job, Low Risk",
      months: 3,
      description: "Government job, very secure income",
      color: "bg-green-100 text-green-800",
    },
    medium: {
      name: "Typical Situation",
      months: 6,
      description: "Regular job, some income stability",
      color: "bg-blue-100 text-blue-800",
    },
    high: {
      name: "Variable Income, High Risk",
      months: 12,
      description: "Freelancer, commission-based, or seasonal work",
      color: "bg-red-100 text-red-800",
    },
  };

  const expenseCategories = [
    { name: "Rent/Mortgage", typical: 1200, priority: "essential" },
    { name: "Food & Groceries", typical: 400, priority: "essential" },
    { name: "Utilities", typical: 150, priority: "essential" },
    { name: "Transportation", typical: 300, priority: "essential" },
    { name: "Insurance", typical: 200, priority: "essential" },
    { name: "Phone", typical: 80, priority: "essential" },
    { name: "Minimum Debt Payments", typical: 200, priority: "essential" },
    { name: "Entertainment", typical: 200, priority: "optional" },
    { name: "Dining Out", typical: 150, priority: "optional" },
    { name: "Subscriptions", typical: 50, priority: "optional" },
  ];

  const essentialExpenses = expenseCategories
    .filter((cat) => cat.priority === "essential")
    .reduce((sum, cat) => sum + cat.typical, 0);

  const scenarios = [
    {
      title: "Job Loss",
      description: "Unexpected unemployment",
      duration: "3-6 months average",
      impact: "High",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    },
    {
      title: "Medical Emergency",
      description: "Unexpected medical bills",
      duration: "Immediate",
      impact: "Variable",
      icon: <Shield className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Home/Car Repair",
      description: "Major unexpected repairs",
      duration: "Immediate",
      impact: "Medium",
      icon: <DollarSign className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "Family Emergency",
      description: "Need to support family member",
      duration: "Variable",
      impact: "Medium-High",
      icon: <Calendar className="h-5 w-5 text-purple-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🛡️ Emergency Fund Calculator</CardTitle>
          <CardDescription>
            Build your financial safety net before investing. Calculate how much you need and how to get there.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Risk Profile Selection */}
            <div>
              <Label className="text-base font-semibold">What's Your Risk Profile?</Label>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                {Object.entries(riskProfiles).map(([key, profile]) => (
                  <Button
                    key={key}
                    variant={riskProfile === key ? "default" : "outline"}
                    onClick={() => {
                      setRiskProfile(key as typeof riskProfile);
                      setTargetMonths([profile.months]);
                    }}
                    className="h-auto p-4 text-left"
                  >
                    <div>
                      <div className="text-sm font-semibold">{profile.name}</div>
                      <div className="text-xs opacity-75">{profile.description}</div>
                      <Badge className={`${profile.color} mt-2`}>{profile.months} months recommended</Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expenses">Monthly Essential Expenses</Label>
                  <Input
                    id="expenses"
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                    className="mt-1"
                  />
                  <p className="mt-1 text-sm text-gray-500">Include rent, food, utilities, minimum debt payments</p>
                </div>

                <div>
                  <Label htmlFor="savings">Current Emergency Savings</Label>
                  <Input
                    id="savings"
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monthly">How Much Can You Save Monthly?</Label>
                  <Input
                    id="monthly"
                    type="number"
                    value={monthlySavings}
                    onChange={(e) => setMonthlySavings(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Target: {targetMonths[0]} months of expenses</Label>
                  <Slider
                    value={targetMonths}
                    onValueChange={setTargetMonths}
                    max={12}
                    min={3}
                    step={1}
                    className="mt-2"
                  />
                  <div className="mt-1 flex justify-between text-sm text-gray-500">
                    <span>3 months</span>
                    <span>12 months</span>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                  <h4 className="font-semibold">Your Emergency Fund Goal</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Target Amount:</span>
                      <span className="font-semibold">${calculations.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Savings:</span>
                      <span>${currentSavings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Still Need:</span>
                      <span
                        className={
                          calculations.shortfall > 0 ? "font-semibold text-red-600" : "font-semibold text-green-600"
                        }
                      >
                        ${calculations.shortfall.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Progress value={calculations.progressPercentage} className="h-3" />
                  <p className="text-sm text-gray-600">{calculations.progressPercentage.toFixed(1)}% complete</p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                <Shield className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                <p className="text-sm text-blue-600">Target Fund</p>
                <p className="text-xl font-bold text-blue-900">${calculations.targetAmount.toLocaleString()}</p>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <DollarSign className="mx-auto mb-2 h-8 w-8 text-red-600" />
                <p className="text-sm text-red-600">Still Need</p>
                <p className="text-xl font-bold text-red-900">${calculations.shortfall.toLocaleString()}</p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <p className="text-sm text-green-600">Months to Goal</p>
                <p className="text-xl font-bold text-green-900">{calculations.monthsToGoal || "Done!"}</p>
              </div>

              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                <p className="text-sm text-orange-600">Progress</p>
                <p className="text-xl font-bold text-orange-900">{calculations.progressPercentage.toFixed(0)}%</p>
              </div>
            </div>

            {/* Emergency Scenarios */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">What Emergencies Could You Face?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {scenarios.map((scenario, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                      {scenario.icon}
                      <div>
                        <h4 className="font-semibold">{scenario.title}</h4>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                        <div className="mt-1 flex gap-4 text-xs text-gray-500">
                          <span>Duration: {scenario.duration}</span>
                          <span>Impact: {scenario.impact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Typical Monthly Expenses Breakdown</CardTitle>
                <CardDescription>Use this as a guide to calculate your essential monthly expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2 font-semibold">
                    <span>Essential Expenses (Include These)</span>
                    <span>${essentialExpenses.toLocaleString()}</span>
                  </div>
                  {expenseCategories
                    .filter((cat) => cat.priority === "essential")
                    .map((category, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{category.name}</span>
                        <span>${category.typical}</span>
                      </div>
                    ))}

                  <div className="mt-4 flex justify-between border-t pt-2 font-semibold text-gray-500">
                    <span>Optional (Can Cut in Emergency)</span>
                    <span>
                      $
                      {expenseCategories
                        .filter((cat) => cat.priority === "optional")
                        .reduce((sum, cat) => sum + cat.typical, 0)}
                    </span>
                  </div>
                  {expenseCategories
                    .filter((cat) => cat.priority === "optional")
                    .map((category, index) => (
                      <div key={index} className="flex justify-between text-sm text-gray-500">
                        <span>{category.name}</span>
                        <span>${category.typical}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Plan */}
            {calculations.shortfall > 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-green-800">Your Action Plan</h3>
                <div className="space-y-3 text-green-700">
                  <p>
                    ✓ <strong>Step 1:</strong> Open a separate high-yield savings account for emergencies
                  </p>
                  <p>
                    ✓ <strong>Step 2:</strong> Set up automatic transfer of ${monthlySavings} per month
                  </p>
                  <p>
                    ✓ <strong>Step 3:</strong> Reach your ${calculations.targetAmount.toLocaleString()} goal in{" "}
                    {calculations.monthsToGoal} months
                  </p>
                  <p>
                    ✓ <strong>Step 4:</strong> Only then start investing for long-term growth
                  </p>
                </div>
                <div className="mt-4 rounded-lg bg-green-100 p-3">
                  <p className="text-sm text-green-800">
                    <strong>Remember:</strong> An emergency fund isn't an investment - it's insurance. Keep it in a
                    savings account where you can access it immediately without risk of loss.
                  </p>
                </div>
              </div>
            )}

            {calculations.shortfall <= 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h3 className="mb-2 text-lg font-semibold text-blue-800">Congratulations! 🎉</h3>
                <p className="text-blue-700">
                  You've reached your emergency fund goal! Now you can confidently start investing for long-term growth
                  knowing you have a solid financial foundation.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
