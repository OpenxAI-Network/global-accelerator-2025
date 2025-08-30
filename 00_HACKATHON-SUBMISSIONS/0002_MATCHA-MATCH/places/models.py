from django.db import models

class Place(models.Model):
    """Model for storing matcha café information"""
    
    # Basic information
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=500)
    phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Location
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    # Ratings and reviews
    rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    
    # Café characteristics (for AI matching)
    price_level = models.CharField(
        max_length=20,
        choices=[
            ('budget', 'Budget-Friendly'),
            ('moderate', 'Moderate'),
            ('premium', 'Premium'),
        ],
        default='moderate'
    )
    
    vibe = models.CharField(
        max_length=50,
        choices=[
            ('peaceful', 'Peaceful & Quiet'),
            ('social', 'Social & Lively'),
            ('cozy', 'Cozy & Intimate'),
            ('trendy', 'Trendy & Modern'),
            ('traditional', 'Traditional & Classic'),
        ],
        default='cozy'
    )
    
    atmosphere = models.CharField(
        max_length=100,
        choices=[
            ('study', 'Great for Studying'),
            ('meeting', 'Good for Meetings'),
            ('date', 'Perfect for Dates'),
            ('family', 'Family-Friendly'),
            ('work', 'Work-Friendly'),
        ],
        default='meeting'
    )
    
    # Matcha-specific features
    matcha_quality = models.CharField(
        max_length=20,
        choices=[
            ('premium', 'Premium Grade'),
            ('ceremonial', 'Ceremonial Grade'),
            ('culinary', 'Culinary Grade'),
            ('standard', 'Standard Grade'),
        ],
        default='standard'
    )
    
    has_outdoor_seating = models.BooleanField(default=False)
    has_wifi = models.BooleanField(default=True)
    has_power_outlets = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-rating', '-review_count']
        verbose_name = 'Matcha Café'
        verbose_name_plural = 'Matcha Cafés'
    
    def __str__(self):
        return f"{self.name} - {self.address}"
    
    @property
    def full_address(self):
        return f"{self.address}"
    
    @property
    def price_display(self):
        price_symbols = {
            'budget': '$',
            'moderate': '$$',
            'premium': '$$$'
        }
        return price_symbols.get(self.price_level, '$$')
    
    @property
    def vibe_emoji(self):
        vibe_emojis = {
            'peaceful': '🧘',
            'social': '🎉',
            'cozy': '🫖',
            'trendy': '✨',
            'traditional': '🏮'
        }
        return vibe_emojis.get(self.vibe, '☕')
