# import os, googlemaps
# from rest_framework.decorators import api_view
# from rest_framework.response import Response

# @api_view(["GET"])
# def matcha_places(request):
#     try:
#         lat = float(request.GET.get("lat", "-33.8688"))
#         lng = float(request.GET.get("lng", "151.2093"))
#     except ValueError:
#         lat, lng = -33.8688, 151.2093
#     radius = int(request.GET.get("radius", "3000"))

#     api_key = os.getenv("GOOGLE_MAPS_API_KEY")
#     if not api_key:
#         return Response([
#             {"id":1,"name":"Matcha House","address":"123 Tea St","rating":4.5,"price_level":2,"open_now":True},
#             {"id":2,"name":"Green Leaf Matcha","address":"456 Leaf Ave","rating":4.7,"price_level":3,"open_now":False},
#         ])

#     gmaps = googlemaps.Client(key=api_key)
#     res = gmaps.places_nearby(location=(lat, lng), radius=radius, keyword="matcha")
#     out = []
#     for i, p in enumerate(res.get("results", []), start=1):
#         out.append({
#             "id": i,
#             "name": p.get("name"),
#             "address": p.get("vicinity"),
#             "rating": p.get("rating"),
#             "price_level": p.get("price_level"),
#             "open_now": (p.get("opening_hours") or {}).get("open_now"),
#             "place_id": p.get("place_id"),
#         })
#     return Response(out)
# views.py
from django.http import JsonResponse
from django.views import View
import googlemaps
from django.conf import settings
import json

class PlacesView(View):
    def get(self, request):
        # Get user location from query parameters
        user_lat = request.GET.get('lat')
        user_lng = request.GET.get('lng')
        
        # Default to Sydney if no location provided
        if not user_lat or not user_lng:
            user_lat, user_lng = -33.8688, 151.2093
        else:
            user_lat, user_lng = float(user_lat), float(user_lng)
        
        # Check if we have a valid API key
        api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
        
        if not api_key or api_key == 'demo-key':
            # Return mock data when no API key is available
            return self.get_mock_places(user_lat, user_lng)
        
        # Initialize Google Maps client
        try:
            gmaps = googlemaps.Client(key=api_key)
        except Exception as e:
            print(f"Error initializing Google Maps client: {e}")
            return self.get_mock_places(user_lat, user_lng)
        
        try:
            # Search for matcha cafes near user location
            places_result = gmaps.places_nearby(
                location=(user_lat, user_lng),
                radius=5000,  # 5km radius
                keyword='matcha cafe tea',
                type='cafe'
            )
            
            processed_places = []
            
            for place in places_result.get('results', []):
                # Extract location data
                geometry = place.get('geometry', {})
                location = geometry.get('location', {})
                
                if not location.get('lat') or not location.get('lng'):
                    continue  # Skip places without coordinates
                
                # Get current time for time-based scoring
                from datetime import datetime
                current_hour = datetime.now().hour
                
                # Create user context for advanced scoring
                user_context = {
                    'hour': current_hour,
                    'sentiment': request.GET.get('sentiment', 'neutral'),
                    'preferences': {
                        'budget': request.GET.get('budget', 'medium'),
                        'vibe': request.GET.get('vibe', 'any'),
                        'special_needs': request.GET.get('special_needs', '').split(',') if request.GET.get('special_needs') else []
                    },
                    'special_occasion': request.GET.get('special_occasion', 'none'),
                    'weather': request.GET.get('weather', 'sunny')
                }
                
                # Calculate advanced match score
                match_score = self.calculate_match_score(place, user_lat, user_lng, user_context)
                
                # Calculate distance
                distance = self.calculate_distance(
                    user_lat, user_lng, 
                    location['lat'], location['lng']
                )
                
                # Format price range
                price_range = self.format_price_range(place.get('price_level'))
                
                processed_place = {
                    'id': place.get('place_id', ''),
                    'place_id': place.get('place_id', ''),  # Keep original place_id for Google Maps
                    'name': place.get('name', 'Unknown Place'),
                    'rating': place.get('rating', 0),
                    'price_level': place.get('price_level'),
                    'vicinity': place.get('vicinity', ''),
                    'lat': location['lat'],  # Required by frontend
                    'lng': location['lng'],  # Required by frontend
                    'match_score': match_score,  # Required by frontend
                    'distance': distance,
                    'price_range': price_range,
                    'photos': self.get_photo_urls(place.get('photos', []))
                }
                
                processed_places.append(processed_place)
            
            # Sort by match score (highest first)
            processed_places.sort(key=lambda x: x['match_score'], reverse=True)
            
            return JsonResponse(processed_places, safe=False)
            
        except Exception as e:
            print(f"Error fetching places from Google Maps: {e}")
            # Fallback to mock data
            return self.get_mock_places(user_lat, user_lng)
    
    def get_mock_places(self, user_lat, user_lng):
        """Return mock data when Google Maps API is not available"""
        mock_places = [
            {
                'id': 'mock-1',
                'place_id': 'mock-1',
                'name': 'Zen Matcha House',
                'rating': 4.8,
                'price_level': 2,
                'vicinity': '123 Green St, Sydney NSW',
                'lat': user_lat + 0.001,  # Slightly offset from user location
                'lng': user_lng + 0.001,
                'match_score': 95,
                'distance': 0.3,
                'price_range': '$$',
                'photos': []
            },
            {
                'id': 'mock-2',
                'place_id': 'mock-2',
                'name': 'Emerald Tea Lounge',
                'rating': 4.6,
                'price_level': 3,
                'vicinity': '456 Matcha Ave, Sydney NSW',
                'lat': user_lat - 0.001,
                'lng': user_lng - 0.001,
                'match_score': 88,
                'distance': 0.7,
                'price_range': '$$$',
                'photos': []
            },
            {
                'id': 'mock-3',
                'place_id': 'mock-3',
                'name': 'Green Leaf Cafe',
                'rating': 4.4,
                'price_level': 1,
                'vicinity': '789 Tea Rd, Sydney NSW',
                'lat': user_lat + 0.002,
                'lng': user_lng - 0.002,
                'match_score': 82,
                'distance': 1.2,
                'price_range': '$',
                'photos': []
            }
        ]
        
        return JsonResponse(mock_places, safe=False)
    
    def calculate_match_score(self, place, user_lat, user_lng, user_context=None):
        """
        Advanced match scoring that considers multiple factors for intelligent recommendations
        """
        score = 0
        user_context = user_context or {}
        
        # Base score from rating (0-30 points)
        rating = place.get('rating', 0)
        if rating > 0:
            # Exponential rating boost - 4.5+ gets much higher scores
            if rating >= 4.8:
                score += 30
            elif rating >= 4.5:
                score += 25
            elif rating >= 4.0:
                score += 20
            elif rating >= 3.5:
                score += 15
            else:
                score += 10
        
        # Sentiment-based scoring (0-25 points)
        sentiment = user_context.get('sentiment', 'neutral')
        place_name = place.get('name', '').lower()
        place_types = place.get('types', [])
        
        if sentiment in ['stressed', 'tired', 'calm']:
            # Quiet, peaceful places for stressed users
            quiet_keywords = ['zen', 'quiet', 'peaceful', 'calm', 'serene', 'tranquil']
            if any(keyword in place_name for keyword in quiet_keywords):
                score += 20
            if 'park' in place_types or 'garden' in place_types:
                score += 15
            if place.get('rating', 0) >= 4.5:  # High-rated peaceful places
                score += 10
                
        elif sentiment in ['excited', 'happy', 'social']:
            # Lively, social places for excited users
            social_keywords = ['social', 'bar', 'rooftop', 'trendy', 'vibrant', 'lively']
            if any(keyword in place_name for keyword in social_keywords):
                score += 20
            if 'bar' in place_types or 'nightclub' in place_types:
                score += 15
            if place.get('price_level', 2) in [2, 3]:  # Social price range
                score += 10
                
        elif sentiment in ['focused', 'study', 'work']:
            # Quiet, focused places for work/study
            work_keywords = ['study', 'work', 'focus', 'quiet', 'concentration', 'library']
            if any(keyword in place_name for keyword in work_keywords):
                score += 20
            if 'library' in place_types or 'cafe' in place_types:
                score += 15
            if place.get('wifi', False):  # Assuming wifi availability
                score += 10
        
        # Time-based scoring (0-20 points)
        current_hour = user_context.get('hour', 12)  # Default to noon
        if 6 <= current_hour <= 11:  # Morning (6 AM - 11 AM)
            if 'breakfast' in place_types or 'coffee' in place_types:
                score += 20
            if 'bakery' in place_types:
                score += 15
        elif 11 <= current_hour <= 16:  # Lunch (11 AM - 4 PM)
            if 'restaurant' in place_types or 'cafe' in place_types:
                score += 20
            if 'lunch' in place_types:
                score += 15
        elif 16 <= current_hour <= 21:  # Afternoon/Evening (4 PM - 9 PM)
            if 'dinner' in place_types or 'bar' in place_types:
                score += 20
            if 'rooftop' in place_types:
                score += 15
        elif 21 <= current_hour or current_hour <= 2:  # Night (9 PM - 2 AM)
            if 'bar' in place_types or 'nightclub' in place_types:
                score += 20
            if 'late_night' in place_types:
                score += 15
        
        # User preference matching (0-20 points)
        user_preferences = user_context.get('preferences', {})
        
        # Budget preferences
        budget = user_preferences.get('budget', 'medium')
        price_level = place.get('price_level', 2)
        if budget == 'low' and price_level <= 1:
            score += 20
        elif budget == 'medium' and price_level in [1, 2]:
            score += 20
        elif budget == 'high' and price_level >= 3:
            score += 20
        
        # Atmosphere preferences
        vibe = user_preferences.get('vibe', 'any')
        if vibe == 'cozy' and any(word in place_name for word in ['cozy', 'warm', 'intimate']):
            score += 20
        elif vibe == 'trendy' and any(word in place_name for word in ['trendy', 'modern', 'hip']):
            score += 20
        elif vibe == 'quiet' and any(word in place_name for word in ['quiet', 'peaceful', 'serene']):
            score += 20
        
        # Special needs
        special_needs = user_preferences.get('special_needs', [])
        if 'wifi' in special_needs and place.get('wifi', False):
            score += 15
        if 'outdoor_seating' in special_needs and 'outdoor_seating' in place_types:
            score += 15
        if 'accessible' in special_needs and 'wheelchair_accessible' in place_types:
            score += 15
        
        # Matcha-specific scoring (0-15 points)
        matcha_keywords = ['matcha', 'green tea', 'tea house', 'tea room', 'japanese', 'asian']
        matcha_score = 0
        for keyword in matcha_keywords:
            if keyword in place_name.lower():
                matcha_score += 5
                break
        if 'matcha' in place_name.lower():
            matcha_score += 10  # Bonus for explicit matcha mention
        score += min(15, matcha_score)
        
        # Distance factor (0-15 points, closer is better)
        try:
            # Handle different possible data structures
            if 'geometry' in place and 'location' in place['geometry']:
                place_lat = place['geometry']['location']['lat']
                place_lng = place['geometry']['location']['lng']
            elif 'lat' in place and 'lng' in place:
                place_lat = place['lat']
                place_lng = place['lng']
            else:
                place_lat = user_lat
                place_lng = user_lng
            
            distance = self.calculate_distance(user_lat, user_lng, place_lat, place_lng)
        except Exception as e:
            print(f"Error calculating distance: {e}")
            distance = 5.0  # Default distance
        
        # Smart distance scoring based on context
        if distance <= 0.5:  # Within 0.5 miles - very convenient
            score += 15
        elif distance <= 1.0:  # Within 1 mile - convenient
            score += 12
        elif distance <= 2.0:  # Within 2 miles - acceptable
            score += 8
        elif distance <= 3.0:  # Within 3 miles - okay for special places
            score += 5
        else:  # Beyond 3 miles - only for exceptional places
            score += 2
        
        # Special occasion bonuses (0-10 points)
        special_occasion = user_context.get('special_occasion', 'none')
        if special_occasion == 'date' and 'romantic' in place_types:
            score += 10
        elif special_occasion == 'birthday' and 'celebration' in place_types:
            score += 10
        elif special_occasion == 'meeting' and 'quiet' in place_types:
            score += 10
        
        # Weather consideration (0-5 points)
        weather = user_context.get('weather', 'sunny')
        if weather == 'rainy' and 'indoor' in place_types:
            score += 5
        elif weather == 'sunny' and 'outdoor_seating' in place_types:
            score += 5
        
        # Ensure score is within 0-200 range and return as integer
        return min(200, max(0, int(score)))
    
    def calculate_distance(self, lat1, lng1, lat2, lng2):
        """Calculate distance between two points in miles"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 3959  # Earth's radius in miles
        
        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        distance = R * c
        
        return round(distance, 1)
    
    def format_price_range(self, price_level):
        """Convert price level to dollar signs"""
        if price_level is None:
            return "Price not available"
        
        price_map = {
            0: "Free",
            1: "$",
            2: "$$",
            3: "$$$",
            4: "$$$$"
        }
        
        return price_map.get(price_level, "Price not available")
    
    def get_photo_urls(self, photos):
        """Extract photo URLs from place photos using photo_reference"""
        photo_urls = []
        
        if not photos:
            # Return a fallback placeholder image when no photos are available
            return ["http://localhost:8000/api/ai/placeholder/400/300/"]
            
        for photo in photos[:3]:  # Limit to first 3 photos
            photo_reference = photo.get('photo_reference')
            
            if photo_reference:
                try:
                    # Construct photo URL with API key
                    from django.conf import settings
                    api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
                    
                    if api_key and api_key != "demo-key":
                        photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={api_key}"
                        photo_urls.append(photo_url)
                    else:
                        print("Warning: No valid Google Maps API key found for photos")
                        # Add fallback placeholder when no API key
                        photo_urls.append("http://localhost:8000/api/ai/placeholder/400/300/")
                except Exception as e:
                    print(f"Error constructing photo URL: {e}")
                                                                # Add fallback placeholder on error
                    photo_urls.append("http://localhost:8000/api/ai/placeholder/400/300/")
        
        # If we still have no photos after processing, add a fallback
        if not photo_urls:
            photo_urls.append("http://localhost:8000/api/ai/placeholder/400/300/")
        
        return photo_urls
    



# urls.py (add this to your urlpatterns)
from django.urls import path
from .views import PlacesView

urlpatterns = [
    # ... your existing URLs
    path('api/places/', PlacesView.as_view(), name='places'),
]


# settings.py (make sure you have this)
GOOGLE_MAPS_API_KEY = 'your-backend-google-maps-api-key'

# Add to CORS settings if not already there
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",  # Alternative React port
]
