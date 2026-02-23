"use client";

export function SeatLegend() {
  const items = [
    {
      label: "Available",
      bgClass: "bg-white border-emerald-400",
      dotClass: "bg-emerald-400",
    },
    {
      label: "Selected",
      bgClass: "bg-blue-500 border-blue-600",
      dotClass: "bg-blue-500",
    },
    {
      label: "Booked",
      bgClass: "bg-gray-200 border-gray-300",
      dotClass: "bg-gray-400",
    },
    {
      label: "Ladies Only",
      bgClass: "bg-pink-50 border-pink-400",
      dotClass: "bg-pink-400",
    },
    {
      label: "Locked",
      bgClass: "bg-amber-100 border-amber-300",
      dotClass: "bg-amber-400",
    },
  ];

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-md border-2 ${item.bgClass} flex items-center justify-center`}
            aria-hidden
          >
            {item.label === "Booked" && (
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {item.label === "Selected" && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-xs text-gray-600 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
