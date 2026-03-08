"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import { supabase } from "../../lib/supabase";
import { stages } from "../../lib/data";
import { calculateStage } from "../../lib/ratingUtils";

export default function PublicationsPage() {
  const searchParams = useSearchParams();
  const selectedStage = searchParams?.get("stage") || "all";
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

      // Calculate stage for each publication based on ratings
      const publicationsWithStages = (data || []).map(pub => {
        const stage = calculateStage(
          pub.average_rating || 0,
          pub.rating_count || 0
        );
        return {
          ...pub,
          stage: stage.slug,
          stageCn: stage.cn
        };
      });

      setPublications(publicationsWithStages);
    } catch (error) {
      console.error("Error loading publications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter publications by selected stage
  const filteredPublications = selectedStage === "all"
    ? publications
    : publications.filter(pub => pub.stage === selectedStage);

  const chips = [
    { slug: "all", nameEn: "All", nameZh: "全部" },
    ...stages.map((s) => ({ slug: s.slug, nameEn: s.name, nameZh: s.cn })),
  ];

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
          <BackButton />
          <div className="section-box">
            <div className="section__header">
              <div>
                <h2 className="section__title">
                  <span className="lang-en-inline">Published Articles</span>
                  <span className="lang-zh-inline"> / 已发表论文</span>
                </h2>
                <div className="section__subtitle">
                  <span className="lang-en">Browse all published academic papers by cultivation stage.</span>
                  <span className="lang-zh">按修炼阶段浏览所有已发表的学术论文。</span>
                </div>
              </div>
              <div className="mono">
                {filteredPublications.length}
                <span className="lang-en-inline"> record{filteredPublications.length === 1 ? "" : "s"}</span>
                <span className="lang-zh-inline"> 条记录</span>
              </div>
            </div>

            <div className="filters">
              {chips.map((chip) => (
                <Link
                  key={chip.slug}
                  href={chip.slug === "all" ? "/publications" : `/publications?stage=${chip.slug}`}
                  className={`filter-chip ${selectedStage === chip.slug ? "active" : ""}`}
                >
                  <span className="lang-en-inline">{chip.nameEn}</span>
                  <span className="lang-zh-inline"> / {chip.nameZh}</span>
                </Link>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ color: 'var(--muted)' }}>加载中...</p>
              </div>
            ) : filteredPublications.length === 0 ? (
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

                {/* 文章简介 */}
                {selectedPub.abstract && (
                  <div style={{
                    marginBottom: 24,
                    padding: 20,
                    background: '#f8f9fa',
                    border: '1px solid var(--line)',
                    borderRadius: 4
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: '1.1rem' }}>
                      <span className="lang-en-inline">Abstract</span>
                      <span className="lang-zh-inline"> / 文章简介</span>
                    </h3>
                    <p style={{ margin: 0, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                      {selectedPub.abstract}
                    </p>
                  </div>
                )}

                {/* PDF 查看器 */}
                <div className="pdf-viewer" style={{ position: 'relative' }}>
                  {selectedPub.pdf_url ? (
                    <>
                      <div className="pdf-watermark">
                        Novelty King整活，不代表真实观点
                      </div>
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
                {filteredPublications.map((pub) => (
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
                        <span className="lang-en-inline">Stage</span>
                        <span className="lang-zh-inline"> / 阶段</span>
                      </span>
                      <div className="zone-pill">
                        <span className="lang-en-inline">{pub.stage}</span>
                        <span className="lang-zh-inline" style={{ color: "var(--muted)" }}>{pub.stageCn}</span>
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
