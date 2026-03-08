"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function SimpleRatingWidget({ paperId, initialRating = 0, initialCount = 0, onRate }) {
  const [averageRating, setAverageRating] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(initialCount);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // 检查用户是否已评分
  useEffect(() => {
    const checkUserRating = () => {
      const ratingKey = `rating_${paperId}`;
      const savedRating = localStorage.getItem(ratingKey);
      if (savedRating) {
        setUserRating(parseFloat(savedRating));
        setHasRated(true);
      }
    };
    checkUserRating();
  }, [paperId]);

  const handleStarClick = async (rating) => {
    if (hasRated || isSubmitting) return;

    setUserRating(rating);
    setIsSubmitting(true);

    try {
      // 计算新的平均分
      const newTotal = averageRating * ratingCount + rating;
      const newCount = ratingCount + 1;
      const newAverage = newTotal / newCount;

      console.log('Submitting rating:', {
        paperId,
        rating,
        newAverage,
        newCount,
        currentAverage: averageRating,
        currentCount: ratingCount
      });

      // 更新数据库
      const { data, error } = await supabase
        .from('submissions')
        .update({
          average_rating: newAverage,
          rating_count: newCount
        })
        .eq('id', paperId)
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Rating updated successfully:', data);

      // 保存到localStorage
      const ratingKey = `rating_${paperId}`;
      localStorage.setItem(ratingKey, rating.toString());

      // 更新本地状态
      setAverageRating(newAverage);
      setRatingCount(newCount);
      setHasRated(true);

      // 调用父组件的回调函数
      if (onRate) {
        onRate(paperId, rating, newAverage, newCount);
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);

      // 重置用户评分状态
      setUserRating(0);

      // 显示更详细的错误信息
      const errorMsg = error.message || '未知错误 / Unknown error';
      alert(`评分提交失败 / Failed to submit rating:\n${errorMsg}\n\n请查看浏览器控制台获取详细信息 / Check browser console for details`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hasRated ? userRating : (hoverRating || averageRating);

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.round(displayRating);
      stars.push(
        <svg
          key={i}
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill={isFilled ? '#ffed4e' : '#e0e0e0'}
          stroke={isFilled ? '#f39c12' : '#bdbdbd'}
          strokeWidth="1.5"
          style={{
            marginRight: '4px',
            cursor: hasRated ? 'default' : 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => !hasRated && handleStarClick(i)}
          onMouseEnter={() => !hasRated && setHoverRating(i)}
          onMouseLeave={() => !hasRated && setHoverRating(0)}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className="simple-rating-widget" style={{ marginTop: '12px' }}>
      {/* 星星显示和评分 */}
      <div style={{ marginBottom: '8px' }}>
        {!hasRated && (
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '6px' }}>
            <span className="lang-en">Click to rate:</span>
            <span className="lang-zh">点击星星评分:</span>
          </div>
        )}
        <div className="stars-display" style={{ display: 'flex', alignItems: 'center' }}>
          {renderStars()}
          <span style={{ marginLeft: '8px', fontSize: '0.9rem', color: 'var(--muted)' }}>
            {hasRated ? userRating.toFixed(1) : averageRating.toFixed(1)} / 5.0
          </span>
        </div>
      </div>

      {/* 评分信息 */}
      <div className="rating-info" style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px' }}>
        <span className="lang-en">
          Average: {averageRating.toFixed(1)} / 5.0 ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
        </span>
        <span className="lang-zh">
          平均分: {averageRating.toFixed(1)} / 5.0 ({ratingCount} 次评分)
        </span>
      </div>

      {/* 提交状态 */}
      {isSubmitting && (
        <div style={{ fontSize: '0.8rem', color: '#2196F3', fontWeight: '500' }}>
          <span className="lang-en">Submitting your rating...</span>
          <span className="lang-zh">正在提交评分...</span>
        </div>
      )}

      {hasRated && !isSubmitting && (
        <div style={{ fontSize: '0.8rem', color: '#4CAF50', fontWeight: '500' }}>
          <span className="lang-en">✓ You rated this article {userRating.toFixed(1)} / 5.0</span>
          <span className="lang-zh">✓ 你已评分 {userRating.toFixed(1)} / 5.0</span>
        </div>
      )}
    </div>
  );
}
