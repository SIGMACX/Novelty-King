"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function RatingWidget({ submissionId, initialRating = 0, initialCount = 0 }) {
  const { user } = useAuth();
  const [averageRating, setAverageRating] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(initialCount);
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user's existing rating
  useEffect(() => {
    if (user && submissionId) {
      loadUserRating();
    }
  }, [user, submissionId]);

  const loadUserRating = async () => {
    try {
      const { data, error } = await supabase
        .from('submission_ratings')
        .select('rating')
        .eq('submission_id', submissionId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserRating(data.rating);
      }
    } catch (error) {
      // No rating found, that's okay
    }
  };

  const handleRate = async (rating) => {
    if (!user) {
      alert('请先登录才能评分');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submission_ratings')
        .upsert({
          submission_id: submissionId,
          user_id: user.id,
          rating: rating,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'submission_id,user_id'
        });

      if (error) throw error;

      setUserRating(rating);

      // Reload submission data to get updated average
      const { data: submission, error: subError } = await supabase
        .from('submissions')
        .select('average_rating, rating_count')
        .eq('id', submissionId)
        .single();

      if (submission) {
        setAverageRating(parseFloat(submission.average_rating));
        setRatingCount(submission.rating_count);
      }
    } catch (error) {
      console.error('Error rating submission:', error);
      alert('评分失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderBulb = (position) => {
    const value = position * 0.2; // 0.2, 0.4, 0.6, 0.8, 1.0 for each position in bulb
    const bulbIndex = Math.ceil(position / 5); // Which bulb (1-5)
    const avgInBulbs = averageRating / 1; // Convert to bulbs scale
    const displayRating = hoverRating !== null ? hoverRating : (userRating || averageRating);
    const displayInBulbs = displayRating / 1;

    const isLit = displayInBulbs >= value;
    const isHovered = hoverRating !== null && hoverRating >= value;

    return (
      <button
        key={position}
        className={`bulb-segment ${isLit ? 'lit' : ''} ${isHovered ? 'hovered' : ''}`}
        onClick={() => handleRate(value)}
        onMouseEnter={() => setHoverRating(value)}
        onMouseLeave={() => setHoverRating(null)}
        disabled={loading || !user}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: user ? 'pointer' : 'default',
          opacity: loading ? 0.5 : 1
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isLit ? (isHovered ? '#ffd700' : '#ffed4e') : '#e0e0e0'}
          stroke={isLit ? '#f39c12' : '#bdbdbd'}
          strokeWidth="1"
        >
          {/* Light bulb shape */}
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
        </svg>
      </button>
    );
  };

  return (
    <div className="rating-widget">
      <div className="bulbs-container" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map(pos => renderBulb(pos))}
      </div>
      <div className="rating-info" style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--muted)' }}>
        <span className="lang-en">
          Average: {averageRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
        </span>
        <span className="lang-zh">
          平均分: {averageRating.toFixed(1)} ({ratingCount} 次评分)
        </span>
        {userRating && (
          <>
            <span className="lang-en"> • Your rating: {userRating.toFixed(1)}</span>
            <span className="lang-zh"> • 你的评分: {userRating.toFixed(1)}</span>
          </>
        )}
      </div>

      <style jsx>{`
        .bulb-segment {
          transition: all 0.2s ease;
        }
        .bulb-segment:hover:not(:disabled) {
          transform: scale(1.1);
        }
        .bulb-segment.hovered svg {
          filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8));
        }
      `}</style>
    </div>
  );
}
