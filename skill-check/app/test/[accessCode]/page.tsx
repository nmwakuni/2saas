'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'

export default function TestPage({ params }: { params: Promise<{ accessCode: string }> }) {
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [testData, setTestData] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetchTest()
  }, [])

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && testData && !submitted) {
      handleSubmit()
    }
  }, [timeLeft, submitted])

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/test/${resolvedParams.accessCode}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      setTestData(data)
      setTimeLeft(data.assessment.duration * 60) // Convert minutes to seconds
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (submitted) return

    setSubmitted(true)
    const startTime = testData.assessment.duration * 60
    const timeSpent = startTime - timeLeft

    try {
      const res = await fetch(`/api/test/${resolvedParams.accessCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          timeSpent,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(`Error: ${data.error}`)
        setSubmitted(false)
        return
      }

      setResult(data.result)
    } catch (err: any) {
      alert(`Failed to submit: ${err.message}`)
      setSubmitted(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading test...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-8 text-center">
          <span className="mb-4 text-4xl">❌</span>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <div className="max-w-2xl w-full rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mb-6 text-6xl">
              {result.passed ? '🎉' : '📊'}
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {result.passed ? 'Congratulations!' : 'Test Completed'}
            </h1>
            <p className="mb-8 text-gray-600">
              {result.passed
                ? 'You passed the assessment!'
                : 'Thank you for completing the assessment'}
            </p>

            <div className="mb-8 rounded-lg bg-gray-50 p-6">
              <div className="mb-4 text-5xl font-bold text-purple-600">
                {result.score}%
              </div>
              <div className="text-lg font-medium text-gray-900">
                Grade: {result.grade}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="text-2xl font-bold text-green-600">
                  {result.correctAnswers}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="text-2xl font-bold text-red-600">
                  {result.wrongAnswers}
                </div>
                <div className="text-sm text-gray-600">Wrong</div>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {result.skippedQuestions}
                </div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              You will receive your results via SMS shortly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const questions = testData.assessment.questions
  const question = questions[currentQuestion]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {testData.assessment.title}
              </h1>
              <p className="text-sm text-gray-600">
                {testData.invitation.candidateName}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-purple-600'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6 h-2 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-purple-600 transition-all"
            style={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {question.question}
            </h2>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-600">
              {question.points} {question.points === 1 ? 'point' : 'points'}
            </span>
          </div>

          <div className="space-y-3">
            {question.options.map((option: any) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                  answers[question.id] === option.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={(e) =>
                    setAnswers({ ...answers, [question.id]: e.target.value })
                  }
                  className="h-4 w-4 text-purple-600"
                />
                <span className="text-gray-900">{option.text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ← Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitted ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700"
            >
              Next →
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-gray-700">
            Question Navigator
          </p>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`aspect-square rounded-lg border-2 text-sm font-medium ${
                  index === currentQuestion
                    ? 'border-purple-600 bg-purple-600 text-white'
                    : answers[questions[index].id]
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
