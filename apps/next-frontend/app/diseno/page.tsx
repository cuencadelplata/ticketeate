import { Sidebar } from '@/components/design-system/sidebar';
import { MainContent } from '@/components/design-system/main-content';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}
