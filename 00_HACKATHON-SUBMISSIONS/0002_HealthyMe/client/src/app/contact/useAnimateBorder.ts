import { useEffect, useState } from 'react'

export const useAnimatedBorder = () => {
  const [gradientPosition, setGradientPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const animateBorder = () => {
      const time = Date.now() * 0.001
      const x = Math.sin(time) * 50 + 50
      const y = Math.cos(time) * 50 + 50
      setGradientPosition({ x, y })
    }

    const intervalId = setInterval(animateBorder, 20)
    return () => clearInterval(intervalId)
  }, [])

  return gradientPosition
}
