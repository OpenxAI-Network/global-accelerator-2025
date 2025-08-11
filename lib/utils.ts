import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 分享工具函数
export const shareUtils = {
  // 复制链接到剪贴板
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const result = document.execCommand('copy')
        textArea.remove()
        return result
      }
    } catch (err) {
      console.error('复制失败:', err)
      return false
    }
  },

  // 分享到Twitter
  shareToTwitter(text: string, url?: string, hashtags?: string[]) {
    const params = new URLSearchParams()
    params.append('text', text)
    if (url) params.append('url', url)
    if (hashtags && hashtags.length > 0) {
      params.append('hashtags', hashtags.join(','))
    }
    
    const twitterUrl = `https://twitter.com/intent/tweet?${params.toString()}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  },

  // 分享到Facebook
  shareToFacebook(url: string) {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, '_blank', 'width=580,height=296')
  },

  // 获取当前页面URL
  getCurrentUrl(): string {
    return typeof window !== 'undefined' ? window.location.href : ''
  }
}
