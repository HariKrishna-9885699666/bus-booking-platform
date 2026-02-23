export default function BookingsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-8" />
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="space-y-3">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
