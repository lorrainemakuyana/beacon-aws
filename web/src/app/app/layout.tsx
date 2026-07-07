export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8">{children}</div>
  );
}
