"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export default function SubmitPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    firstAuthor: "",
    correspondingAuthor: "",
    email: user?.email || "",
    keywords: "",
    abstract: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 验证文件类型
      if (file.type !== "application/pdf") {
        setMessage({
          type: "error",
          text: "请上传 PDF 格式文件"
        });
        return;
      }
      // 验证文件大小（10MB）
      if (file.size > 10 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "文件大小不能超过 10MB"
        });
        return;
      }
      setPdfFile(file);
      setMessage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // 验证必填字段
    if (!formData.title || !formData.firstAuthor || !formData.email || !formData.abstract || !pdfFile) {
      setMessage({
        type: "error",
        text: "请填写所有必填字段（包括论文简介）并上传 PDF 文件"
      });
      setLoading(false);
      return;
    }

    try {
      // 将 PDF 转换为 Base64（临时方案：直接存储在数据库中）
      console.log("开始处理 PDF 文件...");

      const pdfBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(pdfFile);
      });

      console.log("PDF 文件已处理完成");

      // 直接插入数据库（PDF 以 Base64 格式存储）
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            first_author: formData.firstAuthor,
            corresponding_author: formData.correspondingAuthor || null,
            email: formData.email,
            keywords: formData.keywords || null,
            abstract: formData.abstract,
            pdf_url: pdfBase64, // 存储 Base64 格式的 PDF
            pdf_filename: pdfFile.name,
            pdf_size: pdfFile.size,
            status: 'pending'
          }
        ])
        .select();

      if (submissionError) {
        console.error("数据库插入错误:", submissionError);
        // 检查是否是表不存在的错误
        if (submissionError.message.includes('relation') && submissionError.message.includes('does not exist')) {
          throw new Error("数据库未配置。请先在 Supabase SQL Editor 中执行数据表创建脚本。");
        }
        throw new Error(`提交记录保存失败: ${submissionError.message}`);
      }

      console.log("投稿成功", submissionData);

      setMessage({
        type: "success",
        text: "投稿成功！我们将在3个工作日内完成初审。"
      });

      // 重置表单
      setFormData({
        title: "",
        firstAuthor: "",
        correspondingAuthor: "",
        email: user?.email || "",
        keywords: "",
        abstract: "",
      });
      setPdfFile(null);
      // 重置文件输入
      const fileInput = document.getElementById("pdf-file");
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error("Submission error:", error);
      setMessage({
        type: "error",
        text: error.message || "提交失败，请重试"
      });
    }

    setLoading(false);
  };

  const handleDownloadTemplate = () => {
    // 创建一个隐藏的 a 标签来触发下载
    const link = document.createElement('a');
    link.href = '/templates/Submission-Template.docx';
    link.download = 'Novelty-King-投稿模板.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Header />
      <ProtectedRoute>
        <main className="section">
          <div className="container">
            <BackButton />
            <div className="submit-layout">
              {/* 左侧：投稿表单 */}
              <div className="submit-form-container">
                <div className="section-box">
                  <div className="mono" style={{ marginBottom: 8 }}>
                    <span className="lang-en-inline">Submit Manuscript</span>
                    <span className="lang-zh-inline"> / 投稿系统</span>
                  </div>
                  <h1 style={{ marginBottom: 24, fontSize: "2rem" }}>
                    <span className="lang-en-inline">Submit your paper</span>
                    <span className="lang-zh-inline"> / 提交论文</span>
                  </h1>

                  {user && (
                    <div className="user-info-box">
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>
                        <span className="lang-en">
                          <strong>Logged in as:</strong> {user.email}
                        </span>
                        <span className="lang-zh">
                          <strong>当前用户：</strong> {user.email}
                        </span>
                      </p>
                    </div>
                  )}

                  {message && (
                    <div className={`auth-message auth-message--${message.type}`} style={{ marginBottom: 24 }}>
                      {message.text}
                      {message.type === "success" && (
                        <div style={{ marginTop: 12 }}>
                          <Link href="/my-submissions" className="button" style={{ display: 'inline-block' }}>
                            查看我的投稿 →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="submit-form">
                    <div className="form-group">
                      <label htmlFor="title" className="form-label required">
                        论文标题（中文）
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="请输入论文标题，不超过50字"
                        maxLength="50"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="firstAuthor" className="form-label required">
                          第一作者
                        </label>
                        <input
                          id="firstAuthor"
                          name="firstAuthor"
                          type="text"
                          value={formData.firstAuthor}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                          placeholder="作者姓名"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="correspondingAuthor" className="form-label">
                          通讯作者
                        </label>
                        <input
                          id="correspondingAuthor"
                          name="correspondingAuthor"
                          type="text"
                          value={formData.correspondingAuthor}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="如与第一作者相同可留空"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label required">
                        通讯邮箱
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="author@university.edu.cn"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="keywords" className="form-label">
                        关键词
                      </label>
                      <input
                        id="keywords"
                        name="keywords"
                        type="text"
                        value={formData.keywords}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="用分号分隔，如：机器学习;深度学习;神经网络"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="abstract" className="form-label required">
                        论文简介（100字以内）
                      </label>
                      <textarea
                        id="abstract"
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleInputChange}
                        required
                        className="form-textarea"
                        rows="4"
                        placeholder="简要介绍研究背景、方法和主要发现"
                        maxLength="100"
                      />
                      <div style={{ textAlign: "right", fontSize: "0.85rem", color: "var(--muted)", marginTop: 4 }}>
                        {formData.abstract.length} / 100
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="pdf-file" className="form-label required">
                        论文PDF文件
                      </label>
                      <div className="file-upload-area">
                        <input
                          id="pdf-file"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          required
                          className="file-input"
                        />
                        {pdfFile && (
                          <div className="file-info">
                            <span>📄 {pdfFile.name}</span>
                            <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                              ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 8 }}>
                        仅支持 PDF 格式，文件大小不超过 10MB
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="button button--accent button--full"
                      style={{ marginTop: 24 }}
                    >
                      {loading ? "提交中..." : "提交论文"}
                    </button>
                  </form>
                </div>
              </div>

              {/* 右侧：投稿指南 */}
              <div className="submit-sidebar">
                <div className="sidebar-card">
                  <h3 style={{ marginTop: 0 }}>投稿要求</h3>
                  <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
                    <li>论文必须使用<strong>中文</strong>撰写</li>
                    <li>仅接受 <strong>PDF 格式</strong></li>
                    <li>文件大小不超过 <strong>10MB</strong></li>
                    <li>必须按照期刊模板排版</li>
                    <li>确保内容原创，未一稿多投</li>
                  </ul>
                </div>

                <div className="sidebar-card">
                  <h3 style={{ marginTop: 0 }}>下载模板</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: 12 }}>
                    请下载并按照模板要求撰写论文
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="button"
                    style={{ width: "100%" }}
                  >
                    📥 下载投稿模板
                  </button>
                </div>

                <div className="sidebar-card">
                  <h3 style={{ marginTop: 0 }}>审稿流程</h3>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-marker">1</div>
                      <div className="timeline-content">
                        <strong>初审</strong>
                        <p>3个工作日</p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-marker">2</div>
                      <div className="timeline-content">
                        <strong>最终决定</strong>
                        <p>1周</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sidebar-card">
                  <h3 style={{ marginTop: 0 }}>需要帮助？</h3>
                  <p style={{ fontSize: "0.9rem", marginBottom: 12 }}>
                    如有疑问，请联系编辑部
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
                    📧 editor@novelty-journal.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </ProtectedRoute>
      <Footer />
    </>
  );
}
