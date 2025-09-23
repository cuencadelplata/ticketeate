import { Sidebar } from "@/components/design-system/sidebar"
import { ColorsSection } from "@/components/design-system/sections/colors"

export default function ColorsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 max-w-6xl">
          <ColorsSection />
        </div>
      </div>
    </div>
  )
}
