"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="section">
        <div className="container">
          <BackButton />
          <div className="section-box">
            <div className="mono" style={{ marginBottom: 12 }}>
              <span className="lang-en-inline">About</span>
              <span className="lang-zh-inline"> / 关于</span>
            </div>
            <h1 style={{ marginBottom: 32 }}>Novelty King</h1>

            <div className="dual-block" style={{ gap: 32, marginBottom: 40 }}>
              <div className="lang-block lang-en">
                <div className="lang-tag">EN</div>
                <p style={{ lineHeight: 1.75, fontSize: '1.02rem' }}>
                  <strong>Novelty King</strong> reflects on the idea of novelty in scholarship.
                  It is a space where ideas meet, challenge each other, and evolve through dialogue.
                  We recognize that the pursuit of novelty often dominates academic evaluation, yet genuine progress in knowledge comes from careful thinking, debate, and refinement of ideas.
                  Here, novelty is not an obligation but a possibility emerging from intellectual exchange.
                </p>
              </div>
              <div className="lang-block lang-zh">
                <div className="lang-tag">中文</div>
                <p style={{ lineHeight: 1.75, fontSize: '1.02rem' }}>
                  <strong>Novelty King（创新之王）</strong>反思学术研究中对"创新性"的强调。
                  本刊致力于成为思想交流与观点碰撞的空间。
                  我们认为，学术评价往往过度追求所谓的"创新"，而真正的知识进步来自讨论、推敲与思想的不断修正。
                  在这里，创新并不是必须完成的指标，而是在交流与思考中自然产生的结果。
                </p>
              </div>
            </div>

            <div className="dual-block" style={{ gap: 32 }}>
              <div className="lang-block lang-en">
                <div className="lang-tag">Peer Review Philosophy</div>
                <p style={{ lineHeight: 1.7 }}>
                  We publish research that emerges from genuine intellectual exchange rather than forced pursuit of novelty.
                  Our peer review focuses on the quality of thinking and argumentation, not merely on claims of innovation.
                  We value rigorous analysis, clear communication, and meaningful contribution to ongoing scholarly conversations.
                </p>
              </div>
              <div className="lang-block lang-zh">
                <div className="lang-tag">同行评审理念</div>
                <p style={{ lineHeight: 1.7 }}>
                  我们发表源于真诚思想交流的研究，而非强求创新的产物。
                  同行评审关注思考质量与论证逻辑，而非单纯的创新性声明。
                  我们重视严谨的分析、清晰的表达，以及对学术对话的有意义贡献。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
