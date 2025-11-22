import { Lightbulb } from 'lucide-react'

export function TipsList({ tips }: { tips: string[] }) {
  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="text-yellow-500 fill-yellow-500" />
        <h3 className="text-lg font-bold text-gray-800">AI 절약 팁</h3>
      </div>
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </span>
            <span className="text-gray-700">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}