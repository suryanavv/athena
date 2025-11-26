import * as React from "react"
import {
  IconCalendar,
  IconClipboardList,
  IconDashboard,
  IconLogs,
  IconMedicalCross,
  IconSettings,
  IconUser,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import data from "@/data.json"

const { app } = data

// Create icon mapping for navMain data
const iconMap = {
  IconDashboard,
  IconUsers,
  IconCalendar,
  IconLogs,
  IconUser,
  IconClipboardList,
  IconSettings,
}

// Transform navMain data to include actual icon components
const transformedData = {
  ...data,
  navMain: data.navMain.map(item => ({
    ...item,
    icon: iconMap[item.icon as keyof typeof iconMap]
  }))
}

export function AppSidebar({
  onPageChange,
  currentPage,
  onLogout,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  onPageChange?: (page: string) => void
  currentPage?: string
  onLogout?: () => void
}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconMedicalCross className="!size-5" />
                <span className="text-base font-semibold">{app.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={transformedData.navMain}
          onPageChange={onPageChange}
          currentPage={currentPage}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={transformedData.user} onLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
