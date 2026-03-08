"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SimpleRatingWidget from "../components/SimpleRatingWidget";
import PageViewCounter from "../components/PageViewCounter";
import { stages } from "../lib/data";
import { supabase } from "../lib/supabase";
import { calculateStage } from "../lib/ratingUtils";

export default function HomePage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 从Supabase获取已发布的文章
  useEffect(() => {
    async function fetchPublishedPapers() {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        // 转换数据格式以匹配现有的数据结构
        const formattedPapers = data.map(submission => {
          const stage = calculateStage(
            submission.average_rating || 0,
            submission.rating_count || 0
          );

          return {
            slug: submission.id,
            title: submission.title,
            author: submission.first_author || 'Anonymous',
            date: new Date(submission.created_at).toLocaleDateString('en-CA'),
            stage: stage.slug,
            stageCn: stage.cn,
            excerpt: submission.abstract?.substring(0, 150) || '',
            excerptCn: '',
            averageRating: submission.average_rating || 0,
            ratingCount: submission.rating_count || 0
          };
        });

        setPapers(formattedPapers);
      } catch (error) {
        console.error('Error fetching papers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublishedPapers();
  }, []);

  function countByStage(stage) {
    return papers.filter((paper) => paper.stage === stage).length;
  }

  return (
    <>
      <Header />

      {/* Journal Motto Section */}
      <section className="journal-motto">
        <div className="container">
          <h2 className="journal-motto__title">
            "If it matters to you, it is novel."
          </h2>
          <p className="journal-motto__subtitle">
            "只要对你有意义，它就是创新。"
          </p>
        </div>
      </section>

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-card">
              <div className="hero__topline">
                <div style={{ width: '100%' }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>
                    <span className="lang-en-inline">Novelty King</span>
                    <span className="lang-zh-inline"> / 创新之王</span>
                  </div>
                  <h1 style={{ marginBottom: 24 }}>Novelty King</h1>

                  {/* 英文版 */}
                  <div className="lang-block lang-en" style={{ marginBottom: 24 }}>
                    <p style={{ lineHeight: 1.75, fontSize: '1.02rem', margin: 0 }}>
                      <strong>Novelty King</strong> reflects on the idea of novelty in scholarship.
                      It is a space where ideas meet, challenge each other, and evolve through dialogue.
                      We recognize that the pursuit of novelty often dominates academic evaluation, yet genuine progress in knowledge comes from careful thinking, debate, and refinement of ideas.
                      Here, novelty is not an obligation but a possibility emerging from intellectual exchange.
                    </p>
                  </div>

                  {/* 中文版 */}
                  <div className="lang-block lang-zh">
                    <p style={{ lineHeight: 1.75, fontSize: '1.02rem', margin: 0 }}>
                      <strong>Novelty King（创新之王）</strong>反思学术研究中对"创新性"的强调。
                      本刊致力于成为思想交流与观点碰撞的空间。
                      我们认为，学术评价往往过度追求所谓的"创新"，而真正的知识进步来自讨论、推敲与思想的不断修正。
                      在这里，创新并不是必须完成的指标，而是在交流与思考中自然产生的结果。
                    </p>
                  </div>
                </div>

                {/* 右侧浏览统计 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <PageViewCounter />
                </div>
              </div>

              <div className="hero-grid" style={{ marginTop: 32 }}>
                <div className="dual-block">
                  <div className="lang-block lang-en">
                    <div className="lang-tag">Mission</div>
                    <p style={{ lineHeight: 1.6 }}>
                      We publish research that emerges from genuine intellectual exchange rather than forced pursuit of novelty.
                      Our peer review focuses on the quality of thinking and argumentation, not merely on claims of innovation.
                    </p>
                  </div>
                  <div className="lang-block lang-zh">
                    <div className="lang-tag">办刊宗旨</div>
                    <p style={{ lineHeight: 1.6 }}>
                      我们发表源于真诚思想交流的研究，而非强求创新的产物。
                      同行评审关注思考质量与论证逻辑，而非单纯的创新性声明。
                    </p>
                  </div>
                </div>

                <div className="hero-stat">
                  <div className="lang-tag">
                    <span className="lang-en-inline">Current archive</span>
                    <span className="lang-zh-inline"> / 当前收录</span>
                  </div>
                  <p className="hero-stat__value">{papers.length} Articles</p>
                  <p style={{ margin: 0, color: "var(--muted)" }}>
                    <span className="lang-en">
                      Organized by research stage and peer review status.
                    </span>
                    <span className="lang-zh">
                      按研究阶段和同行评审状态组织。
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-box">
              <div className="section__header">
                <div>
                  <h2 className="section__title">
                    <span className="lang-en-inline">Cultivation Pool</span>
                    <span className="lang-zh-inline"> / 创新修炼池</span>
                  </h2>
                  <div className="section__subtitle">
                    <span className="lang-en">
                      Browse articles by cultivation level and innovation stage.
                    </span>
                    <span className="lang-zh">
                      按修炼等级和创新阶段浏览文章。
                    </span>
                  </div>
                </div>
                <div className="mono">
                  <span className="lang-en-inline">Browse by level</span>
                  <span className="lang-zh-inline"> / 按等级浏览</span>
                </div>
              </div>

              <div className="zone-grid">
                {stages.map((stage) => (
                  <Link className="zone-card" key={stage.slug} href={`/publications?stage=${stage.slug}`}>
                    <div className="zone-card__head">
                      <div>
                        <h3 className="zone-card__name lang-en">{stage.name}</h3>
                        <h3 className="zone-card__name lang-zh">{stage.cn}</h3>
                      </div>
                      <div className="zone-card__count">
                        {countByStage(stage.slug)}
                        <span className="lang-en-inline"> items</span>
                        <span className="lang-zh-inline"> 篇</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-box">
              <div className="section__header">
                <div>
                  <h2 className="section__title">
                    <span className="lang-en-inline">Latest Articles</span>
                    <span className="lang-zh-inline"> / 最新文章</span>
                  </h2>
                  <div className="section__subtitle">
                    <span className="lang-en">Recently published research articles and papers.</span>
                    <span className="lang-zh">最新发表的研究文章和论文。</span>
                  </div>
                </div>
                <Link className="mono" href="/preprints">
                  <span className="lang-en-inline">View all</span>
                  <span className="lang-zh-inline"> / 查看全部</span>
                </Link>
              </div>

              <div className="preprint-list">
                {loading ? (
                  <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)" }}>
                    <span className="lang-en">Loading articles...</span>
                    <span className="lang-zh">加载中...</span>
                  </div>
                ) : papers.length === 0 ? (
                  <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)" }}>
                    <span className="lang-en">No published articles yet.</span>
                    <span className="lang-zh">暂无已发表的文章。</span>
                  </div>
                ) : (
                  papers.map((paper) => (
                    <article className="preprint-row" key={paper.slug}>
                      <div>
                        <h3 className="preprint-row__title">
                          <Link href={`/preprints/${paper.slug}`}>{paper.title}</Link>
                        </h3>
                        <p className="preprint-row__excerpt">
                          {paper.excerpt}
                        </p>

                        {/* 评分组件 */}
                        <SimpleRatingWidget
                          paperId={paper.slug}
                          initialRating={paper.averageRating}
                          initialCount={paper.ratingCount}
                          onRate={(paperId, rating, newAverage, newCount) => {
                            // 更新本地状态
                            setPapers(prevPapers =>
                              prevPapers.map(p => {
                                if (p.slug === paperId) {
                                  const newStage = calculateStage(newAverage, newCount);
                                  return {
                                    ...p,
                                    averageRating: newAverage,
                                    ratingCount: newCount,
                                    stage: newStage.slug,
                                    stageCn: newStage.cn
                                  };
                                }
                                return p;
                              })
                            );
                          }}
                        />
                      </div>

                      <div className="preprint-row__meta">
                        <span className="label">
                          <span className="lang-en-inline">Author</span>
                          <span className="lang-zh-inline"> / 作者</span>
                        </span>
                        <div className="value">{paper.author}</div>
                      </div>

                      <div className="preprint-row__meta">
                        <span className="label">
                          <span className="lang-en-inline">Date</span>
                          <span className="lang-zh-inline"> / 日期</span>
                        </span>
                        <div className="value">{paper.date}</div>
                      </div>

                      <div className="preprint-row__meta">
                        <span className="label">
                          <span className="lang-en-inline">Stage</span>
                          <span className="lang-zh-inline"> / 阶段</span>
                        </span>
                        <div className="zone-pill">
                          <span className="lang-en-inline">{paper.stage}</span>
                          <span className="lang-zh-inline" style={{ color: "var(--muted)" }}>{paper.stageCn}</span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
