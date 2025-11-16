'use client'

import { useState, useEffect } from 'react'

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/results')
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
        <p className="mt-1 text-sm text-gray-500">
          View all candidate test results
        </p>
      </div>

      {results.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-gray-500">No results yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {result.testSession.candidate.name}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        result.passed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {result.testSession.assessment.title}
                  </p>

                  <div className="mt-4 grid grid-cols-5 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {result.score.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {result.grade}
                      </div>
                      <div className="text-xs text-gray-600">Grade</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {result.correctAnswers}
                      </div>
                      <div className="text-xs text-gray-600">Correct</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {result.wrongAnswers}
                      </div>
                      <div className="text-xs text-gray-600">Wrong</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {result.skippedQuestions}
                      </div>
                      <div className="text-xs text-gray-600">Skipped</div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Completed:{' '}
                    {new Date(result.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
