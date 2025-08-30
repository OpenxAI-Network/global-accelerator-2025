from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Conversation(models.Model):
    """Represents a chat conversation between user and AI"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True)  # For anonymous users
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']

class Message(models.Model):
    """Individual messages in a conversation"""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'AI Assistant'),
    ]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['timestamp']

class SentimentAnalysis(models.Model):
    """Stores sentiment analysis results for user messages"""
    SENTIMENT_CHOICES = [
        ('happy', 'Happy'),
        ('excited', 'Excited'),
        ('calm', 'Calm'),
        ('stressed', 'Stressed'),
        ('sad', 'Sad'),
        ('angry', 'Angry'),
        ('neutral', 'Neutral'),
        ('social', 'Social'),
        ('focused', 'Focused'),
    ]
    
    message = models.OneToOneField(Message, on_delete=models.CASCADE, related_name='sentiment')
    sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES)
    confidence = models.FloatField(default=0.0)  # 0.0 to 1.0
    extracted_preferences = models.JSONField(default=dict)  # Store extracted preferences
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']

class UserPreference(models.Model):
    """Stores user preferences extracted from conversations"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)  # For anonymous users
    preference_type = models.CharField(max_length=50)  # e.g., 'budget', 'vibe', 'location'
    preference_value = models.CharField(max_length=100)
    confidence = models.FloatField(default=0.0)
    extracted_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-extracted_at']
        unique_together = ['user', 'session_id', 'preference_type']

class AIRecommendation(models.Model):
    """Stores AI-generated recommendations for cafés"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='recommendations')
    place_id = models.CharField(max_length=100)  # Google Places ID
    place_name = models.CharField(max_length=200)
    recommendation_reason = models.TextField()
    sentiment_context = models.CharField(max_length=50)  # What mood this matches
    confidence = models.FloatField(default=0.0)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
