"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Server,
  Database,
  Shield,
  Wifi,
  HardDrive,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react"

export default function SystemsPage() {
  const [selectedSystem, setSelectedSystem] = useState(null)

  const systems = [
    {
      id: "SYS-001",
      name: "COMMAND SERVER ALPHA",
      type: "Primary Server",
      status: "online",
      health: 98,
      cpu: 45,
      memory: 67,
      storage: 34,
      uptime: "247 days",
      location: "Data Center 1",
      lastMaintenance: "2025-05-15",
    },
    {
      id: "SYS-002",
      name: "DATABASE CLUSTER BETA",
      type: "Database",
      status: "online",
      health: 95,
      cpu: 72,
      memory: 84,
      storage: 78,
      uptime: "189 days",
      location: "Data Center 2",
      lastMaintenance: "2025-06-01",
    },
    {
      id: "SYS-003",
      name: "SECURITY GATEWAY",
      type: "Firewall",
      status: "warning",
      health: 87,
      cpu: 23,
      memory: 45,
      storage: 12,
      uptime: "156 days",
      location: "DMZ",
      lastMaintenance: "2025-04-20",
    },
    {
      id: "SYS-004",
      name: "COMMUNICATION HUB",
      type: "Network",
      status: "online",
      health: 92,
      cpu: 38,
      memory: 52,
      storage: 23,
      uptime: "203 days",
      location: "Network Core",
      lastMaintenance: "2025-05-28",
    },
    {
      id: "SYS-005",
      name: "BACKUP STORAGE ARRAY",
      type: "Storage",
      status: "maintenance",
      health: 76,
      cpu: 15,
      memory: 28,
      storage: 89,
      uptime: "0 days",
      location: "Backup Facility",
      lastMaintenance: "2025-06-17",
    },
    {
      id: "SYS-006",
      name: "ANALYTICS ENGINE",
      type: "Processing",
      status: "online",
      health: 94,
      cpu: 89,
      memory: 76,
      storage: 45,
      uptime: "134 days",
      location: "Data Center 1",
      lastMaintenance: "2025-05-10",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-white/20 text-white"
      case "warning":
        return "bg-orange-500/20 text-orange-500"
      case "maintenance":
        return "bg-neutral-500/20 text-neutral-300"
      case "offline":
        return "bg-red-500/20 text-red-500"
      default:
        return "bg-neutral-500/20 text-neutral-300"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "maintenance":
        return <Settings className="w-4 h-4" />
      case "offline":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getSystemIcon = (type) => {
    switch (type) {
      case "Primary Server":
        return <Server className="w-6 h-6" />
      case "Database":
        return <Database className="w-6 h-6" />
      case "Firewall":
        return <Shield className="w-6 h-6" />
      case "Network":
        return <Wifi className="w-6 h-6" />
      case "Storage":
        return <HardDrive className="w-6 h-6" />
      case "Processing":
        return <Cpu className="w-6 h-6" />
      default:
        return <Server className="w-6 h-6" />
    }
  }

  const getHealthColor = (health) => {
    if (health >= 95) return "text-white"
    if (health >= 85) return "text-white"
    if (health >= 70) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">SYSTEMS MONITOR</h1>
          <p className="text-sm text-neutral-400">Infrastructure health and performance monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">System Scan</Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">Maintenance Mode</Button>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">SYSTEMS ONLINE</p>
                <p className="text-2xl font-bold text-white font-mono">24/26</p>
              </div>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">WARNINGS</p>
                <p className="text-2xl font-bold text-orange-500 font-mono">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">AVG UPTIME</p>
                <p className="text-2xl font-bold text-white font-mono">99.7%</p>
              </div>
              <Activity className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">MAINTENANCE</p>
                <p className="text-2xl font-bold text-neutral-300 font-mono">1</p>
              </div>
              <Settings className="w-8 h-8 text-neutral-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {systems.map((system) => (
          <Card
            key={system.id}
            className="bg-neutral-900 border-neutral-700 hover:border-orange-500/50 transition-colors cursor-pointer"
            onClick={() => setSelectedSystem(system)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getSystemIcon(system.type)}
                  <div>
                    <CardTitle className="text-sm font-bold text-white tracking-wider">{system.name}</CardTitle>
                    <p className="text-xs text-neutral-400">{system.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(system.status)}
                  <Badge className={getStatusColor(system.status)}>{system.status.toUpperCase()}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">SYSTEM HEALTH</span>
                <span className={`text-sm font-bold font-mono ${getHealthColor(system.health)}`}>{system.health}%</span>
              </div>
              <Progress value={system.health} className="h-2" />

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-neutral-400 mb-1">CPU</div>
                  <div className="text-white font-mono">{system.cpu}%</div>
                  <div className="w-full bg-neutral-800 rounded-full h-1 mt-1">
                    <div
                      className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${system.cpu}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400 mb-1">MEMORY</div>
                  <div className="text-white font-mono">{system.memory}%</div>
                  <div className="w-full bg-neutral-800 rounded-full h-1 mt-1">
                    <div
                      className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${system.memory}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400 mb-1">STORAGE</div>
                  <div className="text-white font-mono">{system.storage}%</div>
                  <div className="w-full bg-neutral-800 rounded-full h-1 mt-1">
                    <div
                      className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${system.storage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-white font-mono">{system.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-white">{system.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Detail Modal */}
      {selectedSystem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                {getSystemIcon(selectedSystem.type)}
                <div>
                  <CardTitle className="text-xl font-bold text-white tracking-wider">{selectedSystem.name}</CardTitle>
                  <p className="text-sm text-neutral-400">
                    {selectedSystem.id} • {selectedSystem.type}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedSystem(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">SYSTEM STATUS</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedSystem.status)}
                      <Badge className={getStatusColor(selectedSystem.status)}>
                        {selectedSystem.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">SYSTEM INFORMATION</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Location:</span>
                        <span className="text-white">{selectedSystem.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Uptime:</span>
                        <span className="text-white font-mono">{selectedSystem.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Last Maintenance:</span>
                        <span className="text-white font-mono">{selectedSystem.lastMaintenance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Health Score:</span>
                        <span className={`font-mono ${getHealthColor(selectedSystem.health)}`}>
                          {selectedSystem.health}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">RESOURCE USAGE</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-400">CPU Usage</span>
                          <span className="text-white font-mono">{selectedSystem.cpu}%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedSystem.cpu}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-400">Memory Usage</span>
                          <span className="text-white font-mono">{selectedSystem.memory}%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedSystem.memory}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-400">Storage Usage</span>
                          <span className="text-white font-mono">{selectedSystem.storage}%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedSystem.storage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-700">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">Restart System</Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  View Logs
                </Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  Schedule Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
