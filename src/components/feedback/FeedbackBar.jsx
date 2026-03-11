import { useState } from 'react';
import { ThumbsUp, Minus, ThumbsDown } from 'lucide-react';
import { useSubmitFeedback } from '@/hooks/useFeedback';

export const FeedbackBar = ({ entityType, entityId, agentName, compact = false }) => {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: submitFeedback, isPending } = useSubmitFeedback();

  const handleFeedback = (rating) => {
    submitFeedback(
      {
        entity_type: entityType,
        entity_id: entityId,
        agent_name: agentName,
        rating,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 2000);
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
        <span className="text-green-600">Thanks ★</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${compact ? 'gap-0.5' : ''}`}>
      {!compact && <span className="text-xs text-gray-500">Was this helpful?</span>}
      <button
        onClick={() => handleFeedback('accurate')}
        disabled={isPending}
        className="p-1 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
        title="Accurate"
      >
        <ThumbsUp size={compact ? 16 : 20} className="text-gray-400 hover:text-green-600" />
      </button>
      <button
        onClick={() => handleFeedback('partial')}
        disabled={isPending}
        className="p-1 hover:bg-yellow-100 rounded transition-colors disabled:opacity-50"
        title="Partial"
      >
        <Minus size={compact ? 16 : 20} className="text-gray-400 hover:text-yellow-600" />
      </button>
      <button
        onClick={() => handleFeedback('inaccurate')}
        disabled={isPending}
        className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
        title="Inaccurate"
      >
        <ThumbsDown size={compact ? 16 : 20} className="text-gray-400 hover:text-red-600" />
      </button>
    </div>
  );
};
