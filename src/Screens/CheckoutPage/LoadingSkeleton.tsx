export default function LoadingSkeleton() {
    return (
      <div className="space-y-4 animate-pulse">
  
        <div className="h-8 bg-[#F1E9D9] rounded-lg w-1/3" />
  
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-xl border border-[#E7DBC0] p-4"
            >
              <div className="flex items-start gap-4">
  
                <div className="w-5 h-5 bg-[#F1E9D9] rounded-full" />
  
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#F1E9D9] rounded w-1/4" />
                  <div className="h-3 bg-[#F1E9D9] rounded w-1/2" />
                  <div className="h-3 bg-[#F1E9D9] rounded w-3/4" />
                </div>
  
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }