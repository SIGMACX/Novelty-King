"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackButton from "../../components/BackButton";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export default function MySubmissionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      loadMySubmissions();
    }
  }, [user]);

  const loadMySubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
      setMessage({
        type: "error",
        text: "加载投稿列表失败"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleDownloadPDF = (pdfUrl, filename) => {
    if (pdfUrl && pdfUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(pdfUrl, '_blank');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-badge status-badge--pending';
      case 'under_review': return 'status-badge status-badge--review';
      case 'accepted': return 'status-badge status-badge--accepted';
      case 'rejected': return 'status-badge status-badge--rejected';
      default: return 'status-badge';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'under_review': return '审核中';
      case 'accepted': return '已接受';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending': return '您的投稿已提交，我们将在3个工作日内完成初审。';
      case 'under_review': return '您的投稿正在接受专家评审，预计2-4周内完成。';
      case 'accepted': return '恭喜！您的论文已被接受，即将发表。';
      case 'rejected': return '很遗憾，您的论文未能通过评审。';
      default: return '';
    }
  };

  return (
    <>
      <Header />
      <ProtectedRoute>
        <main className="section">
          <div className="container">
            <BackButton />
            <div className="my-submissions-header">
              <div>
                <div className="mono" style={{ marginBottom: 8 }}>
                  <span className="lang-en-inline">My Submissions</span>
                  <span className="lang-zh-inline"> / 我的投稿</span>
                </div>
                <h1 style={{ marginBottom: 8, fontSize: "2rem" }}>
                  我的投稿列表
                </h1>
                <p style={{ color: "var(--muted)" }}>
                  查看您提交的所有论文及审核状态
                </p>
              </div>
              <button
                className="button button--accent"
                onClick={() => router.push('/submit')}
              >
                ➕ 新投稿
              </button>
            </div>

            {message && (
              <div className={`auth-message auth-message--${message.type}`} style={{ marginTop: 24 }}>
                {message.text}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ color: 'var(--muted)' }}>加载中...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="empty-state" style={{ marginTop: 40 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📝</div>
                <h3>还没有投稿</h3>
                <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
                  提交您的第一篇论文开始吧！
                </p>
                <button
                  className="button button--accent"
                  onClick={() => router.push('/submit')}
                >
                  立即投稿
                </button>
              </div>
            ) : (
              <div className="my-submissions-layout">
                {/* 投稿列表 */}
                <div className="submissions-list">
                  <h2 style={{ marginTop: 0 }}>
                    全部投稿 ({submissions.length})
                  </h2>

                  <div className="submissions-grid">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className={`submission-card ${selectedSubmission?.id === submission.id ? 'submission-card--selected' : ''}`}
                        onClick={() => handleViewDetails(submission)}
                      >
                        <div className="submission-card-header">
                          <h3 style={{ margin: 0, fontSize: '1rem' }}>
                            {submission.title}
                          </h3>
                          <span className={getStatusBadgeClass(submission.status)}>
                            {getStatusText(submission.status)}
                          </span>
                        </div>
                        <div className="submission-card-meta">
                          <div>
                            <strong>作者：</strong>{submission.first_author}
                          </div>
                          <div>
                            <strong>研究领域：</strong>
                            {submission.research_field || '未指定'}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            提交时间：{new Date(submission.created_at).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 投稿详情 */}
                {selectedSubmission && (
                  <div className="submission-detail">
                    <div className="section-box">
                      <h2 style={{ marginTop: 0 }}>投稿详情</h2>

                      {/* 状态提示 */}
                      <div className={`status-alert status-alert--${selectedSubmission.status}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className={getStatusBadgeClass(selectedSubmission.status)}>
                            {getStatusText(selectedSubmission.status)}
                          </span>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>
                          {getStatusDescription(selectedSubmission.status)}
                        </p>
                      </div>

                      <div className="detail-section">
                        <h3>论文信息</h3>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <label>论文标题</label>
                            <p>{selectedSubmission.title}</p>
                          </div>
                          <div className="detail-item">
                            <label>第一作者</label>
                            <p>{selectedSubmission.first_author}</p>
                          </div>
                          <div className="detail-item">
                            <label>通讯作者</label>
                            <p>{selectedSubmission.corresponding_author || '（同第一作者）'}</p>
                          </div>
                          <div className="detail-item">
                            <label>联系邮箱</label>
                            <p>{selectedSubmission.email}</p>
                          </div>
                          <div className="detail-item">
                            <label>研究领域</label>
                            <p>{selectedSubmission.research_field || '未指定'}</p>
                          </div>
                          <div className="detail-item">
                            <label>关键词</label>
                            <p>{selectedSubmission.keywords || '无'}</p>
                          </div>
                        </div>
                      </div>

                      {selectedSubmission.abstract && (
                        <div className="detail-section">
                          <h3>摘要</h3>
                          <p>{selectedSubmission.abstract}</p>
                        </div>
                      )}

                      <div className="detail-section">
                        <h3>论文文件</h3>
                        <div className="file-info-box">
                          <div>
                            <p><strong>文件名：</strong>{selectedSubmission.pdf_filename}</p>
                            <p><strong>文件大小：</strong>{(selectedSubmission.pdf_size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button
                            className="button"
                            onClick={() => handleDownloadPDF(selectedSubmission.pdf_url, selectedSubmission.pdf_filename)}
                          >
                            📥 下载PDF
                          </button>
                        </div>
                      </div>

                      {selectedSubmission.admin_notes && (
                        <div className="detail-section">
                          <h3>审核意见</h3>
                          <div style={{
                            padding: 16,
                            background: '#f8f9fa',
                            borderRadius: 4,
                            borderLeft: '3px solid var(--accent)'
                          }}>
                            <p style={{ margin: 0 }}>{selectedSubmission.admin_notes}</p>
                          </div>
                        </div>
                      )}

                      <div className="detail-section">
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          提交时间：{new Date(selectedSubmission.created_at).toLocaleString('zh-CN')}<br />
                          最后更新：{new Date(selectedSubmission.updated_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </ProtectedRoute>
      <Footer />
    </>
  );
}
