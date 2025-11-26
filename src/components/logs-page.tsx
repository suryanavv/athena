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

const stats = data.logs?.stats ?? []
const logsData = data.logs?.entries ?? []

export function LogsPage() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filteredLogs = logsData.filter((log) => {
    if (activeFilter === "All") return true
    return log.status === activeFilter
  })

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
                          <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary/80 hover:bg-primary/10">
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