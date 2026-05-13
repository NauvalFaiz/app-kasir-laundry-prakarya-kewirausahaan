import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h1 className="section-title">{title}</h1>}
              {subtitle && <p className="section-sub">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
