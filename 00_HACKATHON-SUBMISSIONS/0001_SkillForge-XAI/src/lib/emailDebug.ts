import { supabase } from './supabase'

export const checkEmailConfiguration = async () => {
  try {
    // Check if Supabase is configured
    const { data, error } = await supabase.auth.getSession()
    
    console.log('🔍 Email Configuration Debug:')
    console.log('- Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('- Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    
    // Check email settings in Supabase dashboard
    console.log('📧 Email Configuration Checklist:')
    console.log('1. Go to Supabase Dashboard > Authentication > Settings')
    console.log('2. Check "Enable email confirmations" is ON')
    console.log('3. Verify Site URL is set correctly')
    console.log('4. Check email templates are configured')
    console.log('5. Ensure SMTP settings are configured (if using custom SMTP)')
    
    return true
  } catch (error) {
    console.error('❌ Configuration check failed:', error)
    return false
  }
}

export const testEmailSending = async (email: string) => {
  try {
    console.log('🧪 Testing email sending for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'test123456',
      options: {
        data: { full_name: 'Test User' }
      }
    })
    
    if (error) {
      console.error('❌ Email test failed:', error.message)
      
      // Common email issues
      if (error.message.includes('email')) {
        console.log('💡 Possible solutions:')
        console.log('- Check if email confirmations are enabled in Supabase')
        console.log('- Verify your domain is added to allowed domains')
        console.log('- Check spam folder')
        console.log('- Ensure SMTP is configured correctly')
      }
      
      return false
    }
    
    console.log('✅ Email test successful:', data)
    return true
  } catch (error) {
    console.error('❌ Email test error:', error)
    return false
  }
}