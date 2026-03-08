"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { papers } from "../../../lib/data";

export default function PaperPage() {
  const params = useParams();
  const slug = params.slug;
  const paper = papers.find((item) => item.slug === slug);

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

          <p>{paper.abstract}</p>

          <h2>
            <span className="lang-en-inline">Editorial Context</span>
            <span className="lang-zh-inline"> / 编辑语境</span>
          </h2>
          <p className="lang-en">
            This template recasts rejection as a readable editorial artifact:
            not only a result, but also a trace of methods, criteria, tone, and
            institutional pressure.
          </p>
          <p className="lang-zh">
            这个模板把拒稿视为一种可阅读的编辑文本：它不仅是结果，更记录了方法、评价标准、语气和制度压力。
          </p>

          <h2>
            <span className="lang-en-inline">Argument</span>
            <span className="lang-zh-inline"> / 核心论点</span>
          </h2>
          <p className="lang-en">
            Each article page can hold a long-form essay, a translation, an
            annotated review history, or a satirical reconstruction of the peer
            review process.
          </p>
          <p className="lang-zh">
            每篇文章都可以承载长文、译文、带注释的审稿过程，或对同行评审机制的讽刺性重构。
          </p>

          <h2>
            <span className="lang-en-inline">Extension</span>
            <span className="lang-zh-inline"> / 扩展方向</span>
          </h2>
          <p className="lang-en">
            You can connect this page to markdown, a database, a PDF viewer, or
            a real submission workflow.
          </p>
          <p className="lang-zh">
            后续可以接入 markdown、数据库、PDF 阅读器，或者真实投稿流程。
          </p>
        </article>

        <aside>
          <div className="sidebar-card">
            <h3>
              <span className="lang-en-inline">Paper Metrics</span>
              <span className="lang-zh-inline"> / 文章指标</span>
            </h3>
            <div className="metric">
              <span>
                <span className="lang-en-inline">Smell score</span>
                <span className="lang-zh-inline">气味分</span>
              </span>
              <strong>{paper.smellScore}</strong>
            </div>
            <div className="metric">
              <span>
                <span className="lang-en-inline">Reviewer toxicity</span>
                <span className="lang-zh-inline">审稿人毒性</span>
              </span>
              <strong>{paper.toxicity}</strong>
            </div>
            <div className="metric">
              <span>
                <span className="lang-en-inline">Academic uselessness</span>
                <span className="lang-zh-inline">学术无用度</span>
              </span>
              <strong>{paper.uselessness}</strong>
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
                <span className="lang-zh-inline">{paper.stageCn}</span>
              </strong>
            </div>
            <div className="metric">
              <span>
                <span className="lang-en-inline">Format</span>
                <span className="lang-zh-inline">格式</span>
              </span>
              <strong>
                <span className="lang-en-inline">Essay / PDF</span>
                <span className="lang-zh-inline">文章 / PDF</span>
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
