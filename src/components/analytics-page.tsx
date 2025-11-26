import { IconCalendar, IconMedicalCross, IconUsers, IconX } from "@tabler/icons-react"

// Helper function to get icon component by name
const getIcon = (iconName: string) => {
  const icons = {
    IconUsers,
    IconMedicalCross,
    IconCalendar,
    IconX,
  }
  return icons[iconName as keyof typeof icons] || IconUsers
}
import { PieChart, Pie, Cell, Bar, BarChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { useState, useEffect } from "react"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart"
import type {
  ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import data from "@/data.json"

// Destructure data from imported JSON
const { api_cancellation_count } = data
const appointments = data.appointments || []

// Transform API cancellation count data for chart
const apiAppointmentsData = [
  { type: "scheduled", count: api_cancellation_count.scheduled },
  { type: "rescheduled", count: api_cancellation_count.rescheduled },
  { type: "cancelled", count: api_cancellation_count.cancelled }
]

// Generate dynamic Y-axis ticks based on max value
const generateDynamicTicks = (maxValue: number) => {
  const ticks = [0]
  let currentTick = 6
  while (currentTick <= maxValue + 6) {
    ticks.push(currentTick)
    currentTick += 6
  }
  return ticks
}

const patientChartConfig = {
  value: {
    label: "Patients",
  },
} satisfies ChartConfig

const monthlyComparisonChartConfig = {
  appointments: {
    label: "Appointments",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig

const apiAppointmentsChartConfig = {
  scheduled: {
    label: "Scheduled",
    color: "var(--color-chart-1)",
  },
  rescheduled: {
    label: "Rescheduled",
    color: "var(--color-chart-2)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

interface AnalyticsPageProps {
  onPageChange?: (page: string) => void
}

export function AnalyticsPage({ onPageChange }: AnalyticsPageProps) {
  const { dashboard } = data
  const [selectedPieSlice, setSelectedPieSlice] = useState<string | null>(null)
  const [selectedBar, setSelectedBar] = useState<string | null>(null)
  const [selectedAppointmentFilter, setSelectedAppointmentFilter] = useState('Today')
  const [chartSize, setChartSize] = useState({ innerRadius: 20, outerRadius: 45 })


  // Cancellation reasons data (converted from your source)
const rawCancellationReasons = [
  { reason_name: "CANCELLED FROM API", count: 37 },
  { reason_name: "TEST CANCELLATION", count: 1 },
  { reason_name: "PATIENT CANCELED APPOINTMENT", count: 1 },
  { reason_name: "RESCHEDULED FROM API", count: 30 }
];

// simple color palette — change to match your theme if needed
const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"];

const cancellationData = rawCancellationReasons.map((r, i) => ({
  name: r.reason_name,
  value: r.count,
  color: colors[i % colors.length]
}));


  // Responsive chart size based on screen size
  useEffect(() => {
    const updateChartSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        // Mobile: small screens
        setChartSize({ innerRadius: 15, outerRadius: 35 })
      } else if (width < 768) {
        // Small tablets
        setChartSize({ innerRadius: 18, outerRadius: 40 })
      } else if (width < 1024) {
        // Tablets
        setChartSize({ innerRadius: 20, outerRadius: 45 })
      } else {
        // Desktop: large screens
        setChartSize({ innerRadius: 25, outerRadius: 55 })
      }
    }

    updateChartSize()
    window.addEventListener('resize', updateChartSize)

    return () => window.removeEventListener('resize', updateChartSize)
  }, [])

  // Filter appointments based on selected filter
  const getFilteredAppointments = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    // Get start of current week (Sunday)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    // Get end of current week (Saturday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    }

    const todayStr = formatDate(today)
    const tomorrowStr = formatDate(tomorrow)

    const parseAppointmentDate = (dateStr: string) => {
      const [month, day, year] = dateStr.split('/').map(Number)
      return new Date(year, month - 1, day)
    }

    switch (selectedAppointmentFilter) {
      case 'Today':
        return appointments.filter(apt => apt.appointment_date === todayStr).slice(0, 5)
      case 'Tomorrow':
        return appointments.filter(apt => apt.appointment_date === tomorrowStr).slice(0, 5)
      case 'This Week':
        return appointments.filter(apt => {
          const aptDate = parseAppointmentDate(apt.appointment_date)
          return aptDate >= startOfWeek && aptDate <= endOfWeek
        }).slice(0, 8)
      default:
        return appointments.slice(0, 5)
    }
  }


  const handlePieClick = (data: any) => {
    if (data && data.name) {
      setSelectedPieSlice(selectedPieSlice === data.name ? null : data.name)
    }
  }



  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards Section */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {dashboard.stats.map((stat) => {
            const IconComponent = getIcon(stat.icon)
            const handleCardClick = () => {
              if (stat.id === "totalPatients" && onPageChange) {
                onPageChange("patients")
              } else if (stat.id === "totalAppointments" && onPageChange) {
                onPageChange("appointments")
              }
            }

            const isClickable = stat.id === "totalPatients" || stat.id === "totalAppointments"

            return (
              <div
                key={stat.id}
                className={`neumorphic-inset p-4 neumorphic-hover transition-all duration-200 ${
                  isClickable ? "cursor-pointer" : ""
                }`}
                onClick={isClickable ? handleCardClick : undefined}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconComponent className="size-4" />
                    {stat.label}
                  </div>
                  <div className="text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                    {stat.value}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* All Charts and Sections */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 px-4 lg:px-6 xl:grid-cols-3">
        {/* Monthly Appointment Comparison */}
        <Card className="neumorphic-inset border-0">
          <CardHeader>
            <CardTitle>
              {dashboard.sections.monthlyAppointmentComparison.title}
            </CardTitle>
            <CardDescription>
              Current Month: {dashboard.sections.monthlyAppointmentComparison.current_month} |
              Last Month: {dashboard.sections.monthlyAppointmentComparison.last_month} |
              Change: {dashboard.sections.monthlyAppointmentComparison.percentage_change}%
            </CardDescription>
          </CardHeader>
          <CardContent className="-ml-10 flex justify-center items-center">
            <ChartContainer config={monthlyComparisonChartConfig} className="h-[350px] w-full">
              <LineChart
                accessibilityLayer
                data={dashboard.sections.monthlyAppointmentComparison.data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.8} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 120]}
                  ticks={[0, 20, 40, 60, 80, 100, 120]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" className="neumorphic-card border-0 shadow-none" />}
                />
                <Line
                  dataKey="appointments"
                  type="monotone"
                  stroke="var(--color-chart-1)"
                  strokeWidth={3}
                  dot={{
                    fill: "var(--color-chart-1)",
                    strokeWidth: 2,
                    r: 6,
                  }}
                  activeDot={{
                    r: 8,
                    stroke: "var(--color-chart-1)",
                    strokeWidth: 2,
                    fill: "var(--background)",
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>



        {/* Second Row */}
        {/* API Appointments Counts */}
        <Card className="neumorphic-inset border-0">

          <CardHeader>
            <CardTitle>
              API Appointments Counts
            </CardTitle>
            <CardDescription>
              Total appointments from API - Scheduled: {api_cancellation_count.scheduled}, Rescheduled: {api_cancellation_count.rescheduled}, Cancelled: {api_cancellation_count.cancelled}
            </CardDescription>
          </CardHeader>
          <CardContent className="-ml-4 flex justify-center items-center">
            <ChartContainer config={apiAppointmentsChartConfig} className="h-[250px] w-full sm:h-[280px] lg:h-[320px]">
              <BarChart
                accessibilityLayer
                data={apiAppointmentsData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 'dataMax + 6']}
                  ticks={generateDynamicTicks(Math.max(...apiAppointmentsData.map(d => d.count)))}
                />
                <XAxis
                  dataKey="type"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.8} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" className="neumorphic-card border-0 shadow-none" />}
                />
                <Bar dataKey="count" radius={4}>
                  {apiAppointmentsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.type === 'scheduled' ? 'var(--color-chart-1)' :
                        entry.type === 'rescheduled' ? 'var(--color-chart-2)' :
                        'var(--destructive)'
                      }
                    />
                  ))}
                </Bar>
                {/* <ChartLegend /> */}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Cancellation Reasons */}
<Card className="neumorphic-inset border-0">
  <CardHeader>
    <CardTitle>Cancellation Reasons</CardTitle>
    <CardDescription>
      <span className="flex items-center gap-2">
        <IconUsers className="size-4" />
        Total Cancellations: 69
      </span>
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex flex-col gap-2">
      <div className="flex-shrink-0 mx-auto sm:mx-0 flex justify-center">
        <ChartContainer
          config={patientChartConfig}
          className="h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] md:h-[140px] md:w-[140px] lg:h-[160px] lg:w-[160px]"
        >
          <PieChart>
            <Pie
              data={cancellationData}
              cx="50%"
              cy="50%"
              innerRadius={chartSize.innerRadius}
              outerRadius={chartSize.outerRadius}
              paddingAngle={5}
              dataKey="value"
              onClick={handlePieClick}
              style={{ cursor: 'pointer' }}
            >
              {cancellationData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={selectedPieSlice === null || selectedPieSlice === entry.name ? 1 : 0.6}
                  stroke={selectedPieSlice === entry.name ? '#000' : 'none'}
                  strokeWidth={selectedPieSlice === entry.name ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="neumorphic-card rounded-lg p-3">
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.value} cancellations</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to {selectedPieSlice === data.name ? 'deselect' : 'focus'}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ChartContainer>
      </div>

      <div className="flex-1 space-y-3">
        {cancellationData.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between text-sm cursor-pointer p-2 rounded-md transition-all duration-200 ${
              selectedPieSlice === item.name ? 'neumorphic-pressed' : 'neumorphic-soft neumorphic-hover neumorphic-active'
            }`}
            onClick={() => handlePieClick({ name: item.name })}
          >
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              {item.name}
            </span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  </CardContent>
</Card>


      </div>

    </div>
  )
}

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="default-multiple-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        className="dark:text-muted/40 text-muted"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
};
