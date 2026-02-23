export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-10 w-full bg-white rounded-xl animate-pulse" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
