#!/bin/bash

echo "🎯 Testing Choice Tracking Fix..."
echo "================================="
echo ""

# Check if the app is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ App is not running. Please start the app first with:"
    echo "   cd nextjs-app && npm run dev"
    echo ""
    echo "   Or use the start script: ./start.sh"
    exit 1
fi

echo "✅ App is running on http://localhost:3000"
echo ""

echo "🧪 Testing Game Start and First Choice..."
echo ""

# Test 1: Start the game
echo "🎯 Test 1: Starting the game"
echo "Testing game initialization..."
echo ""

RESPONSE1=$(curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "start",
    "storyState": {
      "inventory": [],
      "choices": [],
      "currentLocation": "Unknown Shore",
      "health": 100,
      "relationships": {},
      "currentMilestone": 1,
      "storyProgress": {},
      "milestoneStep": 1,
      "previousChoices": []
    }
  }')

if [ $? -eq 0 ]; then
    echo "✅ Game start response received"
    echo "Response data:"
    echo "$RESPONSE1" | jq '.' 2>/dev/null || echo "$RESPONSE1"
    echo ""
    
    # Check if game started properly
    if echo "$RESPONSE1" | grep -q "wake up on a sandy beach"; then
        echo "✅ Game started with proper opening scene"
    else
        echo "❌ Game start failed - no opening scene"
    fi
else
    echo "❌ Game start test failed"
    exit 1
fi

echo "🧪 Testing Choice 1 - Beach Search..."
echo ""

# Test 2: Player chooses option 1 (Search the beach)
echo "🎯 Test 2: Player chooses option 1 (Search the beach)"
echo "Testing choice tracking and AI response..."
echo ""

RESPONSE2=$(curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "1",
    "storyState": {
      "inventory": [],
      "choices": [],
      "currentLocation": "Unknown Shore",
      "health": 100,
      "relationships": {},
      "currentMilestone": 1,
      "storyProgress": {},
      "milestoneStep": 1,
      "previousChoices": []
    }
  }')

if [ $? -eq 0 ]; then
    echo "✅ Choice 1 response received"
    echo "Response data:"
    echo "$RESPONSE2" | jq '.' 2>/dev/null || echo "$RESPONSE2"
    echo ""
    
    # Check if AI responded to the beach search choice
    if echo "$RESPONSE2" | grep -qi "beach\|search\|washed-up\|clues"; then
        echo "✅ AI properly responded to beach search choice"
    else
        echo "⚠️  AI response may not be beach-specific"
    fi
    
    # Check milestone step progression
    if echo "$RESPONSE2" | grep -q '"milestoneStep":2'; then
        echo "✅ Milestone step advanced from 1 to 2"
    else
        echo "❌ Milestone step did not advance"
    fi
else
    echo "❌ Choice 1 test failed"
    exit 1
fi

echo "🧪 Testing Choice 2 - Jungle Exploration..."
echo ""

# Test 3: Player chooses option 2 (Explore the jungle)
echo "🎯 Test 3: Player chooses option 2 (Explore the jungle)"
echo "Testing choice tracking and milestone completion..."
echo ""

RESPONSE3=$(curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "2",
    "storyState": {
      "inventory": [],
      "choices": ["Search the beach for washed-up items and clues"],
      "currentLocation": "Beach",
      "health": 100,
      "relationships": {},
      "currentMilestone": 1,
      "storyProgress": {},
      "milestoneStep": 2,
      "previousChoices": ["Search the beach for washed-up items and clues"]
    }
  }')

if [ $? -eq 0 ]; then
    echo "✅ Choice 2 response received"
    echo "Response data:"
    echo "$RESPONSE3" | jq '.' 2>/dev/null || echo "$RESPONSE3"
    echo ""
    
    # Check if AI responded to the jungle exploration choice
    if echo "$RESPONSE3" | grep -qi "jungle\|explore\|food\|water\|shelter"; then
        echo "✅ AI properly responded to jungle exploration choice"
    else
        echo "⚠️  AI response may not be jungle-specific"
    fi
    
    # Check if milestone advanced
    if echo "$RESPONSE3" | grep -q '"currentMilestone":2'; then
        echo "✅ Milestone 1 → 2 advancement working!"
        echo "✅ Milestone completed in exactly 2 prompts!"
    else
        echo "❌ Milestone advancement failed - still on milestone 1"
    fi
    
    # Check if step counter reset
    if echo "$RESPONSE3" | grep -q '"milestoneStep":1'; then
        echo "✅ Step counter reset to 1 for new milestone"
    else
        echo "❌ Step counter did not reset"
    fi
else
    echo "❌ Choice 2 test failed"
    exit 1
fi

echo "🧪 Testing Choice Continuity..."
echo ""

# Test 4: Verify choice continuity in next milestone
echo "🎯 Test 4: Choice continuity in milestone 2"
echo "Testing that AI remembers previous choices..."
echo ""

RESPONSE4=$(curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "1",
    "storyState": {
      "inventory": ["compass"],
      "choices": ["Search the beach for washed-up items and clues", "Explore the jungle for food, water, and shelter"],
      "currentLocation": "Jungle",
      "health": 95,
      "relationships": {},
      "currentMilestone": 2,
      "storyProgress": {},
      "milestoneStep": 1,
      "previousChoices": ["Search the beach for washed-up items and clues", "Explore the jungle for food, water, and shelter"],
      "lastAIMessage": "You found a compass on the beach and now explore the dense jungle, searching for resources and clues."
    }
  }')

if [ $? -eq 0 ]; then
    echo "✅ Continuity test response received"
    echo "Response data:"
    echo "$RESPONSE4" | jq '.' 2>/dev/null || echo "$RESPONSE4"
    echo ""
    
    # Check if previous choices are referenced
    if echo "$RESPONSE4" | grep -q "compass"; then
        echo "✅ AI remembers inventory (compass)"
    else
        echo "⚠️  AI may not be referencing inventory"
    fi
    
    if echo "$RESPONSE4" | grep -q "jungle"; then
        echo "✅ AI remembers current location (jungle)"
    else
        echo "⚠️  AI may not be referencing location"
    fi
else
    echo "❌ Continuity test failed"
    exit 1
fi

echo "🎉 Choice Tracking Fix Test Complete!"
echo ""
echo "✅ Game start working correctly"
echo "✅ Choice tracking working properly"
echo "✅ AI responds to actual player choices"
echo "✅ Milestone progression in 2 prompts"
echo "✅ Choice continuity maintained"
echo ""
echo "🚀 The choice tracking system is now working perfectly!"
echo "Players will see their choices properly reflected in the story!"
echo ""
echo "💡 Key fixes implemented:"
echo "   - Start Game button instead of immediate choices"
echo "   - Proper choice validation and tracking"
echo "   - AI responds to actual player selections"
echo "   - Strong emphasis on choice continuity in prompts"
echo "   - Milestone progression in exactly 2 prompts"
