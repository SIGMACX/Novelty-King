"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import SimpleRatingWidget from "../../components/SimpleRatingWidget";
import { papers, stages } from "../../lib/data";
import { calculateStage } from "../../lib/ratingUtils";

function PreprintsContent() {
  const searchParams = useSearchParams();
  const selectedStage = searchParams?.get("stage") || "all";
  const [paperRatings, setPaperRatings] = useState({});

  // 初始化评分数据
  useEffect(() => {
    const initialRatings = {};
    papers.forEach(paper => {
      initialRatings[paper.slug] = {
        averageRating: paper.averageRating || 0,
        ratingCount: paper.ratingCount || 0,
        stage: paper.stage,
        stageCn: paper.stageCn
      };
    });
    setPaperRatings(initialRatings);
  }, []);

  // 处理评分更新
  const handleRatingUpdate = (paperId, newRating, newAverage, newCount) => {
    const newStage = calculateStage(newAverage, newCount);
    setPaperRatings(prev => ({
      ...prev,
      [paperId]: {
        averageRating: newAverage,
        ratingCount: newCount,
        stage: newStage.slug,
        stageCn: newStage.cn
      }
    }));
  };

  const filtered =
    selectedStage === "all"
      ? papers
      : papers.filter((paper) => {
          const currentRating = paperRatings[paper.slug];
          const currentStage = currentRating ? currentRating.stage : paper.stage;
          return currentStage === selectedStage;
        });

  const chips = [
    { slug: "all", nameEn: "All", nameZh: "全部" },
    ...stages.map((s) => ({ slug: s.slug, nameEn: s.name, nameZh: s.cn })),
  ];

  return (
      <main className="section">
        <div className="container">
          <BackButton />
          <div className="section-box">
            <div className="section__header">
              <div>
                <h1 className="section__title">
                  <span className="lang-en-inline">Preprints</span>
                  <span className="lang-zh-inline"> / 预印本</span>
                </h1>
                <div className="section__subtitle">
                  <span className="lang-en">
                    Indexed by W.T.F stages rather than parody waste-zones.
                  </span>
                  <span className="lang-zh">
                    使用 W.T.F 阶段而非旧式讽刺性分区进行归档。
                  </span>
                </div>
              </div>
              <div className="mono">
                {filtered.length}
                <span className="lang-en-inline"> record{filtered.length === 1 ? "" : "s"}</span>
                <span className="lang-zh-inline"> 条记录</span>
              </div>
            </div>

            <div className="filters">
              {chips.map((chip) => (
                <Link
                  key={chip.slug}
                  href={chip.slug === "all" ? "/preprints" : `/preprints?stage=${chip.slug}`}
                  className={`filter-chip ${selectedStage === chip.slug ? "active" : ""}`}
                >
                  <span className="lang-en-inline">{chip.nameEn}</span>
                  <span className="lang-zh-inline"> / {chip.nameZh}</span>
                </Link>
              ))}
            </div>

            <div className="preprint-list">
              {filtered.map((paper) => {
                const currentRating = paperRatings[paper.slug] || {
                  averageRating: paper.averageRating || 0,
                  ratingCount: paper.ratingCount || 0,
                  stage: paper.stage,
                  stageCn: paper.stageCn
                };

                return (
                  <article className="preprint-row" key={paper.slug}>
                    <div>
                      <h2 className="preprint-row__title">
                        <Link href={`/preprints/${paper.slug}`}>{paper.title}</Link>
                      </h2>
                      <p className="preprint-row__excerpt">
                        <span className="lang-en">{paper.excerpt}</span>
                        <span className="lang-zh">{paper.excerptCn}</span>
                      </p>

                      {/* 评分组件 */}
                      <SimpleRatingWidget
                        paperId={paper.slug}
                        initialRating={currentRating.averageRating}
                        initialCount={currentRating.ratingCount}
                        onRate={handleRatingUpdate}
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
                        <span className="lang-en-inline">{currentRating.stage}</span>
                        <span className="lang-zh-inline" style={{ color: "var(--muted)" }}>{currentRating.stageCn}</span>
                      </div>
                    </div>
                  </article>
                );
              })}

              {filtered.length === 0 && (
                <div style={{ padding: "26px 0", color: "var(--muted)" }}>
                  <span className="lang-en">No papers found in this stage.</span>
                  <span className="lang-zh"> / 当前阶段暂无内容。</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
  );
}

export default function PreprintsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <main className="section">
          <div className="container">
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--muted)" }}>
              <span className="lang-en-inline">Loading...</span>
              <span className="lang-zh-inline">加载中...</span>
            </div>
          </div>
        </main>
      }>
        <PreprintsContent />
      </Suspense>
      <Footer />
    </>
  );
}
