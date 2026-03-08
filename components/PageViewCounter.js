"use client";

import { useState, useEffect } from "react";

export default function PageViewCounter() {
  const [viewCount, setViewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从localStorage获取或初始化访问计数
    const getViewCount = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('site-view-count');
        const currentCount = stored ? parseInt(stored, 10) : 0;

        // 增加访问计数
        const newCount = currentCount + 1;
        localStorage.setItem('site-view-count', newCount.toString());

        setViewCount(newCount);
        setLoading(false);
      }
    };

    getViewCount();
  }, []);

  if (loading) {
    return (
      <div className="hero-stat">
        <div className="lang-tag">
          <span className="lang-en-inline">Total Views</span>
          <span className="lang-zh-inline"> / 总浏览量</span>
        </div>
        <p className="hero-stat__value">---</p>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          <span className="lang-en">Page visits since launch</span>
          <span className="lang-zh">自上线以来的页面访问</span>
        </p>
      </div>
    );
  }

  return (
    <div className="hero-stat">
      <div className="lang-tag">
        <span className="lang-en-inline">Total Views</span>
        <span className="lang-zh-inline"> / 总浏览量</span>
      </div>
      <p className="hero-stat__value">{viewCount.toLocaleString()}</p>
      <p style={{ margin: 0, color: "var(--muted)" }}>
        <span className="lang-en">Page visits since launch</span>
        <span className="lang-zh">自上线以来的页面访问</span>
      </p>
    </div>
  );
}
