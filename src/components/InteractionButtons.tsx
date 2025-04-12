import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { interactions } from '../services/api';
import useFingerprint from '../hooks/useFingerprint';

interface InteractionButtonsProps {
  contentId: string;
  initialLikes?: number;
  initialComments?: number;
  onCommentClick?: () => void;
}

export default function InteractionButtons({
  contentId,
  initialLikes = 0,
  initialComments = 0,
  onCommentClick
}: InteractionButtonsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const fingerprint = useFingerprint();

  useEffect(() => {
    const checkInteractions = async () => {
      try {
        const data = await interactions.getForContent(contentId);
        setLikes(data.interactions.likes);
        setComments(data.interactions.comments.length);
        
        // Check if the current user has liked the content
        const hasLiked = await interactions.getForContent(contentId);
        setIsLiked(hasLiked.liked);
      } catch (error) {
        console.error('Error fetching interactions:', error);
      }
    };

    checkInteractions();
  }, [contentId]);

  const handleLike = async () => {
    try {
      const response = await interactions.recordInteraction({
        contentId,
        fingerprint,
        action: 'like'
      });

      setLikes(response.interactions.likes);
      setIsLiked(response.liked);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isLiked
            ? 'bg-blue-100 text-blue-600'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
      >
        <ThumbsUp size={20} />
        <span>{likes}</span>
      </button>
      
      <button
        onClick={onCommentClick}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
      >
        <MessageCircle size={20} />
        <span>{comments}</span>
      </button>
    </div>
  );
}