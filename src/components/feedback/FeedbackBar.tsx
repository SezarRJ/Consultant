import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useState } from "react"
import api from "@/lib/api"

interface Props {
  entityType: string
  entityId: string
  agentName?: string
  compact?: boolean
}

export default function FeedbackBar({
  entityType,
  entityId,
  agentName,
  compact = false,
}: Props) {
  const [submitted, setSubmitted] = useState(false)

  async function sendFeedback(score: number) {
    await api.post("/feedback", {
      entityType,
      entityId,
      agentName,
      score,
    })

    setSubmitted(true)
  }

  if (submitted) return <span className="text-xs">Thanks ★</span>

  return (
    <div className="flex items-center gap-2">
      {!compact && <span className="text-xs text-gray-500">Feedback</span>}

      <ThumbsUp
        className="w-4 h-4 cursor-pointer"
        onClick={() => sendFeedback(1)}
      />

      <ThumbsDown
        className="w-4 h-4 cursor-pointer"
        onClick={() => sendFeedback(-1)}
      />
    </div>
  )
}
