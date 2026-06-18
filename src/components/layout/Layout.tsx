import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="app" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}

export function LandingLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="landing" />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
