import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

const model = "llama3.2:1b";

interface StoryState {
  choices: string[];
  currentLocation: string;
  health: number;
  currentMilestone: number;
  milestoneStep: number; // track step toward next milestone (1 or 2)
  previousChoices: string[]; // track all previous choices for context
  lastAIMessage?: string; // previous AI narration
}

const STORY_MILESTONES = [
  { id: 1, name: "Wake Up", description: "Player wakes up stranded on island" },
  { id: 2, name: "Survival & Search", description: "Player searches island for clues while surviving" },
  { id: 3, name: "Evidence Discovery", description: "Player finds evidence of another person" },
  { id: 4, name: "Encounter", description: "Player meets another person" },
  { id: 5, name: "Ending", description: "Final resolution based on choices" }
];

const SYSTEM_PROMPT = `You are the narrator and game master for "Stranded Island Adventure".

CRITICAL RULES:
- Keep narration SHORT (max 80 words, aim for 60-70)
- Respond to player's specific action - your response should be in first person from the player's perspective
- Each response MUST move closer to the next milestone. Do not stall.
- Each milestone MUST be completed within exactly 2 turns (step 1 → step 2).
- At step 2, milestone MUST be completed, no exceptions.
- Tone: Engaging, thrilling, with some humor
- Do NOT allow side quests, endless exploration, or repeating the same scene.
- CRITICAL: The story MUST end after milestone 5

RESPONSE FORMAT:
1. Describe the consequences/outcome of their action
2. Describe the scene they're currently in, the setting or the person they're interacting with - this can include dialoge from the person they're with

The purpose is to give the player opportunities to make decisions and progress the story.

The player will tell you what they DO or SAY - respond naturally to their specific action and continue the story.`;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { message, storyState } = data;

    const currentMilestone = storyState?.currentMilestone || 1;
    const milestoneStep = storyState?.milestoneStep || 1;
    const nextMilestone = STORY_MILESTONES.find(m => m.id === currentMilestone + 1);

    // Handle game start
    if (message === "start") {
      const startMessage = `You wake up on a sandy beach, your head pounding with confusion. The sound of crashing waves fills your ears as you slowly open your eyes to find yourself on a mysterious tropical island. Palm trees sway gently in the breeze, and the air is thick with the scent of salt and tropical flowers.

You have no memory of how you got here, but one thing is certain - you need to figure out what happened and find a way to survive. The warm sand beneath you feels real, and the tropical sun beats down on your skin. You're definitely not dreaming.

What would you like to do first?

1. Search the beach for washed-up items and clues
2. Explore the jungle for food, water, and shelter
3. Climb to higher ground to survey the island
4. Check the coral reef for resources and signs of life`;

      const startState: StoryState = {
        choices: [],
        currentLocation: "Unknown Shore",
        health: 100,
        currentMilestone: 1,
        milestoneStep: 1,
        previousChoices: []
      };

      return NextResponse.json({
        message: startMessage,
        success: true,
        currentMilestone: 1,
        nextMilestone: "Survival & Search",
        milestoneStep: 1,
        updatedStoryState: startState
      });
    }

    // Use the user's message directly as their action
    const selectedChoice = message;

    // Update story state with player's choice
    const updatedStoryState: StoryState = {
      ...storyState,
      currentMilestone: currentMilestone,
      choices: [...(storyState?.choices || []), selectedChoice],
      previousChoices: [...(storyState?.previousChoices || []), selectedChoice]
    };

    // Build comprehensive context for AI
    const previousChoicesContext = storyState?.previousChoices?.length > 0 
      ? `Previous choices: ${storyState.previousChoices.slice(-3).join(' → ')}`
      : "This is the player's first choice";

    const currentLocationContext = storyState?.currentLocation !== "Unknown Shore" 
      ? `Current location: ${storyState.currentLocation}`
      : "Location: Unknown Shore";

    // Create milestone-specific guidance with STRONG progression requirements
    let milestoneGuidance = "";
    let isMilestoneCompletion = false;
    let isFinalMilestone = false;
    
    if (currentMilestone === 1) {
      if (milestoneStep === 1) {
        milestoneGuidance = "Goal: This is step 1 of 2. Guide player toward Survival & Search phase. They must search the island for clues while surviving.";
      } else {
        milestoneGuidance = "Goal: This is step 2 of 2. COMPLETE the Survival & Search milestone. Player must find evidence of another person (footprints, campsite, markings, sounds).";
        isMilestoneCompletion = true;
      }
    } else if (currentMilestone === 2) {
      if (milestoneStep === 1) {
        milestoneGuidance = "Goal: This is step 1 of 2. Guide player toward Evidence Discovery. They must find evidence of another person.";
      } else {
        milestoneGuidance = "Goal: This is step 2 of 2. COMPLETE the Evidence Discovery milestone. Player must discover clear evidence of another person.";
        isMilestoneCompletion = true;
      }
    } else if (currentMilestone === 3) {
      if (milestoneStep === 1) {
        milestoneGuidance = "Goal: This is step 1 of 2. Guide player toward Encounter. They must approach meeting another person.";
      } else {
        milestoneGuidance = "Goal: This is step 2 of 2. COMPLETE the Encounter milestone. Player must meet another person on the island.";
        isMilestoneCompletion = true;
      }
    } else if (currentMilestone === 4) {
      if (milestoneStep === 1) {
        milestoneGuidance = "Goal: This is step 1 of 2. Guide player toward Ending. This interaction determines the final outcome.";
      } else {
        milestoneGuidance = "Goal: This is step 2 of 2. COMPLETE the Encounter milestone and lead to Ending. Final interaction determines outcome.";
        isMilestoneCompletion = true;
      }
    } else if (currentMilestone === 5) {
      if (milestoneStep === 1) {
        milestoneGuidance = "Goal: This is step 1 of 2. Guide player toward conclusion. Provide satisfying ending based on all previous choices.";
      } else {
        milestoneGuidance = "Goal: This is step 2 of 2. COMPLETE the Ending milestone. Provide final resolution and offer to restart.";
        isMilestoneCompletion = true;
        isFinalMilestone = true;
      }
    }

    // CRITICAL: If this is the final milestone completion, end the story
    if (isFinalMilestone && milestoneStep === 2) {
      const finalEndingMessage = `ADVENTURE COMPLETE!

Congratulations! You have successfully completed your journey through the mysterious island. 

Thank you for playing Stranded Island Adventure!`;

      return NextResponse.json({
        message: finalEndingMessage,
        success: true,
        currentMilestone: 5,
        nextMilestone: "COMPLETED",
        milestoneStep: 2,
        updatedStoryState: {
          ...updatedStoryState,
          currentMilestone: 5,
          milestoneStep: 2,
          lastAIMessage: finalEndingMessage
        }
      });
    }

    // Create comprehensive prompt for AI with STRONG emphasis on milestone completion
    const userPrompt = `STORY CONTEXT:
${previousChoicesContext}
${currentLocationContext}

CURRENT SITUATION:
The player has chosen: "${selectedChoice}"
Current milestone: ${STORY_MILESTONES[currentMilestone - 1]?.name} (Step ${milestoneStep} of 2)
Next milestone: ${nextMilestone?.name || "ENDING"}

${milestoneGuidance}

PREVIOUS AI NARRATION:
${storyState?.lastAIMessage || "No previous narration"}

CRITICAL INSTRUCTIONS (Do not display these in your response):
1. Your response must directly continue from the player's action: "${selectedChoice}"
2. DO NOT ignore what the player did/said - build your story around their specific action
3. Reference previous actions and events for continuity
4. Keep narration EXACTLY 100 words or less
5. Respond naturally to their action and set up the next situation via setting or dialogue or consequences
6. Each response must progress the story forward
7. ${isMilestoneCompletion ? 'MILESTONE MUST BE COMPLETED IN THIS RESPONSE' : 'Do not complete milestone yet - this is step 1'}
8. ${isFinalMilestone ? 'THIS IS THE FINAL MILESTONE - THE STORY MUST END' : 'Continue building toward next milestone'}

REMEMBER: The player's action was "${selectedChoice}" - your story MUST continue from that exact action, not from something else!
${isMilestoneCompletion ? 'CRITICAL: Complete the milestone now - this is step 2!' : 'CRITICAL: Do not complete milestone yet - this is step 1!'}
${isFinalMilestone ? 'CRITICAL: This is the final milestone - complete the story and provide ending options!' : ''}`;

    const response = await ollama.chat({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      stream: false
    });

    const aiMessage = response.message.content;

    // Determine next milestone step and completion - CRITICAL FIX
    let nextMilestoneStep = milestoneStep < 2 ? milestoneStep + 1 : 1;
    let nextCurrentMilestone = currentMilestone;

    // Advance milestone if we've completed 2 steps
    if (milestoneStep === 2 && currentMilestone < STORY_MILESTONES.length) {
      nextCurrentMilestone = currentMilestone + 1;
      nextMilestoneStep = 1; // Reset step counter for new milestone
      console.log(`🎯 MILESTONE ADVANCED: ${currentMilestone} → ${nextCurrentMilestone}`);
    }

    // CRITICAL: Check if game is completed
    if (nextCurrentMilestone > 5) {
      // Game is complete - provide final ending
      const finalEndingMessage = `ADVENTURE COMPLETE!

Congratulations! You have successfully completed your journey through the mysterious island. 

Thank you for playing Stranded Island Adventure!`;

      return NextResponse.json({
        message: finalEndingMessage,
        success: true,
        currentMilestone: 5,
        nextMilestone: "COMPLETED",
        milestoneStep: 2,
        updatedStoryState: {
          ...updatedStoryState,
          currentMilestone: 5,
          milestoneStep: 2,
          lastAIMessage: finalEndingMessage
        }
      });
    }

    // Update story state
    const finalStoryState: StoryState = {
      ...updatedStoryState,
      currentMilestone: nextCurrentMilestone,
      milestoneStep: nextMilestoneStep,
      lastAIMessage: aiMessage,
      previousChoices: updatedStoryState.choices
    };

    return NextResponse.json({
      message: aiMessage,
      success: true,
      currentMilestone: finalStoryState.currentMilestone,
      nextMilestone: STORY_MILESTONES[finalStoryState.currentMilestone - 1]?.name || "Ending",
      milestoneStep: finalStoryState.milestoneStep,
      updatedStoryState: finalStoryState
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);

    // Fallback response that maintains story progression
    const fallbackResponse = `You continue exploring the island, determined to find answers about what happened to you.

The tropical sun beats down as you search for any signs of human activity. Your survival instincts kick in as you look for food, water, and shelter.

What would you like to do next?

1. Search the beach for washed-up items and clues
2. Explore the jungle for food, water, and shelter  
3. Climb to higher ground to survey the island
4. Check the coral reef for resources and signs of life`;

    return NextResponse.json({
      message: fallbackResponse,
      success: false,
      error: error.message || "Unknown error occurred",
      currentMilestone: 1,
      nextMilestone: "Survival & Search",
      milestoneStep: 1,
      updatedStoryState: null
    }, { status: 500 });
  }
}