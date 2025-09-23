import { Sidebar } from '@/components/design-system/sidebar';
import { ComponentsSection } from '@/components/design-system/sections/components';

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 max-w-6xl">
          <ComponentsSection />
        </div>
      </div>
    </div>
  );
}
