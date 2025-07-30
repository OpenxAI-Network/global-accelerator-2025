"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Eye, Download, Filter, Globe, Shield, AlertTriangle } from "lucide-react"

export default function IntelligencePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReport, setSelectedReport] = useState(null)

  const reports = [
    {
      id: "INT-2025-001",
      title: "CYBERCRIME NETWORK ANALYSIS",
      classification: "TOP SECRET",
      source: "SIGINT",
      location: "Eastern Europe",
      date: "2025-06-17",
      status: "verified",
      threat: "high",
      summary: "Detailed analysis of emerging cybercrime syndicate operating across multiple jurisdictions",
      tags: ["cybercrime", "international", "financial"],
    },
    {
      id: "INT-2025-002",
      title: "ROGUE AGENT COMMUNICATIONS",
      classification: "SECRET",
      source: "HUMINT",
      location: "Berlin",
      date: "2025-06-16",
      status: "pending",
      threat: "critical",
      summary: "Intercepted communications suggesting potential security breach in European operations",
      tags: ["internal", "security", "communications"],
    },
    {
      id: "INT-2025-003",
      title: "ARMS TRAFFICKING ROUTES",
      classification: "CONFIDENTIAL",
      source: "OSINT",
      location: "Middle East",
      date: "2025-06-15",
      status: "verified",
      threat: "medium",
      summary: "Updated intelligence on weapons smuggling corridors through Mediterranean region",
      tags: ["trafficking", "weapons", "maritime"],
    },
    {
      id: "INT-2025-004",
      title: "TERRORIST CELL SURVEILLANCE",
      classification: "TOP SECRET",
      source: "HUMINT",
      location: "North Africa",
      date: "2025-06-14",
      status: "active",
      threat: "critical",
      summary: "Ongoing surveillance of suspected terrorist cell planning coordinated attacks",
      tags: ["terrorism", "surveillance", "coordinated"],
    },
    {
      id: "INT-2025-005",
      title: "DIPLOMATIC INTELLIGENCE BRIEF",
      classification: "SECRET",
      source: "DIPLOMATIC",
      location: "Asia Pacific",
      date: "2025-06-13",
      status: "verified",
      threat: "low",
      summary: "Political developments affecting regional security and operational considerations",
      tags: ["diplomatic", "political", "regional"],
    },
  ]

  const getClassificationColor = (classification) => {
    switch (classification) {
      case "TOP SECRET":
        return "bg-red-500/20 text-red-500"
      case "SECRET":
        return "bg-orange-500/20 text-orange-500"
      case "CONFIDENTIAL":
        return "bg-neutral-500/20 text-neutral-300"
      default:
        return "bg-white/20 text-white"
    }
  }

  const getThreatColor = (threat) => {
    switch (threat) {
      case "critical":
        return "bg-red-500/20 text-red-500"
      case "high":
        return "bg-orange-500/20 text-orange-500"
      case "medium":
        return "bg-neutral-500/20 text-neutral-300"
      case "low":
        return "bg-white/20 text-white"
      default:
        return "bg-neutral-500/20 text-neutral-300"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-white/20 text-white"
      case "pending":
        return "bg-orange-500/20 text-orange-500"
      case "active":
        return "bg-white/20 text-white"
      default:
        return "bg-neutral-500/20 text-neutral-300"
    }
  }

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">INTELLIGENCE CENTER</h1>
          <p className="text-sm text-neutral-400">Classified reports and threat analysis</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">New Report</Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Search intelligence reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">TOTAL REPORTS</p>
                <p className="text-2xl font-bold text-white font-mono">1,247</p>
              </div>
              <FileText className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">CRITICAL THREATS</p>
                <p className="text-2xl font-bold text-red-500 font-mono">12</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">ACTIVE SOURCES</p>
                <p className="text-2xl font-bold text-white font-mono">89</p>
              </div>
              <Globe className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Reports */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">INTELLIGENCE REPORTS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="border border-neutral-700 rounded p-4 hover:border-orange-500/50 transition-colors cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-neutral-400 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white tracking-wider">{report.title}</h3>
                        <p className="text-xs text-neutral-400 font-mono">{report.id}</p>
                      </div>
                    </div>

                    <p className="text-sm text-neutral-300 ml-8">{report.summary}</p>

                    <div className="flex flex-wrap gap-2 ml-8">
                      {report.tags.map((tag) => (
                        <Badge key={tag} className="bg-neutral-800 text-neutral-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getClassificationColor(report.classification)}>{report.classification}</Badge>
                      <Badge className={getThreatColor(report.threat)}>{report.threat.toUpperCase()}</Badge>
                      <Badge className={getStatusColor(report.status)}>{report.status.toUpperCase()}</Badge>
                    </div>

                    <div className="text-xs text-neutral-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        <span>{report.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        <span>{report.source}</span>
                      </div>
                      <div className="font-mono">{report.date}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-white tracking-wider">{selectedReport.title}</CardTitle>
                <p className="text-sm text-neutral-400 font-mono">{selectedReport.id}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedReport(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">CLASSIFICATION</h3>
                    <div className="flex gap-2">
                      <Badge className={getClassificationColor(selectedReport.classification)}>
                        {selectedReport.classification}
                      </Badge>
                      <Badge className={getThreatColor(selectedReport.threat)}>
                        THREAT: {selectedReport.threat.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">SOURCE DETAILS</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Source Type:</span>
                        <span className="text-white font-mono">{selectedReport.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Location:</span>
                        <span className="text-white">{selectedReport.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Date:</span>
                        <span className="text-white font-mono">{selectedReport.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Status:</span>
                        <Badge className={getStatusColor(selectedReport.status)}>
                          {selectedReport.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">TAGS</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.tags.map((tag) => (
                        <Badge key={tag} className="bg-neutral-800 text-neutral-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">THREAT ASSESSMENT</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-400">Threat Level</span>
                        <Badge className={getThreatColor(selectedReport.threat)}>
                          {selectedReport.threat.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedReport.threat === "critical"
                              ? "bg-red-500 w-full"
                              : selectedReport.threat === "high"
                                ? "bg-orange-500 w-3/4"
                                : selectedReport.threat === "medium"
                                  ? "bg-neutral-400 w-1/2"
                                  : "bg-white w-1/4"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">EXECUTIVE SUMMARY</h3>
                <p className="text-sm text-neutral-300 leading-relaxed">{selectedReport.summary}</p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-700">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Report
                </Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  Share Intel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
