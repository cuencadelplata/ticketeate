import { Sidebar } from "@/components/design-system/sidebar"
import { BrandAssetsSection } from "@/components/design-system/sections/brand-assets"

export default function BrandAssetsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 max-w-6xl">
          <BrandAssetsSection />
        </div>
      </div>
    </div>
  )
}
