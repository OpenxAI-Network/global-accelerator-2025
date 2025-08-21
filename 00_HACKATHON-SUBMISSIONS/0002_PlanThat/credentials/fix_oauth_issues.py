#!/usr/bin/env python3
"""
Fix OAuth Redirect URI Issues

This script helps fix the "redirect_uri not registered" error.
Run this to get specific instructions for your setup.

Usage:
    python fix_oauth_issues.py
"""

import os
import json
import webbrowser

def check_credentials_file():
    """
    Check if credentials.json exists and is valid
    """
    credentials_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
    
    if not os.path.exists(credentials_path):
        print("❌ credentials.json not found!")
        print("📁 Please add your credentials.json file to this directory")
        return False
    
    try:
        with open(credentials_path, 'r') as f:
            creds = json.load(f)
        
        if 'installed' in creds:
            print("✅ credentials.json found and appears valid")
            return True
        else:
            print("⚠️  credentials.json format may be incorrect")
            return False
    except Exception as e:
        print(f"❌ Error reading credentials.json: {e}")
        return False

def fix_redirect_uri_issue():
    """
    Provide specific instructions for fixing redirect URI issues
    """
    print("🔧 Fixing Redirect URI Issue")
    print("=" * 50)
    
    print("\n📋 **Step-by-Step Fix for Redirect URI Error**")
    print("\n1. **Go to Google Cloud Console**")
    print("   🔗 https://console.cloud.google.com/")
    
    print("\n2. **Select Your Project**")
    print("   - Make sure you're in the correct project")
    
    print("\n3. **Navigate to Credentials**")
    print("   - Go to 'APIs & Services' > 'Credentials'")
    
    print("\n4. **Edit Your OAuth 2.0 Client**")
    print("   - Click on your OAuth 2.0 Client ID")
    print("   - Click 'Edit' (pencil icon)")
    
    print("\n5. **Add Redirect URIs**")
    print("   - In 'Authorized redirect URIs' section, add:")
    print("     ✅ http://localhost:8080/")
    print("     ✅ http://localhost:3000/")
    print("     ✅ http://localhost:5001/")
    print("     ✅ http://localhost:54633/ (the one from your error)")
    print("     ✅ http://localhost:8081/")
    print("     ✅ http://localhost:8082/")
    print("     ✅ http://localhost:8083/")
    print("     ✅ http://localhost:8084/")
    print("     ✅ http://localhost:8085/")
    print("     ✅ http://localhost:8086/")
    print("     ✅ http://localhost:8087/")
    print("     ✅ http://localhost:8088/")
    print("     ✅ http://localhost:8089/")
    print("     ✅ http://localhost:8090/")
    
    print("\n6. **Save Changes**")
    print("   - Click 'Save' at the bottom")
    
    print("\n7. **Wait a Few Minutes**")
    print("   - Google may take a few minutes to propagate changes")
    
    print("\n8. **Try Again**")
    print("   - Run the authentication script again")
    
    return True

def open_google_cloud_console():
    """
    Open Google Cloud Console in browser
    """
    print("\n🌐 Opening Google Cloud Console...")
    webbrowser.open("https://console.cloud.google.com/apis/credentials")
    print("✅ Google Cloud Console opened in your browser")

def main():
    """
    Main function to fix OAuth issues
    """
    print("🚀 OAuth Redirect URI Fix Tool")
    print("=" * 50)
    
    # Check credentials file
    if not check_credentials_file():
        print("\n❌ Please fix credentials file first")
        return 1
    
    # Provide fix instructions
    fix_redirect_uri_issue()
    
    # Ask if user wants to open Google Cloud Console
    print("\n" + "=" * 50)
    response = input("🌐 Would you like to open Google Cloud Console now? (y/n): ")
    
    if response.lower() in ['y', 'yes']:
        open_google_cloud_console()
    
    print("\n✅ Follow the steps above to fix your redirect URI issue")
    print("📖 For more detailed help, see TROUBLESHOOTING.md")
    
    return 0

if __name__ == '__main__':
    exit(main())
