"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import SimpleRatingWidget from "../../../components/SimpleRatingWidget";
import { supabase } from "../../../lib/supabase";
import { calculateStage } from "../../../lib/ratingUtils";

export default function PaperPage() {
  const params = useParams();
  const slug = params.slug;
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    async function fetchPaper() {
      try {
        // 从Supabase获取文章详情
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('id', slug)
          .eq('status', 'published')
          .single();

        if (error) {
          console.error('Error fetching paper:', error);
          setLoading(false);
          return;
        }

        if (!data) {
          setLoading(false);
          return;
        }

        // 计算阶段
        const stage = calculateStage(
          data.average_rating || 0,
          data.rating_count || 0
        );

        // 格式化数据
        const formattedPaper = {
          id: data.id,
          title: data.title,
          author: data.author_name || 'Anonymous',
          date: new Date(data.created_at).toLocaleDateString('en-CA'),
          stage: stage.slug,
          stageCn: stage.cn,
          abstract: data.abstract || '',
          content: data.content || '',
          averageRating: data.average_rating || 0,
          ratingCount: data.rating_count || 0,
          pdfFilename: data.pdf_filename
        };

        setPaper(formattedPaper);

        // 如果有PDF文件,转换Base64为Blob URL
        if (data.pdf_url) {
          console.log('PDF URL:', data.pdf_url);
          console.log('PDF filename:', data.pdf_filename);
          setPdfUrl(data.pdf_url);

          // 如果是Base64格式,转换为Blob URL
          if (data.pdf_url.startsWith('data:')) {
            try {
              // 提取Base64数据
              const base64Data = data.pdf_url.split(',')[1];
              // 转换为二进制数据
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              // 创建Blob
              const blob = new Blob([bytes], { type: 'application/pdf' });
              // 创建Blob URL
              const url = URL.createObjectURL(blob);
              setBlobUrl(url);
              console.log('Created Blob URL:', url);
            } catch (error) {
              console.error('Error converting Base64 to Blob:', error);
            }
          }
        } else {
          console.log('No PDF URL in database');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPaper();

    // 清理Blob URL
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [slug]);

  // 处理评分更新
  const handleRatingUpdate = (paperId, newRating, newAverage, newCount) => {
    const newStage = calculateStage(newAverage, newCount);
    setPaper(prev => ({
      ...prev,
      averageRating: newAverage,
      ratingCount: newCount,
      stage: newStage.slug,
      stageCn: newStage.cn
    }));
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)" }}>
          <span className="lang-en">Loading article...</span>
          <span className="lang-zh">加载中...</span>
        </main>
        <Footer />
      </>
    );
  }

  if (!paper) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container article-layout">
        <article className="article">
          <div className="mono">
            <span className="lang-en-inline">Preprint · {paper.stage}</span>
            <span className="lang-zh-inline"> / 预印本 · {paper.stageCn}</span>
          </div>
          <h1>{paper.title}</h1>
          <div className="subline">
            {paper.author} · {paper.date}
          </div>

          <h2>
            <span className="lang-en-inline">Abstract</span>
            <span className="lang-zh-inline"> / 摘要</span>
          </h2>
          <p>{paper.abstract}</p>

          {/* 评分组件 */}
          <div style={{ marginTop: 32, marginBottom: 32 }}>
            <h3>
              <span className="lang-en-inline">Rate this article</span>
              <span className="lang-zh-inline"> / 为这篇文章评分</span>
            </h3>
            <SimpleRatingWidget
              paperId={paper.id}
              initialRating={paper.averageRating}
              initialCount={paper.ratingCount}
              onRate={handleRatingUpdate}
            />
          </div>

          {/* PDF 查看器 */}
          {(blobUrl || pdfUrl) && (
            <>
              <h2>
                <span className="lang-en-inline">Full Text (PDF)</span>
                <span className="lang-zh-inline"> / 全文 (PDF)</span>
              </h2>
              <div style={{
                width: '100%',
                minHeight: '800px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginTop: '20px',
                marginBottom: '40px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <iframe
                  src={blobUrl || pdfUrl}
                  width="100%"
                  height="800px"
                  style={{ border: 'none' }}
                  title="Article PDF"
                />
              </div>
              <div style={{ marginTop: '16px', marginBottom: '32px' }}>
                <a
                  href={blobUrl || pdfUrl}
                  download={paper.pdfFilename || 'article.pdf'}
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                    marginRight: '10px'
                  }}
                >
                  <span className="lang-en-inline">Download PDF</span>
                  <span className="lang-zh-inline"> / 下载 PDF</span>
                </a>
                <a
                  href={blobUrl || pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#666',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '0.95rem'
                  }}
                >
                  <span className="lang-en-inline">Open in New Tab</span>
                  <span className="lang-zh-inline"> / 新标签页打开</span>
                </a>
              </div>
            </>
          )}

          {/* 如果有额外内容 */}
          {paper.content && (
            <>
              <h2>
                <span className="lang-en-inline">Content</span>
                <span className="lang-zh-inline"> / 内容</span>
              </h2>
              <div style={{ whiteSpace: 'pre-wrap' }}>{paper.content}</div>
            </>
          )}
        </article>

        <aside>
          <div className="sidebar-card">
            <h3>
              <span className="lang-en-inline">Article Metrics</span>
              <span className="lang-zh-inline"> / 文章指标</span>
            </h3>
            <div className="metric">
              <span>
                <span className="lang-en-inline">Average Rating</span>
                <span className="lang-zh-inline">平均评分</span>
              </span>
              <strong>{paper.averageRating.toFixed(1)} / 5.0</strong>
            </div>
            <div className="metric">
              <span>
                <span className="lang-en-inline">Rating Count</span>
                <span className="lang-zh-inline">评价人数</span>
              </span>
              <strong>{paper.ratingCount}</strong>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>
              <span className="lang-en-inline">Status</span>
              <span className="lang-zh-inline"> / 状态</span>
            </h3>
            <div className="metric">
              <span>
                <span className="lang-en-inline">Stage</span>
                <span className="lang-zh-inline">阶段</span>
              </span>
              <strong>
                <span className="lang-en-inline">{paper.stage}</span>
                <span className="lang-zh-inline"> / {paper.stageCn}</span>
              </strong>
            </div>
            <div className="metric">
              <span>
                <span className="lang-en-inline">Format</span>
                <span className="lang-zh-inline">格式</span>
              </span>
              <strong>
                {pdfUrl ? (
                  <>
                    <span className="lang-en-inline">PDF</span>
                    <span className="lang-zh-inline">PDF</span>
                  </>
                ) : (
                  <>
                    <span className="lang-en-inline">Text</span>
                    <span className="lang-zh-inline">文本</span>
                  </>
                )}
              </strong>
            </div>
            <div className="metric">
              <span>
                <span className="lang-en-inline">Visibility</span>
                <span className="lang-zh-inline">可见性</span>
              </span>
              <strong>
                <span className="lang-en-inline">Public</span>
                <span className="lang-zh-inline">公开</span>
              </strong>
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </>
  );
}
