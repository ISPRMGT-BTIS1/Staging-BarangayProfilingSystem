import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'

/**
 * AppShell wraps all authenticated pages.
 * It renders the persistent TopBar + Sidebar, and uses React Router's <Outlet>
 * to render the active page in the main content area.
 *
 * This replaces the old renderActiveView() switch-case in App.jsx.
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-[#FFF8F8] flex flex-col font-sans text-[#1A1A2E]">
      <TopBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-[#FFF8F8]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
