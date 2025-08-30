from django.urls import path
from . import views

app_name = 'ai_chat'

urlpatterns = [
    path('chat/', views.chat_with_ai, name='chat_with_ai'),
    path('test-ai/', views.test_ai_enhancement, name='test_ai_enhancement'),
    path('placeholder/<int:width>/<int:height>/', views.generate_placeholder_image, name='placeholder_image'),
]
