import { Outlet, Link, useLocation } from "react-router-dom"
import { Button } from "../components/ui/button"
import { cn } from "../lib/utils"

const navLinks = [
  { to: "/applications", label: "Applications" },
  { to: "/sign-in", label: "Sign In" },
  { to: "/sign-up", label: "Sign Up" }
]

export const MainLayout = () => {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:flex flex-col p-4">
        <h2 className="text-xl font-semibold mb-6">Vibic</h2>
        <nav className="space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "block px-4 py-2 rounded-md text-sm hover:bg-gray-100",
                location.pathname === link.to ? "bg-gray-200 font-medium" : ""
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 px-6 bg-white shadow-sm flex items-center justify-between">
          <h1 className="text-lg font-semibold">Vibic Platform</h1>
          <Button variant="outline">Logout</Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
