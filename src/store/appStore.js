import { create } from "zustand"

interface AppState {
  pageTitle: string
  setPageTitle: (title: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  pageTitle: "Dashboard",
  setPageTitle: (title) => set({ pageTitle: title }),
}))
