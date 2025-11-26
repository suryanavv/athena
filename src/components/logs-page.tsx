import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import data from "@/data.json"
import { cn } from "@/lib/utils"
import { IconArrowLeft, IconDownload } from "@tabler/icons-react"

const stats = data.logs?.stats ?? []
const logsData = data.logs?.entries ?? []

type LogEntry = {
  from: string
  to: string
  start: string
  duration: string
  status: string
  transcription?: Array<{ role: string; message: string }>
}

export function LogsPage() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  const filteredLogs = logsData.filter((log) => {
    if (activeFilter === "All") return true
    return log.status === activeFilter
  })

  const handleDownload = () => {
    if (!selectedLog || !selectedLog.transcription) return

    const transcriptText = selectedLog.transcription
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.message}`)
      .join("\n\n")

    const header = `Conversation Transcript\nPhone Number: ${selectedLog.from}\nDate: ${selectedLog.start}\nDuration: ${selectedLog.duration}\nStatus: ${selectedLog.status}\n\n${"=".repeat(60)}\n\n`

    const fullText = header + transcriptText

    const blob = new Blob([fullText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transcript-${selectedLog.from}-${new Date().getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Show transcript view if a log is selected
  if (selectedLog) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        {/* Header */}
        <div className="neumorphic-soft rounded-2xl p-4 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Conversational Transcript - {selectedLog.from}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedLog.start} • Duration: {selectedLog.duration} • Status: {selectedLog.status}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="neumorphic-soft border-0 gap-2"
              >
                <IconDownload size={18} />
                Download
              </Button>
              <Button
                onClick={() => setSelectedLog(null)}
                className="neumorphic-btn-primary gap-2"
              >
                <IconArrowLeft size={18} />
                Back to Call Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Transcript Messages */}
        <div className="neumorphic-inset rounded-2xl p-4 md:p-6">
          <div className="max-h-[70vh] overflow-y-auto space-y-4">
            {selectedLog.transcription && selectedLog.transcription.length > 0 ? (
              selectedLog.transcription.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-xl p-4 transition-all",
                    msg.role === "agent"
                      ? "neumorphic-soft bg-blue-50/50 dark:bg-blue-950/20 ml-0 mr-auto max-w-[85%]"
                      : "neumorphic-soft bg-green-50/50 dark:bg-green-950/20 ml-auto mr-0 max-w-[85%]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        msg.role === "agent"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-green-600 dark:text-green-400"
                      )}
                    >
                      {msg.role === "agent" ? "Assistant" : "Patient"}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{msg.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transcript available for this call.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show main logs table view
  return (
    <div className="space-y-6 px-4 lg:px-6">

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={() => setActiveFilter(stat.filter)}
            className={cn(
              "neumorphic-inset border-0 rounded-2xl p-4 cursor-pointer transition-all duration-200",
              activeFilter === stat.filter 
                ? `neumorphic-pressed border border-foreground/30` 
                : "neumorphic-inset hover:-translate-y-1 hover:shadow-lg"
            )}
          >
            <p className="text-lg font-semibold text-muted-foreground">{stat.label}</p>
            <p className={`text-4xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Logs Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
           <div className="flex items-center gap-2">
             <h2 className="text-base font-semibold">
                {activeFilter === "All" ? "All Call Logs" : `${activeFilter} Call Logs`} 
                <span className="text-muted-foreground ml-2 text-sm font-normal">
                  ({activeFilter === "All" ? 293 : filteredLogs.length})
                </span>
             </h2>
           </div>
           <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by:</span>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] neumorphic-soft border-0 h-9 bg-transparent shadow-none">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                  </SelectContent>
                </Select>
             </div>
           </div>
        </div>

        <div className="neumorphic-inset border-0 rounded-2xl p-4 md:p-6">
          <div className="overflow-x-auto">
             <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="sticky top-0 z-10 backdrop-blur-sm">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-muted/60">
                    <th className="py-3 pr-4 font-medium">From</th>
                    <th className="py-3 pr-4 font-medium">To</th>
                    <th className="py-3 pr-4 font-medium">Start Time</th>
                    <th className="py-3 pr-4 font-medium">Duration</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                      <tr key={index} className="border-b border-muted/30 last:border-b-0 hover:bg-muted/20 transition-colors">
                        <td className="py-4 pr-4 align-top font-medium text-foreground">{log.from}</td>
                        <td className="py-4 pr-4 align-top text-muted-foreground">{log.to}</td>
                        <td className="py-4 pr-4 align-top text-muted-foreground">{log.start}</td>
                        <td className="py-4 pr-4 align-top text-muted-foreground">{log.duration}</td>
                        <td className="py-4 pr-4 align-top">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            log.status === "Successful" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            log.status === "Rescheduled" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                            log.status === "Cancelled" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            log.status === "Failed" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-4 align-top">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                            onClick={() => setSelectedLog(log as LogEntry)}
                          >
                            View Conversation
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No logs found for this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}