import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getLessonEvaluation, getLearningNotes, saveLearningNote, submitLessonEvaluation } from '../api/learning.js'
import { useAuth } from '../context/AuthContext.jsx'
import LearningResource from './LearningResource.jsx'

function LessonLearningPanel({ step, onContinue }) {
  const { user } = useAuth()
  const canSubmit = user?.role === 'student' || user?.role === 'mentor'
  const [note, setNote] = useState('')
  const [answers, setAnswers] = useState({})
  const [feedback, setFeedback] = useState('')
  const [latestAttempt, setLatestAttempt] = useState(null)
  const [checkpointPrompt, setCheckpointPrompt] = useState(null)
  const [videoProgress, setVideoProgress] = useState(0)
  const [playerControls, setPlayerControls] = useState(null)

  const evaluationQuery = useQuery({
    queryKey: ['lesson-evaluation', step.id],
    queryFn: () => getLessonEvaluation(step.id),
    enabled: Boolean(step.id),
  })
  const notesQuery = useQuery({
    queryKey: ['learning-notes', step.id],
    queryFn: () => getLearningNotes(step.id),
    enabled: Boolean(user && step.id),
  })
  const noteMutation = useMutation({
    mutationFn: () => saveLearningNote({ pathway_step_id: step.id, body: note.trim() }),
    onSuccess: () => setFeedback('Note saved to your learning space.'),
    onError: (error) => setFeedback(error?.response?.data?.message || 'Unable to save your note.'),
  })
  const evaluationMutation = useMutation({
    mutationFn: () => submitLessonEvaluation(step.id, answers),
    onSuccess: (response) => {
      setLatestAttempt(response.data)
      setFeedback(`You scored ${response.data.score}/${response.data.max_score} (${response.data.percentage}%).`)
      if (response.data.passed) {
        setCheckpointPrompt(null)
        playerControls?.play()
      }
    },
    onError: (error) => setFeedback(error?.response?.data?.message || 'Unable to submit this evaluation.'),
  })

  useEffect(() => {
    const previousAttempt = evaluationQuery.data?.attempt
    if (previousAttempt) {
      setAnswers(previousAttempt.answers || {})
    }
  }, [evaluationQuery.data?.attempt])

  useEffect(() => {
    const savedNote = notesQuery.data?.data?.[0]
    if (savedNote) {
      setNote(savedNote.body)
    }
  }, [notesQuery.data?.data])

  const evaluations = evaluationQuery.data?.data || []
  const availableEvaluations = evaluations.filter((evaluation) => videoProgress >= (evaluation.unlock_at_seconds || 0))
  const nextEvaluation = evaluations.find((evaluation) => videoProgress < (evaluation.unlock_at_seconds || 0))
  const previousAttempt = latestAttempt || evaluationQuery.data?.attempt

  useEffect(() => {
    if (!canSubmit || checkpointPrompt || evaluationMutation.isPending) return

    const unansweredCheckpoint = availableEvaluations.find((evaluation) => !answers[evaluation.id])

    if (unansweredCheckpoint) {
      setCheckpointPrompt(unansweredCheckpoint)
    }
  }, [answers, availableEvaluations, canSubmit, checkpointPrompt, evaluationMutation.isPending, playerControls])

  useEffect(() => {
    const unansweredCheckpoint = availableEvaluations.find((evaluation) => !answers[evaluation.id])

    if (canSubmit && unansweredCheckpoint && playerControls) {
      playerControls.pause()
    }
  }, [answers, availableEvaluations, canSubmit, playerControls])

  const selectAnswer = (evaluationId, option) => {
    setAnswers((current) => ({ ...current, [evaluationId]: option }))
  }

  const submitEvaluation = () => evaluationMutation.mutate()

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <LearningResource
        type={step.resource_type}
        url={step.resource_link}
        onTimeUpdate={setVideoProgress}
        onPlayerReady={setPlayerControls}
      />
      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="bridge-kicker text-amber-800">YOUR NOTES</p>
            <h4 className="mt-1 font-semibold text-slate-950">Capture the useful bits</h4>
          </div>
          {!user ? <span className="text-xs font-semibold text-slate-500">Sign in to save</span> : null}
        </div>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows="5"
          placeholder="Write a takeaway, question, or next step..."
          className="mt-3 w-full resize-y rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-400"
        />
        <button
          type="button"
          disabled={!user || !note.trim() || noteMutation.isPending}
          onClick={() => noteMutation.mutate()}
          className="bridge-dark-button mt-3 rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          {noteMutation.isPending ? 'Saving...' : 'Save note'}
        </button>
      </section>

      <section className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="bridge-kicker text-sky-800">CHECK YOUR UNDERSTANDING</p>
            <h4 className="mt-1 font-semibold text-slate-950">Quick evaluation</h4>
          </div>
          {previousAttempt ? <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-sky-800">{previousAttempt.percentage}%</span> : null}
        </div>

        {evaluationQuery.isLoading ? <p className="mt-4 text-sm text-slate-500">Loading evaluation...</p> : null}
        {!evaluationQuery.isLoading && evaluations.length === 0 ? <p className="mt-4 text-sm text-slate-600">This lesson does not have an evaluation yet.</p> : null}
        {nextEvaluation ? <p className="mt-3 rounded-xl border border-sky-200 bg-white/70 px-3 py-2 text-xs font-semibold text-sky-900">Keep watching. The next question unlocks at {Math.floor(nextEvaluation.unlock_at_seconds / 60)}:{String(nextEvaluation.unlock_at_seconds % 60).padStart(2, '0')}.</p> : null}
        <div className="mt-3 space-y-4">
          {availableEvaluations.map((evaluation) => (
            <fieldset key={evaluation.id}>
              <legend className="text-sm font-semibold leading-6 text-slate-900">{evaluation.position}. {evaluation.question}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {evaluation.options.map((option) => (
                  <label key={option} className={`cursor-pointer rounded-xl border px-3 py-2 text-sm transition ${answers[evaluation.id] === option ? 'border-[#0e4770] bg-white text-[#0e4770]' : 'border-sky-100 bg-white/70 text-slate-700 hover:border-sky-300'}`}>
                    <input
                      type="radio"
                      name={`evaluation-${evaluation.id}`}
                      value={option}
                      checked={answers[evaluation.id] === option}
                      onChange={() => selectAnswer(evaluation.id, option)}
                      className="mr-2 accent-[#0e4770]"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        {availableEvaluations.length > 0 ? (
          <button
            type="button"
            disabled={!canSubmit || evaluationMutation.isPending || availableEvaluations.some((evaluation) => !answers[evaluation.id])}
            onClick={submitEvaluation}
            className="bridge-primary-button mt-4 rounded-full px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
          >
            {!user ? 'Sign in to submit' : evaluationMutation.isPending ? 'Marking...' : 'Submit evaluation'}
          </button>
        ) : null}
        {previousAttempt?.passed ? (
          <button
            type="button"
            onClick={onContinue}
            className="mt-3 block text-sm font-bold text-[#0e4770] underline decoration-orange-400 decoration-2 underline-offset-4"
          >
            Unit passed. Continue to next unit →
          </button>
        ) : null}
      </section>

      {feedback ? <p className="text-sm font-semibold text-[#0e4770] lg:col-span-2" role="status">{feedback}</p> : null}

      {checkpointPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#082f49]/70 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={`checkpoint-${step.id}`}>
          <div className="w-full max-w-lg rounded-3xl border border-orange-200 bg-[#fffaf2] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="bridge-kicker text-orange-700">UNIT CHECKPOINT</p>
                <h3 id={`checkpoint-${step.id}`} className="bridge-display mt-2 text-2xl font-semibold text-slate-950">Pause and show what you know</h3>
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-900">{checkpointPrompt.points} marks</span>
            </div>
            <p className="mt-5 text-base font-semibold leading-7 text-slate-900">{checkpointPrompt.question}</p>
            <div className="mt-4 space-y-2">
              {checkpointPrompt.options.map((option) => (
                <label key={option} className={`block cursor-pointer rounded-2xl border px-4 py-3 text-sm font-semibold transition ${answers[checkpointPrompt.id] === option ? 'border-[#0e4770] bg-sky-50 text-[#0e4770]' : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300'}`}>
                  <input
                    type="radio"
                    name={`checkpoint-${checkpointPrompt.id}`}
                    value={option}
                    checked={answers[checkpointPrompt.id] === option}
                    onChange={() => selectAnswer(checkpointPrompt.id, option)}
                    className="mr-3 accent-[#0e4770]"
                  />
                  {option}
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setCheckpointPrompt(null)} className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Answer later</button>
              <button type="button" disabled={!answers[checkpointPrompt.id] || evaluationMutation.isPending} onClick={submitEvaluation} className="bridge-primary-button rounded-full px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">
                {evaluationMutation.isPending ? 'Marking...' : 'Submit answer'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  )
}

export default LessonLearningPanel
