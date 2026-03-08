"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";

export default function PublicationsPage() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPub, setSelectedPub] = useState(null);

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;

      console.log("Loaded publications:", data);
      setPublications(data || []);
    } catch (error) {
      console.error("Error loading publications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (pdfUrl, filename) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Header />
      <main className="section">
        <div className="container">
          <div className="section-box">
            <div className="section__header">
              <div>
                <h2 className="section__title">
                  <span className="lang-en-inline">Published Articles</span>
                  <span className="lang-zh-inline"> / 已发表论文</span>
                </h2>
                <div className="section__subtitle">
                  <span className="lang-en">Browse all published academic papers.</span>
                  <span className="lang-zh">浏览所有已发表的学术论文。</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ color: 'var(--muted)' }}>加载中...</p>
              </div>
            ) : publications.length === 0 ? (
              <div className="empty-state" style={{ marginTop: 40 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📚</div>
                <h3>暂无已发表论文</h3>
                <p style={{ color: 'var(--muted)' }}>
                  敬请期待更多精彩内容
                </p>
              </div>
            ) : selectedPub ? (
              // 详细视图 - 显示标题和完整PDF
              <div className="publication-viewer">
                <div style={{ marginBottom: 24 }}>
                  <button
                    className="button"
                    onClick={() => setSelectedPub(null)}
                  >
                    ← 返回列表
                  </button>
                </div>

                <div className="publication-viewer-header">
                  <h2 style={{ marginTop: 0, marginBottom: 16 }}>{selectedPub.title}</h2>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    <span>👤 {selectedPub.first_author}</span>
                    {selectedPub.corresponding_author && (
                      <span>✉️ {selectedPub.corresponding_author}</span>
                    )}
                    <span>📅 {new Date(selectedPub.published_at).toLocaleDateString('zh-CN')}</span>
                    {selectedPub.research_field && (
                      <span className="field-tag">{selectedPub.research_field}</span>
                    )}
                  </div>
                  <button
                    className="button button--accent"
                    onClick={() => handleDownloadPDF(selectedPub.pdf_url, selectedPub.pdf_filename)}
                    style={{ marginBottom: 24 }}
                  >
                    📥 下载 PDF
                  </button>
                </div>

                {/* PDF 查看器 */}
                <div className="pdf-viewer">
                  {selectedPub.pdf_url ? (
                    <>
                      <object
                        data={selectedPub.pdf_url}
                        type="application/pdf"
                        width="100%"
                        height="800px"
                        style={{
                          border: '1px solid var(--line)',
                          borderRadius: 4
                        }}
                      >
                        <embed
                          src={selectedPub.pdf_url}
                          type="application/pdf"
                          width="100%"
                          height="800px"
                          style={{
                            border: '1px solid var(--line)',
                            borderRadius: 4
                          }}
                        />
                      </object>
                      <div style={{
                        marginTop: 16,
                        padding: 16,
                        background: '#f8f9fa',
                        border: '1px solid var(--line)',
                        borderRadius: 4,
                        fontSize: '0.9rem',
                        color: 'var(--muted)',
                        textAlign: 'center'
                      }}>
                        <div style={{ marginBottom: 12 }}>
                          <strong>文件信息：</strong>
                          {selectedPub.pdf_filename} · {(selectedPub.pdf_size / 1024 / 1024).toFixed(2)} MB · 发表于 {new Date(selectedPub.published_at).toLocaleDateString('zh-CN')}
                        </div>
                        <button
                          className="button button--accent"
                          onClick={() => handleDownloadPDF(selectedPub.pdf_url, selectedPub.pdf_filename)}
                        >
                          📥 下载 PDF
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{
                      padding: 40,
                      textAlign: 'center',
                      border: '1px solid var(--line)',
                      borderRadius: 4,
                      background: '#f8f9fa'
                    }}>
                      <p style={{ color: 'var(--muted)' }}>
                        PDF 文件不可用
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 列表视图 - 使用 preprint-row 格式
              <div className="preprint-list">
                {publications.map((pub) => (
                  <article className="preprint-row" key={pub.id}>
                    <div>
                      <h3 className="preprint-row__title">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedPub(pub);
                          }}
                        >
                          {pub.title}
                        </a>
                      </h3>
                      <p className="preprint-row__excerpt">
                        {pub.abstract ? (
                          pub.abstract.substring(0, 200) + (pub.abstract.length > 200 ? '...' : '')
                        ) : (
                          '暂无摘要'
                        )}
                      </p>
                    </div>

                    <div className="preprint-row__meta">
                      <span className="label">
                        <span className="lang-en-inline">Author</span>
                        <span className="lang-zh-inline"> / 作者</span>
                      </span>
                      <div className="value">{pub.first_author}</div>
                    </div>

                    <div className="preprint-row__meta">
                      <span className="label">
                        <span className="lang-en-inline">Date</span>
                        <span className="lang-zh-inline"> / 日期</span>
                      </span>
                      <div className="value">
                        {new Date(pub.published_at).toLocaleDateString('zh-CN')}
                      </div>
                    </div>

                    <div className="preprint-row__meta">
                      <span className="label">
                        <span className="lang-en-inline">Field</span>
                        <span className="lang-zh-inline"> / 领域</span>
                      </span>
                      <div className="zone-pill">
                        {pub.research_field || '未分类'}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
