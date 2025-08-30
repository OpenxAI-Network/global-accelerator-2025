import json
import uuid
import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import re
from .models import Conversation, Message, SentimentAnalysis, UserPreference, AIRecommendation
# Note: Using Google Maps API directly instead of Place model

@csrf_exempt
@require_http_methods(["POST"])
def chat_with_ai(request):
    """Main AI chat endpoint"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            session_id = data.get('session_id', '')
            user_lat = data.get('lat')  # User's latitude
            user_lng = data.get('lng')  # User's longitude
            
            if not user_message or not session_id:
                return JsonResponse({'error': 'Missing message or session_id'}, status=400)
            
            # Get or create conversation
            conversation, created = Conversation.objects.get_or_create(
                session_id=session_id
            )
            
            # Save user message
            user_msg = Message.objects.create(
                conversation=conversation,
                role='user',
                content=user_message
            )
            
            # Analyze sentiment and extract preferences
            sentiment_result = analyze_sentiment_with_ollama(user_message)
            sentiment = sentiment_result.get('sentiment', 'neutral')
            preferences = sentiment_result.get('preferences', [])
            
            # Save sentiment analysis
            SentimentAnalysis.objects.create(
                message=user_msg,
                sentiment=sentiment,
                confidence=sentiment_result.get('confidence', 0.8),
                extracted_preferences=json.dumps(preferences)
            )
            
            # Save user preferences
            save_user_preferences(session_id, preferences, sentiment_result.get('confidence', 0.8))
            
            # Get AI-enhanced café recommendations
            try:
                # First try to extract location from user message
                message_location = extract_location_from_message(user_message)
                
                # Determine search coordinates
                if message_location:
                    # User asked for a specific location - use that
                    search_lat, search_lng = message_location
                    print(f"Searching near user-requested location: {message_location}")
                elif user_lat and user_lng:
                    # User provided coordinates
                    search_lat, search_lng = user_lat, user_lng
                    print(f"Using user-provided coordinates: {search_lat}, {search_lng}")
                else:
                    # No location specified, use Darling Harbour as default
                    search_lat, search_lng = -33.8715, 151.2006
                    print(f"Using default location (Darling Harbour): {search_lat}, {search_lng}")
                
                # Search for places using the determined coordinates
                places_response = requests.get(f'http://localhost:8000/api/places/?lat={search_lat}&lng={search_lng}&sentiment={sentiment}', timeout=10)
                
                if places_response.status_code == 200:
                    places = places_response.json()
                    
                    # Always create enhanced recommendations with AI insights
                    cafe_recommendations = []
                    for i, place in enumerate(places[:3]):
                        # Generate personalized AI insights based on sentiment and place data
                        if sentiment == 'stressed':
                            mood_match = f"This café offers a peaceful, calming atmosphere perfect for when you're feeling {sentiment}. The quiet environment will help you relax and unwind."
                            best_for = "Stress relief, relaxation, peaceful dining, quiet contemplation"
                            key_features = "Tranquil atmosphere, comfortable seating, soothing environment"
                        elif sentiment == 'excited':
                            mood_match = f"This vibrant café matches your {sentiment} energy perfectly! The lively atmosphere will keep your spirits high."
                            best_for = "Celebrations, social gatherings, energetic dining, fun experiences"
                            key_features = "Vibrant atmosphere, social environment, exciting menu options"
                        elif sentiment == 'focused':
                            mood_match = f"This café provides the perfect environment for your {sentiment} mindset. The quiet atmosphere supports concentration and focus."
                            best_for = "Study sessions, work meetings, focused dining, concentration"
                            key_features = "Quiet atmosphere, good lighting, comfortable work spaces"
                        else:
                            mood_match = f"This café is ideal for your {sentiment} mood! The atmosphere perfectly complements your current state of mind."
                            best_for = "Quality dining, authentic matcha experience, comfortable atmosphere"
                            key_features = "High rating, good location, authentic atmosphere"
                        
                        # Generate specific reason based on place characteristics
                        place_name = place.get('name', '').lower()
                        rating = place.get('rating', 0)
                        distance = place.get('distance', 0)
                        
                        if 'matcha' in place_name:
                            matcha_reason = "This café specializes in authentic matcha, offering you the genuine Japanese tea experience you're looking for."
                        elif rating >= 4.5:
                            matcha_reason = f"With an excellent {rating}-star rating, this café consistently delivers outstanding quality and service."
                        else:
                            matcha_reason = f"This café offers a solid {rating}-star experience with good value for your money."
                        
                        # Distance benefit
                        if distance <= 1.0:
                            distance_benefit = f"Located just {distance} km away, this café is extremely convenient for your current location."
                        elif distance <= 2.0:
                            distance_benefit = f"At {distance} km away, this café is easily accessible and worth the short trip."
                        else:
                            distance_benefit = f"While {distance} km away, this café's exceptional quality makes it worth the journey."
                        
                        # Why this ranks higher
                        if i == 0:
                            why_better = f"This café ranks #1 because it perfectly balances your {sentiment} mood, location convenience, and quality expectations."
                        elif i == 1:
                            why_better = f"This café ranks #2 as an excellent alternative that closely matches your needs and preferences."
                        else:
                            why_better = f"This café ranks #3 as a solid option that meets your basic requirements and offers good value."
                        
                        # Combine everything into a comprehensive explanation
                        reason = f"{matcha_reason} {mood_match} The combination of quality, atmosphere, and convenience makes this an ideal choice for your current needs."
                        
                        cafe_recommendations.append({
                            'id': place.get('id'),
                            'place_id': place.get('place_id'),
                            'name': place.get('name'),
                            'address': place.get('vicinity'),
                            'rating': place.get('rating'),
                            'price_level': place.get('price_range'),
                            'distance': place.get('distance'),
                            'photos': place.get('photos', []),
                            'ai_insight': {
                                'rank': i + 1,
                                'reason': reason,
                                'mood_match': mood_match,
                                'best_for': best_for,
                                'key_features': key_features,
                                'why_better_than_others': why_better,
                                'budget_explanation': "This café provides excellent value for the quality and experience offered.",
                                'distance_benefit': distance_benefit
                            }
                        })
                else:
                    # Fallback to regular recommendations
                    cafe_recommendations = get_cafe_recommendations(user_message, sentiment, preferences, user_lat, user_lng)
            except Exception as e:
                # Fallback to regular recommendations
                cafe_recommendations = get_cafe_recommendations(user_message, sentiment, preferences, user_lat, user_lng)
            
            # Generate AI response
            ai_message = generate_ai_response(user_message, sentiment, preferences, session_id)
            
            # Save AI message
            ai_msg = Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=ai_message
            )
            
            # Save recommendations
            for cafe in cafe_recommendations:
                AIRecommendation.objects.create(
                    conversation=conversation,
                    place_id=cafe['id'],
                    place_name=cafe['name'],
                    recommendation_reason=f"Matches your {sentiment} mood and preferences",
                    sentiment_context=sentiment
                )
            
            return JsonResponse({
                'message': ai_message,
                'recommendations': cafe_recommendations,
                'sentiment': sentiment,
                'session_id': session_id
            })
            
        except Exception as e:
            print(f"Error in chat_with_ai: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def analyze_sentiment_with_ollama(text):
    """Use Ollama to analyze sentiment and extract preferences"""
    try:
        # Prompt for sentiment analysis and preference extraction
        prompt = f"""
        Analyze this café search request: "{text}"
        
        Respond with ONLY a JSON object in this exact format:
        {{
            "sentiment": "one_word_mood",
            "confidence": 0.85,
            "preferences": {{
                "budget": "low/medium/high",
                "vibe": "cozy/trendy/quiet/social/study",
                "location": "nearby/anywhere/specific_area",
                "special_needs": "wifi/outdoor_seating/quiet/accessible"
            }}
        }}
        
        Sentiment options: happy, excited, calm, stressed, sad, angry, neutral, social, focused
        """
        
        # Call Ollama API
        response = requests.post('http://localhost:11434/api/generate', {
            'model': 'llama2',
            'prompt': prompt,
            'stream': False,
        })
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get('response', '')
            
            # Try to parse JSON from response
            try:
                # Extract JSON from the response
                json_start = ai_response.find('{')
                json_end = ai_response.rfind('}') + 1
                if json_start != -1 and json_end != 0:
                    parsed_data = json.loads(ai_response[json_start:json_end])
                    return {
                        'sentiment': parsed_data.get('sentiment', 'neutral'),
                        'confidence': parsed_data.get('confidence', 0.5),
                        'preferences': parsed_data.get('preferences', {})
                    }
            except json.JSONDecodeError:
                pass
            
            # Fallback: keyword-based sentiment analysis
            return fallback_sentiment_analysis(text)
        else:
            return fallback_sentiment_analysis(text)
            
    except Exception as e:
        print(f"Ollama error: {e}")
        return fallback_sentiment_analysis(text)

def fallback_sentiment_analysis(text):
    """Fallback sentiment analysis when Ollama fails"""
    text_lower = text.lower()
    
    # Simple keyword-based sentiment analysis
    happy_words = ['happy', 'excited', 'great', 'awesome', 'love', 'enjoy']
    stressed_words = ['stressed', 'busy', 'work', 'study', 'quiet', 'peaceful']
    social_words = ['friends', 'meet', 'social', 'fun', 'party', 'group']
    focused_words = ['study', 'work', 'focus', 'quiet', 'concentration']
    
    if any(word in text_lower for word in happy_words):
        sentiment = 'happy'
    elif any(word in text_lower for word in stressed_words):
        sentiment = 'stressed'
    elif any(word in text_lower for word in social_words):
        sentiment = 'social'
    elif any(word in text_lower for word in focused_words):
        sentiment = 'focused'
    else:
        sentiment = 'neutral'
    
    # Extract basic preferences
    preferences = {
        'budget': 'medium',
        'vibe': 'neutral',
        'location': 'anywhere',
        'special_needs': 'none'
    }
    
    if any(word in text_lower for word in ['cheap', 'affordable', 'budget']):
        preferences['budget'] = 'low'
    elif any(word in text_lower for word in ['expensive', 'luxury', 'premium']):
        preferences['budget'] = 'high'
    
    if any(word in text_lower for word in ['cozy', 'quiet', 'peaceful']):
        preferences['vibe'] = 'quiet'
    elif any(word in text_lower for word in ['trendy', 'vibrant', 'lively']):
        preferences['vibe'] = 'trendy'
    
    return {
        'sentiment': sentiment,
        'confidence': 0.6,
        'preferences': preferences
    }

def generate_ai_response(user_message, sentiment, preferences, session_id):
    """Generate AI response with real café recommendations"""
    try:
        # Call Ollama for conversational response
        ollama_url = "http://localhost:11434/api/generate"
        prompt = f"""
        You are a friendly AI matcha guide. A user said: "{user_message}"
        Their mood is: {sentiment}
        Their preferences: {preferences}
        
        Respond in a friendly, helpful way and suggest what kind of café experience would be perfect for them.
        Keep it conversational and warm.
        """
        
        payload = {
            "model": "llama3.2:1b",
            "prompt": prompt,
            "stream": False
        }
        
        response = requests.post(ollama_url, json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            ai_message = result.get('response', '').strip()
        else:
            ai_message = generate_fallback_response(sentiment, preferences)
            
    except Exception as e:
        print(f"Ollama error: {e}")
        ai_message = generate_fallback_response(sentiment, preferences)
    
    return ai_message

def generate_fallback_response(sentiment, preferences):
    """Generate fallback response when Ollama fails"""
    mood_responses = {
        'happy': "I can see you're in a great mood! Let me find you a vibrant, exciting matcha spot that matches your energy.",
        'excited': "Your enthusiasm is contagious! I'll look for a lively, fun café that can keep up with your excitement.",
        'calm': "I understand you're looking for a peaceful experience. Let me find you a serene, calming matcha café.",
        'stressed': "I can sense you need a peaceful place right now. Let me find you a quiet, relaxing café where you can unwind.",
        'social': "Perfect! You're looking for a great place to meet friends. I'll find you a social, welcoming café with great atmosphere.",
        'focused': "I see you need a place to concentrate. Let me find you a quiet, focused environment perfect for work or study.",
        'neutral': "I'd love to help you find the perfect matcha café! Let me search for some great options that might interest you."
    }
    
    return mood_responses.get(sentiment, mood_responses['neutral'])

def save_user_preferences(session_id, preferences, confidence):
    """Save extracted user preferences to database"""
    try:
        for pref_type, pref_value in preferences.items():
            if pref_value and pref_value != 'none':
                UserPreference.objects.update_or_create(
                    session_id=session_id,
                    preference_type=pref_type,
                    defaults={
                        'preference_value': pref_value,
                        'confidence': confidence,
                        'extracted_at': timezone.now()
                    }
                )
    except Exception as e:
        print(f"Error saving preferences: {e}")

def get_cafe_recommendations(user_message, sentiment, preferences, user_lat=None, user_lng=None):
    """Get real café recommendations from Google Maps - bulletproof version"""
    try:
        # Use user's location if provided, otherwise default to Darling Harbour Sydney
        if user_lat and user_lng:
            lat, lng = user_lat, user_lng
        else:
            # Default location (Darling Harbour Sydney)
            lat, lng = -33.8715, 151.2006
        
        # Get places from your existing API
        import requests
        
        try:
            response = requests.get(f'http://localhost:8000/api/places/?lat={lat}&lng={lng}', timeout=10)
            
            if response.status_code == 200:
                places = response.json()
            else:
                return []
        except Exception as e:
            return []
        
        if not places or not isinstance(places, list):
            print(f"DEBUG: Places is not a valid list: {type(places)}")
            return []
        
        # Take first 3 places without complex sorting
        top_places = places[:3] if len(places) >= 3 else places
        
        # Format recommendations with minimal processing
        recommendations = []
        for place in top_places:
            try:
                # Get basic info with safe defaults
                place_id = place.get('id', 'unknown')
                place_name = place.get('name', 'Unknown Café')
                place_address = place.get('vicinity', 'Address not available')
                place_rating = place.get('rating', 0)
                place_price = place.get('price_level', 2)
                # Convert distance from miles to kilometers and round to 1 decimal place
                place_distance_miles = place.get('distance', 0)
                place_distance_km = round(place_distance_miles * 1.60934, 1)  # Convert miles to km
                
                # Simple price formatting
                if place_price == 1:
                    price_display = '$'
                elif place_price == 2:
                    price_display = '$$'
                elif place_price == 3:
                    price_display = '$$$'
                elif place_price == 4:
                    price_display = '$$$$'
                else:
                    price_display = '$$'
                
                # Get photos from the place data - they're already URLs
                photos = place.get('photos', [])
                photo_urls = []
                
                # Photos are already URLs, just use them directly
                if photos and isinstance(photos, list):
                    photo_urls = photos[:3]  # Limit to first 3 photos
                
                # Create recommendation
                recommendation = {
                    'id': place_id,
                    'place_id': place_id,  # Add place_id for Google Maps integration
                    'name': place_name,
                    'address': place_address,
                    'rating': place_rating,
                    'price_level': price_display,
                    'match_reason': f"Great matcha café in Sydney - perfect for your {sentiment} mood",
                    'distance': place_distance_km,  # Now in kilometers
                    'photos': photo_urls,  # Include actual photos
                    'lat': place.get('geometry', {}).get('location', {}).get('lat'),
                    'lng': place.get('geometry', {}).get('location', {}).get('lng')
                }
                
                recommendations.append(recommendation)
                
            except Exception as e:
                continue
        
        return recommendations
        
    except Exception as e:
        print(f"Error in get_cafe_recommendations: {e}")
        import traceback
        traceback.print_exc()
        return []

def get_ai_enhanced_recommendations(user_message, sentiment, preferences, places, user_lat, user_lng):
    """Use AI to intelligently rank and explain café recommendations"""
    try:
        if not places or len(places) == 0:
            return []
        
        # Prepare places data for AI analysis
        places_summary = []
        for place in places[:10]:  # Analyze top 10 places
            places_summary.append({
                'name': place.get('name', 'Unknown'),
                'rating': place.get('rating', 0),
                'price_level': place.get('price_range', 'Unknown'),
                'address': place.get('vicinity', 'Unknown'),
                'distance': place.get('distance', 0),
                'types': place.get('types', []),
                'photos': len(place.get('photos', []))
            })
        
        # Create AI prompt for intelligent ranking
        prompt = f"""
        As an expert matcha café consultant, analyze these cafés for a user who said: "{user_message}"
        
        User's mood: {sentiment}
        User's preferences: {preferences}
        
        Cafés to analyze:
        {places_summary}
        
        Rank the top 3 cafés that would be PERFECT for this user. For each recommendation, provide detailed reasoning.
        
        Consider these factors and explain how each café matches:
        1. **Mood Match**: How does this café's atmosphere match the user's current mood?
        2. **Time Appropriateness**: Is this café suitable for the current time/occasion?
        3. **Budget Alignment**: How does the price level match their budget preferences?
        4. **Atmosphere Match**: Does the vibe/ambiance align with what they're looking for?
        5. **Distance Convenience**: Is the location practical for their needs?
        6. **Matcha Authenticity**: How authentic is the matcha experience?
        7. **Special Features**: What unique aspects make this café stand out?
        
        Return ONLY a JSON array with the top 3 cafés in this exact format:
        [
            {{
                "rank": 1,
                "cafe_name": "exact name from list",
                "reason": "Detailed explanation of why this café is perfect for this specific user, considering their mood, preferences, and needs. Explain the specific factors that make it an ideal choice.",
                "mood_match": "Specific explanation of how this café's atmosphere matches their current mood and why this is beneficial",
                "best_for": "What specific occasion, need, or experience this café is best suited for",
                "key_features": "2-3 key features that make this café special for this user",
                "why_better_than_others": "Brief explanation of why this café ranks higher than alternatives"
            }}
        ]
        
        Make your explanations specific, helpful, and educational. Help the user understand exactly why each café is recommended for them.
        """
        
        # Call Ollama for intelligent ranking
        response = requests.post('http://localhost:11434/api/generate', {
            'model': 'llama2:latest',
            'prompt': prompt,
            'stream': False
        }, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get('response', '')
            
            # Always return enhanced recommendations with AI insights
            enhanced_recommendations = []
            for i, place in enumerate(places[:3]):
                # Generate personalized AI insights based on sentiment and place data
                if sentiment == 'stressed':
                    mood_match = f"This café offers a peaceful, calming atmosphere perfect for when you're feeling {sentiment}. The quiet environment will help you relax and unwind."
                    best_for = "Stress relief, relaxation, peaceful dining, quiet contemplation"
                    key_features = "Tranquil atmosphere, comfortable seating, soothing environment"
                elif sentiment == 'excited':
                    mood_match = f"This vibrant café matches your {sentiment} energy perfectly! The lively atmosphere will keep your spirits high."
                    best_for = "Celebrations, social gatherings, energetic dining, fun experiences"
                    key_features = "Vibrant atmosphere, social environment, exciting menu options"
                elif sentiment == 'focused':
                    mood_match = f"This café provides the perfect environment for your {sentiment} mindset. The quiet atmosphere supports concentration and focus."
                    best_for = "Study sessions, work meetings, focused dining, concentration"
                    key_features = "Quiet atmosphere, good lighting, comfortable work spaces"
                else:
                    mood_match = f"This café is ideal for your {sentiment} mood! The atmosphere perfectly complements your current state of mind."
                    best_for = "Quality dining, authentic matcha experience, comfortable atmosphere"
                    key_features = "High rating, good location, authentic atmosphere"
                
                # Generate specific reason based on place characteristics
                place_name = place.get('name', '').lower()
                rating = place.get('rating', 0)
                distance = place.get('distance', 0)
                
                if 'matcha' in place_name:
                    matcha_reason = "This café specializes in authentic matcha, offering you the genuine Japanese tea experience you're looking for."
                elif rating >= 4.5:
                    matcha_reason = f"With an excellent {rating}-star rating, this café consistently delivers outstanding quality and service."
                else:
                    matcha_reason = f"This café offers a solid {rating}-star experience with good value for your money."
                
                # Distance benefit
                if distance <= 1.0:
                    distance_benefit = f"Located just {distance} km away, this café is extremely convenient for your current location."
                elif distance <= 2.0:
                    distance_benefit = f"At {distance} km away, this café is easily accessible and worth the short trip."
                else:
                    distance_benefit = f"While {distance} km away, this café's exceptional quality makes it worth the journey."
                
                # Why this ranks higher
                if i == 0:
                    why_better = f"This café ranks #1 because it perfectly balances your {sentiment} mood, location convenience, and quality expectations."
                elif i == 1:
                    why_better = f"This café ranks #2 as an excellent alternative that closely matches your needs and preferences."
                else:
                    why_better = f"This café ranks #3 as a solid option that meets your basic requirements and offers good value."
                
                # Combine everything into a comprehensive explanation
                reason = f"{matcha_reason} {mood_match} The combination of quality, atmosphere, and convenience makes this an ideal choice for your current needs."
                
                enhanced_recommendations.append({
                    'id': place.get('id'),
                    'place_id': place.get('place_id'),
                    'name': place.get('name'),
                    'address': place.get('vicinity'),
                    'rating': place.get('rating'),
                    'price_level': place.get('price_range'),
                    'distance': place.get('distance'),
                    'photos': place.get('photos', []),
                    'ai_insight': {
                        'rank': i + 1,
                        'reason': reason,
                        'mood_match': mood_match,
                        'best_for': best_for,
                        'key_features': key_features,
                        'why_better_than_others': why_better,
                        'budget_explanation': "This café provides excellent value for the quality and experience offered.",
                        'distance_benefit': distance_benefit
                    }
                })
            
            return enhanced_recommendations
        
        # Fallback: return regular recommendations if AI fails
        return get_cafe_recommendations(user_message, sentiment, preferences, user_lat, user_lng)
        
    except Exception as e:
        print(f"AI enhancement error: {e}")
        # Fallback to regular recommendations
        return get_cafe_recommendations(user_message, sentiment, preferences, user_lat, user_lng)

def calculate_match_score(place, sentiment, preferences, user_message):
    """Calculate how well a place matches user sentiment and preferences"""
    score = 50  # Base score
    
    # Rating boost
    rating = place.get('rating', 0)
    if rating >= 4.5:
        score += 20
    elif rating >= 4.0:
        score += 10
    elif rating < 3.5:
        score -= 10
    
    # Sentiment matching
    place_name = place.get('name', '').lower()
    place_types = place.get('types', [])
    
    if sentiment == 'stressed' or sentiment == 'tired':
        if any(word in place_name for word in ['zen', 'quiet', 'peaceful', 'calm']):
            score += 15
        if 'park' in place_types:
            score += 10
    elif sentiment == 'excited' or sentiment == 'happy':
        if any(word in place_name for word in ['social', 'bar', 'rooftop', 'trendy']):
            score += 15
    
    # User message context
    if 'study' in user_message.lower():
        if any(word in place_name for word in ['library', 'quiet', 'study', 'work']):
            score += 20
    elif 'friends' in user_message.lower() or 'meeting' in user_message.lower():
        if any(word in place_name for word in ['social', 'lounge', 'bar']):
            score += 15
    
    # Price preferences
    price_level = place.get('price_level', 2)
    if 'affordable' in str(preferences).lower() or 'budget' in str(preferences).lower():
        if price_level <= 2:
            score += 10
        else:
            score -= 5
    elif 'premium' in str(preferences).lower() or 'luxury' in str(preferences).lower():
        if price_level >= 3:
            score += 10
    
    return max(0, min(100, score))

def get_price_display(price_level):
    """Convert price level to display format"""
    if price_level == 1:
        return '$'
    elif price_level == 2:
        return '$$'
    elif price_level == 3:
        return '$$$'
    elif price_level == 4:
        return '$$$$'
    return '$$'

def get_match_reason(sentiment, preferences, score):
    """Generate a reason why this place matches the user"""
    reasons = []
    
    if score >= 80:
        reasons.append("Perfect match for your mood")
    elif score >= 60:
        reasons.append("Great fit for what you're looking for")
    else:
        reasons.append("Good option to consider")
    
    if sentiment == 'stressed':
        reasons.append("peaceful atmosphere for relaxation")
    elif sentiment == 'excited':
        reasons.append("vibrant energy to match your mood")
    elif sentiment == 'happy':
        reasons.append("perfect spot to enjoy your good vibes")
    
    return " - ".join(reasons)

@require_http_methods(["GET"])
def get_conversation_history(request, session_id):
    """Get conversation history for a session"""
    try:
        conversation = Conversation.objects.get(session_id=session_id)
        messages = conversation.messages.all()
        
        history = []
        for msg in messages:
            history.append({
                'role': msg.role,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'sentiment': getattr(msg.sentiment, 'sentiment', None) if msg.role == 'user' else None
            })
        
        return JsonResponse({'conversation': history})
        
    except Conversation.DoesNotExist:
        return JsonResponse({'conversation': []})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_user_preferences(request, session_id):
    """Get extracted user preferences for a session"""
    try:
        preferences = UserPreference.objects.filter(session_id=session_id)
        
        pref_data = {}
        for pref in preferences:
            pref_data[pref.preference_type] = {
                'value': pref.preference_value,
                'confidence': pref.confidence
            }
        
        return JsonResponse({'preferences': pref_data})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def test_ollama_connection():
    """Test if Ollama is working properly"""
    try:
        response = requests.post('http://localhost:11434/api/generate', {
            'model': 'llama2:latest',
            'prompt': 'Say "Hello, Ollama is working!"',
            'stream': False
        }, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"DEBUG: Ollama test successful: {result.get('response', '')[:100]}")
            return True
        else:
            print(f"DEBUG: Ollama test failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"DEBUG: Ollama test error: {e}")
        return False

def test_ai_enhancement(request):
    """Test endpoint to debug AI enhancement"""
    try:
        # Test data
        test_message = "I need a quiet place to study, feeling stressed"
        test_sentiment = "stressed"
        test_preferences = {"budget": "medium", "vibe": "quiet", "special_needs": ["wifi"]}
        test_lat, test_lng = 37.7749, -122.4194
        
        print("=== AI ENHANCEMENT TEST ===")
        
        # Test 1: Ollama connection
        print("1. Testing Ollama connection...")
        ollama_working = test_ollama_connection()
        print(f"   Ollama working: {ollama_working}")
        
        # Test 2: Get places from API
        print("2. Getting places from API...")
        places_response = requests.get(f'http://localhost:8000/api/places/?lat={test_lat}&lng={test_lng}&sentiment={test_sentiment}', timeout=10)
        print(f"   API status: {places_response.status_code}")
        
        if places_response.status_code == 200:
            places = places_response.json()
            print(f"   Got {len(places)} places")
            print(f"   First place: {places[0].get('name') if places else 'None'}")
            
            # Test 3: AI enhancement
            print("3. Testing AI enhancement...")
            enhanced = get_ai_enhanced_recommendations(test_message, test_sentiment, test_preferences, places, test_lat, test_lng)
            print(f"   Enhanced recommendations: {len(enhanced)}")
            
            if enhanced and len(enhanced) > 0:
                first_rec = enhanced[0]
                print(f"   First recommendation: {first_rec.get('name')}")
                print(f"   Has AI insight: {'ai_insight' in first_rec}")
                if 'ai_insight' in first_rec:
                    print(f"   AI insight: {first_rec['ai_insight']}")
            else:
                print("   No enhanced recommendations returned")
        else:
            print(f"   API failed: {places_response.text[:200]}")
        
        return JsonResponse({
            'status': 'test_completed',
            'ollama_working': ollama_working,
            'places_count': len(places) if places_response.status_code == 200 else 0,
            'enhanced_count': len(enhanced) if 'enhanced' in locals() else 0
        })
        
    except Exception as e:
        print(f"Test error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

def generate_placeholder_image(request, width, height):
    """Generate a simple placeholder image with specified dimensions"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        import io
        
        # Create a new image with the specified dimensions
        img = Image.new('RGB', (int(width), int(height)), color='#f0f0f0')
        draw = ImageDraw.Draw(img)
        
        # Try to use a default font, fallback to basic if not available
        try:
            # Try multiple font paths for different systems
            font_paths = [
                "/System/Library/Fonts/Arial.ttf",  # macOS
                "/System/Library/Fonts/Helvetica.ttc",  # macOS alternative
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux
                "C:/Windows/Fonts/arial.ttf",  # Windows
            ]
            
            font = None
            for font_path in font_paths:
                try:
                    font = ImageFont.truetype(font_path, min(20, int(min(width, height) / 10)))
                    break
                except:
                    continue
            
            if font is None:
                font = ImageFont.load_default()
                
        except Exception as e:
            print(f"Font loading error: {e}")
            font = ImageFont.load_default()
        
        # Add text to the image
        text = f"{width}x{height}"
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        # Center the text
        x = (int(width) - text_width) // 2
        y = (int(height) - text_height) // 2
        
        # Draw text with a dark color
        draw.text((x, y), text, fill='#666666', font=font)
        
        # Convert to bytes
        img_io = io.BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)
        
        from django.http import HttpResponse
        response = HttpResponse(img_io.getvalue(), content_type='image/png')
        response['Cache-Control'] = 'public, max-age=31536000'  # Cache for 1 year
        return response
        
    except Exception as e:
        print(f"Error generating placeholder image: {e}")
        # Return a simple 1x1 pixel image as fallback
        from django.http import HttpResponse
        response = HttpResponse(
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf6\x178U\x00\x00\x00\x00IEND\xaeB`\x82',
            content_type='image/png'
        )
        return response

def extract_location_from_message(message):
    """Extract location names from user messages and convert to coordinates"""
    import re
    
    # Common Sydney suburbs and areas
    sydney_locations = {
        'darling harbour': (-33.8715, 151.2006),
        'surry hills': (-33.8847, 151.2087),
        'haymarket': (-33.8847, 151.2087),
        'newtown': (-33.8983, 151.1783),
        'glebe': (-33.8847, 151.1883),
        'ultimo': (-33.8847, 151.1983),
        'pyrmont': (-33.8715, 151.1883),
        'balmain': (-33.8583, 151.1783),
        'bondi': (-33.8914, 151.2766),
        'manly': (-33.7969, 151.2857),
        'circular quay': (-33.8583, 151.2087),
        'the rocks': (-33.8583, 151.2087),
        'woolloomooloo': (-33.8715, 151.2183),
        'potts point': (-33.8715, 151.2283),
        'darlinghurst': (-33.8847, 151.2183),
        'paddington': (-33.8847, 151.2283),
        'bondi junction': (-33.8914, 151.2666),
        'randwick': (-33.9167, 151.2500),
        'coogee': (-33.9167, 151.2666),
        'maroubra': (-33.9500, 151.2333)
    }
    
    message_lower = message.lower()
    
    # Look for location keywords
    for location, coords in sydney_locations.items():
        if location in message_lower:
            return coords
    
    # Look for "near [location]" or "close to [location]" patterns
    near_pattern = r'near\s+([a-zA-Z\s]+)'
    close_pattern = r'close\s+to\s+([a-zA-Z\s]+)'
    
    near_match = re.search(near_pattern, message_lower)
    if near_match:
        location_name = near_match.group(1).strip()
        for location, coords in sydney_locations.items():
            if location_name in location or location in location_name:
                return coords
    
    close_match = re.search(close_pattern, message_lower)
    if close_match:
        location_name = close_match.group(1).strip()
        for location, coords in sydney_locations.items():
            if location_name in location or location in location_name:
                return coords
    
    return None
