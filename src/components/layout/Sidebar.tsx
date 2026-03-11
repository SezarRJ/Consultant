import { Cpu } from "lucide-react"
import { NavLink } from "react-router-dom"

const links = [
  { name: "Dashboard", path: "/" },
  { name: "Clients", path: "/clients" },
  { name: "Agents", path: "/agents" },
  { name: "Knowledge", path: "/knowledge" },
  { name: "Settings", path: "/settings" },
]

export default function Sidebar() {
  return (
    <aside className="w-[240px] bg-[#1B2A4A] text-white flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b border-blue-900">
        <Cpu />
        <span className="font-semibold">AI Consulting Brain</span>
      </div>

      <nav className="flex flex-col mt-4">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `px-4 py-3 text-sm ${
                isActive
                  ? "bg-blue-800 border-l-4 border-blue-400"
                  : "text-gray-300 hover:bg-blue-900"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
