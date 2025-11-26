import "./App.css"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { AnalyticsPage } from "@/components/analytics-page"
import { AppointmentPage } from "@/components/appointment-page"
import { LogsPage } from "@/components/logs-page"
import { LoginPage } from "@/components/login-page"
import {
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function App() {
  const [currentPage, setCurrentPage] = useState("appointments")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
    setCurrentPage("appointments")
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentPage("appointments")
  }


  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <AnalyticsPage onPageChange={setCurrentPage} />
      case "appointments":
        return <AppointmentPage />
      case "logs":
        return <LogsPage />
      default:
        return <AppointmentPage />
    }
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="floating" onPageChange={setCurrentPage} currentPage={currentPage} onLogout={handleLogout} />
      <main className="flex-1">
        <AppHeader currentPage={currentPage} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col my-2">
            <div className="flex flex-col">
              {renderContent()}

            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}
