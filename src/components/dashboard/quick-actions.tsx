import Link from "next/link";
import { Upload, UserPlus, FileText, Activity } from "lucide-react";

const actions = [
  {
    href: "/prescriptions/upload",
    label: "Upload Prescription",
    description: "Scan a handwritten Rx",
    icon: Upload,
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    href: "/patients",
    label: "Add Patient",
    description: "Register a new patient",
    icon: UserPlus,
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    href: "/prescriptions?status=review",
    label: "Review Queue",
    description: "Pending AI extractions",
    icon: Activity,
    color: "bg-yellow-500 hover:bg-yellow-600",
  },
  {
    href: "/prescriptions",
    label: "All Records",
    description: "Browse all prescriptions",
    icon: FileText,
    color: "bg-purple-600 hover:bg-purple-700",
  },
];

export function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {actions.map(({ href, label, description, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className={`${color} rounded-lg p-3.5 text-white transition-colors flex flex-col gap-1.5`}
          >
            <Icon className="h-5 w-5" />
            <p className="text-xs font-semibold leading-tight">{label}</p>
            <p className="text-[10px] opacity-80 leading-tight">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
