import { useMemo, useState } from "react"
import data from "@/data.json"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const filterOptions = [
  "All",
  "Today",
  "Tomorrow",
  "This Week",
  "Current Month",
  "Last Month",
  "Past Bookings",
  "Future Bookings",
]

const cancelledStatuses = new Set(["cancelled", "canceled"])
const completedStatuses = new Set(["completed"])

const parseDateString = (dateStr?: string) => {
  if (!dateStr) return null
  const parts = dateStr.split(/[/-]/).map(Number)
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null
  }
  let [first, second, year] = parts
  const month = first > 12 && second <= 12 ? second : first
  const day = first > 12 && second <= 12 ? first : second
  return new Date(year, month - 1, day)
}

const parseDateInput = (value: string) => {
  if (!value) return null
  const [year, month, day] = value.split("-").map(Number)
  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return null
  }
  return new Date(year, month - 1, day)
}

const parseTimeString = (timeStr?: string) => {
  if (!timeStr) return null
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return null
  let [_, hours, minutes, period] = match
  let hour = Number(hours)
  const minute = Number(minutes)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  period = period.toUpperCase()
  if (period === "PM" && hour !== 12) hour += 12
  if (period === "AM" && hour === 12) hour = 0
  return hour * 60 + minute
}

const parseTimeInput = (value: string) => {
  if (!value) return null
  const [hourStr, minuteStr] = value.split(":")
  const hour = Number(hourStr)
  const minute = Number(minuteStr)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  return hour * 60 + minute
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)

const getStatusBadgeClass = (status?: string) => {
  const normalized = status?.toLowerCase()
  if (!normalized) return "bg-muted text-muted-foreground"
  if (cancelledStatuses.has(normalized)) return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200"
  if (normalized === "rescheduled") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200"
  if (completedStatuses.has(normalized)) return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200"
  if (normalized === "scheduled") return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
  return "bg-muted text-muted-foreground"
}

export function AppointmentPage() {
  const { appointments = [], user } = data as { appointments?: any[]; user?: { name?: string } }
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({ start: "", end: "" })

  const welcomeName = user?.name

  const filteredAppointments = useMemo(() => {
    const today = new Date()
    const weekStart = startOfDay(new Date(today))
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = endOfDay(new Date(weekStart))
    weekEnd.setDate(weekStart.getDate() + 6)

    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999)

    const startDateFilter = parseDateInput(dateRange.start)
    const endDateFilter = parseDateInput(dateRange.end)
    const startTimeFilter = parseTimeInput(timeRange.start)
    const endTimeFilter = parseTimeInput(timeRange.end)
    const query = search.trim().toLowerCase()

    const matchesPreset = (aptDate: Date | null) => {
      if (!aptDate) return activeFilter === "All"
      switch (activeFilter) {
        case "Today":
          return isSameDay(aptDate, today)
        case "Tomorrow": {
          const tomorrow = new Date(today)
          tomorrow.setDate(today.getDate() + 1)
          return isSameDay(aptDate, tomorrow)
        }
        case "This Week":
          return aptDate >= weekStart && aptDate <= weekEnd
        case "Current Month":
          return aptDate >= currentMonthStart && aptDate <= currentMonthEnd
        case "Last Month":
          return aptDate >= lastMonthStart && aptDate <= lastMonthEnd
        case "Past Bookings":
          return aptDate < startOfDay(today)
        case "Future Bookings":
          return aptDate > endOfDay(today)
        default:
          return true
      }
    }

    const getDateTimeValue = (apt: any) => {
      const date = parseDateString(apt.appointment_date)
      const time = parseTimeString(apt.appointment_time) ?? 0
      return (date?.getTime() ?? 0) + time * 60_000
    }

    const result = appointments.filter((apt) => {
      const aptDate = parseDateString(apt.appointment_date)
      const aptTime = parseTimeString(apt.appointment_time)

      if (query) {
        const searchable = [
          apt.patient_name,
          apt.appointment_type,
          apt.appointment_status,
          apt.patient_phone,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase())

        if (!searchable.some((value) => value.includes(query))) {
          return false
        }
      }

      if (!matchesPreset(aptDate)) {
        return false
      }

      if (startDateFilter && (!aptDate || aptDate < startDateFilter)) {
        return false
      }

      if (endDateFilter && (!aptDate || aptDate > endDateFilter)) {
        return false
      }

      if (startTimeFilter !== null) {
        if (aptTime === null || aptTime < startTimeFilter) {
          return false
        }
      }

      if (endTimeFilter !== null) {
        if (aptTime === null || aptTime > endTimeFilter) {
          return false
        }
      }

      return true
    })

    return result.sort((a, b) => getDateTimeValue(b) - getDateTimeValue(a))
  }, [appointments, activeFilter, dateRange.end, dateRange.start, search, timeRange.end, timeRange.start])

  const filteredTotal = filteredAppointments.length
  const filteredCancelledCount = useMemo(
    () =>
      filteredAppointments.filter((apt) =>
        cancelledStatuses.has((apt.appointment_status || "").toLowerCase()),
      ).length,
    [filteredAppointments],
  )
  const filteredCompletionRate = filteredTotal
    ? Math.round(((filteredTotal - filteredCancelledCount) / filteredTotal) * 100)
    : 0
  const showDateRange = !(activeFilter === "Today" || activeFilter === "Tomorrow")

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mt-1">
          {welcomeName ? `Welcome back, ${welcomeName}!` : "Welcome back!"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Let’s stay on top of today’s schedule, review recent activity, and jump into any urgent appointments.
        </p>
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Athena Appointments</h1>
        <p className="text-sm text-muted-foreground">Review and manage every appointment flowing in from Athena.</p>
      </div>

      <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option}
                variant={activeFilter === option ? "default" : "outline"}
                size="sm"
                className={`text-xs font-medium ${
                  activeFilter === option
                    ? "bg-primary text-primary neumorphic-pressed"
                    : "neumorphic-soft"
                }`}
                onClick={() => setActiveFilter(option)}
              >
                {option}
              </Button>
            ))}
            </div>
            <div className="w-full lg:w-72">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search appointments..."
                className="neumorphic-inset border-0 shadow-none"
              />
            </div>
          </div>

          <div className={`grid gap-4 ${showDateRange ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
            {showDateRange && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date Range</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-primary px-2"
                    disabled={!dateRange.start && !dateRange.end}
                    onClick={() => setDateRange({ start: "", end: "" })}
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(event) => setDateRange((prev) => ({ ...prev, start: event.target.value }))}
                    className="neumorphic-inset border-0 shadow-none"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(event) => setDateRange((prev) => ({ ...prev, end: event.target.value }))}
                    className="neumorphic-inset border-0 shadow-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time Range</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary px-2"
                  disabled={!timeRange.start && !timeRange.end}
                  onClick={() => setTimeRange({ start: "", end: "" })}
                >
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={timeRange.start}
                  onChange={(event) => setTimeRange((prev) => ({ ...prev, start: event.target.value }))}
                  className="neumorphic-inset border-0 shadow-none"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={timeRange.end}
                  onChange={(event) => setTimeRange((prev) => ({ ...prev, end: event.target.value }))}
                  className="neumorphic-inset border-0 shadow-none"
                />
              </div>
            </div>
          </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Appointments", value: filteredTotal },
          { label: "Cancelled", value: filteredCancelledCount },
          { label: "Completion Rate", value: `${filteredCompletionRate}%` },
        ].map((stat) => (
          <div key={stat.label} className="neumorphic-inset border-0 rounded-2xl p-4">
            <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="neumorphic-inset border-0 rounded-2xl p-4 md:p-6">
        {/* <div className="flex flex-col gap-1 pb-4">
          <p className="text-base font-semibold">Appointments</p>
          <p className="text-sm text-muted-foreground">
            {filteredAppointments.length} result{filteredAppointments.length === 1 ? "" : "s"} shown
          </p>
        </div> */}
        <div className="overflow-x-auto">
          {filteredAppointments.length > 0 ? (
            <div className="max-h-[68vh] overflow-y-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="sticky top-0 z-10 backdrop-blur-sm">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-muted/60">
                    <th className="py-3 pr-4 font-medium">Patient</th>
                    <th className="py-3 pr-4 font-medium">Date of Birth</th>
                    <th className="py-3 pr-4 font-medium">Visit Type</th>
                    <th className="py-3 pr-4 font-medium">Date &amp; Time</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 font-medium">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt, index) => (
                    <tr key={`${apt.patient_name}-${apt.appointment_date}-${apt.appointment_time}-${index}`} className="border-b border-muted/30 last:border-b-0">
                      <td className="py-4 pr-4 align-top">
                        <div className="font-semibold text-foreground">{apt.patient_name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{apt.appointment_type || "Follow Up"}</div>
                      </td>
                      <td className="py-4 pr-4 align-top text-muted-foreground">
                        {apt.patient_dob?.trim() || "—"}
                      </td>
                      <td className="py-4 pr-4 align-top text-muted-foreground">{apt.appointment_type || "—"}</td>
                      <td className="py-4 pr-4 align-top">
                        <div className="font-medium text-sm">{apt.appointment_date || "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {apt.appointment_time ? `${apt.appointment_time} (${apt.duration ?? 0} min)` : "—"}
                        </div>
                      </td>
                      <td className="py-4 pr-4 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            apt.appointment_status,
                          )}`}
                        >
                          {apt.appointment_status || "—"}
                        </span>
                      </td>
                      <td className="py-4 align-top text-muted-foreground">{apt.patient_phone?.trim() || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground">No appointments match your filters.</div>
          )}
        </div>
      </div>
    </div>
  )
}

