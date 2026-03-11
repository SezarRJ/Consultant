import { ReactNode } from "react"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"

interface Props {
  children: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <TopBar />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
