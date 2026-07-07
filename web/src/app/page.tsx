import Link from "next/link";
import { CalendarDays, Users, AlertTriangle, ClipboardList, ArrowRight, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Event Management",
    description: "Create and manage events, track status, and keep everything organised in one place.",
  },
  {
    icon: Users,
    title: "Volunteer Coordination",
    description: "Assign volunteers to shifts, track attendance, and manage your team with ease.",
  },
  {
    icon: AlertTriangle,
    title: "Incident Reporting",
    description: "Log and track incidents in real time. Stay on top of safety across all your events.",
  },
  {
    icon: ClipboardList,
    title: "Shift Scheduling",
    description: "Define roles and shift slots, set volunteer quotas, and monitor fill rates instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Access Control",
    description: "Add collaborators by email and scope access so each manager sees only their events.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white flex flex-col flex-1">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <img src="/logo.png" alt="Beacon" className="w-16 h-16 object-contain" />
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Run better events,<br className="hidden sm:block" /> from start to finish.
          </h1>
          <p className="text-lg text-gray-500 max-w-xl">
            Beacon gives event managers a single dashboard to coordinate volunteers, schedule shifts, and respond to incidents — all in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-primary-light transition-colors"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 border border-gray-200 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-t border-gray-100 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Everything you need to run the day
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Ready to get started?</h2>
          <p className="text-gray-500 text-sm">
            Create your coordinator account and have your first event live in minutes.
          </p>
          <Link
            href="/register"
            className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-primary-light transition-colors mt-2"
          >
            Create a free account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
