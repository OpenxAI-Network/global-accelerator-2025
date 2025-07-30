"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import * as THREE from "three"

interface ThreeDVisualizationProps {
  width?: number
  height?: number
  data?: any[]
  type?: "sphere" | "timeline" | "network"
}

export default function ThreeDVisualization({
  width = 400,
  height = 300,
  data = [],
  type = "sphere",
}: ThreeDVisualizationProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 5

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x8b5cf6, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x06b6d4, 0.8, 100)
    pointLight.position.set(-5, -5, 5)
    scene.add(pointLight)

    // Create visualization based on type
    if (type === "sphere") {
      createSphereVisualization(scene)
    } else if (type === "timeline") {
      createTimelineVisualization(scene, data)
    } else if (type === "network") {
      createNetworkVisualization(scene, data)
    }

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      // Rotate the scene
      scene.rotation.y += 0.005
      scene.rotation.x += 0.002

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [width, height, data, type])

  const createSphereVisualization = (scene: THREE.Scene) => {
    // Main wireframe sphere
    const geometry = new THREE.SphereGeometry(2, 32, 32)
    const material = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Inner spheres
    for (let i = 0; i < 3; i++) {
      const innerGeometry = new THREE.SphereGeometry(1.5 - i * 0.3, 16, 16)
      const innerMaterial = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x06b6d4 : i === 1 ? 0x8b5cf6 : 0xec4899,
        wireframe: true,
        transparent: true,
        opacity: 0.3 - i * 0.1,
      })
      const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial)
      scene.add(innerSphere)
    }

    // Floating particles
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = 100
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10
      positions[i + 1] = (Math.random() - 0.5) * 10
      positions[i + 2] = (Math.random() - 0.5) * 10
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)
  }

  const createTimelineVisualization = (scene: THREE.Scene, data: any[]) => {
    // Create timeline path
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, -2, 0),
      new THREE.Vector3(-2, 0, 1),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(2, 0, -1),
      new THREE.Vector3(4, -1, 0),
    ])

    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.05, 8, false)
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.8,
    })
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
    scene.add(tube)

    // Add data points along the timeline
    const points = curve.getPoints(data.length || 10)
    points.forEach((point, index) => {
      const sphereGeometry = new THREE.SphereGeometry(0.1, 8, 8)
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? 0x06b6d4 : 0xec4899,
      })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.position.copy(point)
      scene.add(sphere)

      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(0.15, 8, 8)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? 0x06b6d4 : 0xec4899,
        transparent: true,
        opacity: 0.3,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.copy(point)
      scene.add(glow)
    })
  }

  const createNetworkVisualization = (scene: THREE.Scene, data: any[]) => {
    // Create network nodes
    const nodeCount = data.length || 20
    const nodes: THREE.Mesh[] = []

    for (let i = 0; i < nodeCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8)
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x8b5cf6 : 0x06b6d4,
      })
      const node = new THREE.Mesh(geometry, material)

      // Random position
      node.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6)

      nodes.push(node)
      scene.add(node)
    }

    // Create connections between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.7) {
          // 30% chance of connection
          const geometry = new THREE.BufferGeometry().setFromPoints([nodes[i].position, nodes[j].position])
          const material = new THREE.LineBasicMaterial({
            color: 0x374151,
            transparent: true,
            opacity: 0.3,
          })
          const line = new THREE.Line(geometry, material)
          scene.add(line)
        }
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-lg overflow-hidden border border-purple-500/30 bg-black/50"
      style={{ width, height }}
    >
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </motion.div>
  )
}
