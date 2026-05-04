import { FC } from 'react';
import MessageResponse from '../../types/MessageType';

interface ReactionBarProps {
  message: MessageResponse;
  currentUserId?: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

interface ReactionGroup {
  emoji: string;
  count: number;
  hasUserReacted: boolean;
  reactionId: string;
}

export const ReactionBar: FC<ReactionBarProps> = ({ 
  message, 
  currentUserId, 
  onAddReaction, 
  onRemoveReaction 
}) => {
  const reactions = message.reactions || [];
  
  // Group reactions by emoji
  const groupedReactions = reactions.reduce<ReactionGroup[]>((acc, reaction) => {
    const existing = acc.find(g => g.emoji === reaction.emoji);
    if (existing) {
      existing.count++;
      if (reaction.userId === currentUserId) {
        existing.hasUserReacted = true;
        existing.reactionId = reaction.id;
      }
    } else {
      acc.push({
        emoji: reaction.emoji,
        count: 1,
        hasUserReacted: reaction.userId === currentUserId,
        reactionId: reaction.id
      });
    }
    return acc;
  }, []);

  const handleReactionClick = (group: ReactionGroup) => {
    if (group.hasUserReacted) {
      onRemoveReaction(message.id, group.emoji);
    } else {
      onAddReaction(message.id, group.emoji);
    }
  };

  if (groupedReactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {groupedReactions.map((group, idx) => (
        <button
          key={`${group.emoji}-${idx}`}
          onClick={() => handleReactionClick(group)}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors ${
            group.hasUserReacted 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <span>{group.emoji}</span>
          <span>{group.count}</span>
        </button>
      ))}
    </div>
  );
};
