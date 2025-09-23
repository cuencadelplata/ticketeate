import { Sidebar } from '@/components/design-system/sidebar';
import { IconsSection } from '@/components/design-system/sections/icons';

export default function IconsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 max-w-6xl">
          <IconsSection />
        </div>
      </div>
    </div>
  );
}
