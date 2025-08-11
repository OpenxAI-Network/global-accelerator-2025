"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@pocketpenny/ui/components/button";
import { Input } from "@pocketpenny/ui/components/input";
import { ScrollArea } from "@pocketpenny/ui/components/scroll-area";
import { Bot, Send, User } from "lucide-react";

import { useUIState } from "./providers";

interface ConversationalChatProps {
  conceptId: string;
}

const conceptFAQs: Record<string, Array<{ question: string; answer: string }>> = {
  "compound-interest": [
    {
      question: "What exactly is compound interest?",
      answer:
        "Compound interest is when you earn interest not just on your original investment, but also on the interest you've already earned. It's like a snowball effect - your money grows faster over time because the growth itself starts growing!",
    },
    {
      question: "How is compound interest different from simple interest?",
      answer:
        "Simple interest only pays you on your original amount. For example, $1000 at 5% simple interest earns $50 every year. But with compound interest, in year 2 you'd earn interest on $1050, then $1102.50, and so on. The difference becomes huge over time!",
    },
    {
      question: "When does compound interest really start to show its power?",
      answer:
        "The magic really happens after 10+ years. In the first few years, the difference between simple and compound interest is small. But give it time - after 20-30 years, compound interest can double or triple your returns compared to simple interest.",
    },
  ],
  "dollar-cost-averaging": [
    {
      question: "What is dollar-cost averaging?",
      answer:
        "Dollar-cost averaging means investing the same amount of money regularly, regardless of market conditions. For example, investing $500 every month whether the market is up or down.",
    },
    {
      question: "Why not just invest when the market is low?",
      answer:
        "Because nobody can predict when the market will be at its lowest! Even professional investors struggle with timing. Dollar-cost averaging removes the guesswork and helps you buy more shares when prices are low and fewer when prices are high.",
    },
    {
      question: "Does this strategy work in bear markets?",
      answer:
        "Actually, dollar-cost averaging can work especially well in bear markets! When prices are falling, your regular investments buy more shares. When the market recovers, you'll have accumulated shares at various price points, many of them at discounted prices.",
    },
  ],
  // Add more concept FAQs...
};

export const ConversationalChat: React.FC<ConversationalChatProps> = ({ conceptId }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { state: uiState, dispatch } = useUIState();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [uiState.chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    dispatch({
      type: "ADD_CHAT_MESSAGE",
      payload: { id: Date.now().toString(), timestamp: new Date().toISOString(), type: "user", content: message },
    });

    setIsTyping(true);
    setMessage("");

    // Simulate bot response
    setTimeout(() => {
      const faqs = conceptFAQs[conceptId] || [];
      const userMessage = message.toLowerCase();

      let botResponse = "That's a great question! Let me help you understand this concept better.";

      // Simple keyword matching for FAQ responses
      const matchingFAQ = faqs.find(
        (faq) =>
          faq.question.toLowerCase().includes(userMessage) ||
          userMessage.includes(faq.question.toLowerCase().slice(0, 10))
      );

      if (matchingFAQ) {
        botResponse = matchingFAQ.answer;
      } else if (userMessage.includes("example")) {
        botResponse =
          "Here's a practical example: Let's say you start with $1,000 and add $200 every month at 7% annual return. Try adjusting the numbers in the calculator above to see how different amounts and timeframes affect your results!";
      } else if (userMessage.includes("risk")) {
        botResponse =
          "Great question about risk! All investments carry some risk, but historically, diversified index funds have provided positive returns over long periods (10+ years). The key is matching your investment timeline with your risk tolerance.";
      } else if (userMessage.includes("start") || userMessage.includes("begin")) {
        botResponse =
          "The best time to start investing is now! Even small amounts make a difference thanks to compound interest. You could start with as little as $50-100 per month. The important thing is to begin and stay consistent.";
      }

      dispatch({
        type: "ADD_CHAT_MESSAGE",
        payload: { id: Date.now().toString(), timestamp: new Date().toISOString(), type: "bot", content: botResponse },
      });
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const suggestedQuestions = conceptFAQs[conceptId]?.slice(0, 3) || [
    "Can you give me an example?",
    "How do I get started?",
    "What are the risks?",
  ];

  return (
    <div className="flex h-96 flex-col">
      <ScrollArea className="mb-4 flex-1 rounded-lg border p-4" ref={scrollAreaRef}>
        {uiState.chatHistory.length === 0 && (
          <div className="mb-4 text-center text-gray-500">
            <Bot className="mx-auto mb-2 h-8 w-8 text-blue-500" />
            <p>Hi! I'm here to answer your questions about this concept.</p>
            <p className="mt-2 text-sm">Try asking one of these questions:</p>
          </div>
        )}

        {uiState.chatHistory.map((chat) => (
          <div key={chat.id} className={`mb-4 flex ${chat.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[80%] ${chat.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  chat.type === "user" ? "ml-2 bg-blue-500" : "mr-2 bg-gray-500"
                }`}
              >
                {chat.type === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div
                className={`rounded-lg p-3 ${
                  chat.type === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                {chat.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="mb-4 flex justify-start">
            <div className="flex">
              <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-lg bg-gray-100 p-3">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {uiState.chatHistory.length === 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setMessage(typeof question === "string" ? question : question.question)}
              className="text-left"
            >
              {typeof question === "string" ? question : question.question}
            </Button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about this concept..."
          className="flex-1"
        />
        <Button onClick={handleSendMessage} disabled={!message.trim() || isTyping}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
