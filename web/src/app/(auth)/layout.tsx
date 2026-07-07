export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-hidden flex items-center justify-center">
      {children}
    </div>
  );
}
