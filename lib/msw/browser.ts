import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 创建MSW worker
export const worker = setupWorker(...handlers)

// 启动MSW的函数
export const startMSW = async () => {
  if (typeof window !== 'undefined') {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      })
      console.log('🔶 MSW started successfully')
    } catch (error) {
      console.error('Failed to start MSW:', error)
    }
  }
}

// 停止MSW的函数
export const stopMSW = () => {
  if (typeof window !== 'undefined') {
    worker.stop()
    console.log('🔶 MSW stopped')
  }
}