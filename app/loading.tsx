export default function Loading() {
  // return <div>Loading...</div>
  // Return a fancier loading screen using Tailwind's skeleton loaders
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-4 w-3/4 rounded bg-gray-300"></div>
      <div className="mb-4 h-4 w-1/2 rounded bg-gray-300"></div>
      <div className="mb-4 h-4 w-5/6 rounded bg-gray-300"></div>
      <div className="mb-4 h-4 w-3/4 rounded bg-gray-300"></div>
      <div className="mb-4 h-4 w-1/2 rounded bg-gray-300"></div>
      <div className="mb-4 h-4 w-5/6 rounded bg-gray-300"></div>
    </div>
  )
}
