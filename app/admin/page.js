"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const { user, checkIsAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const verifyAdminAndLoadData = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        router.push("/");
        return;
      }

      await loadSubmissions();
      setLoading(false);
    };

    verifyAdminAndLoadData();
  }, [user, authLoading, router]);

  const loadSubmissions = async () => {
    try {
      let query = supabase
        .from('submissions')
        .select('*')  // 移除了 auth.users 的查询
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading submissions:", error);
        throw error;
      }

      console.log("Loaded submissions:", data);  // 添加日志
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
      setMessage({
        type: "error",
        text: `加载投稿列表失败: ${error.message}`
      });
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadSubmissions();
    }
  }, [filterStatus, isAdmin]);

  const handleStatusChange = async (submissionId, newStatus) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', submissionId);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "状态更新成功"
      });

      await loadSubmissions();

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage({
        type: "error",
        text: "状态更新失败"
      });
    }
  };

  const handlePublish = async (submissionId) => {
    if (!confirm('确定要发表这篇论文吗？发表后将在网站上公开展示。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'published',
          is_published: true,
          published_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "论文已成功发表！"
      });

      await loadSubmissions();

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission({
          ...selectedSubmission,
          status: 'published',
          is_published: true,
          published_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error publishing:", error);
      setMessage({
        type: "error",
        text: "发表失败"
      });
    }
  };

  const handleUnpublish = async (submissionId) => {
    if (!confirm('确定要取消发表吗？论文将不再在网站上显示。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          is_published: false
        })
        .eq('id', submissionId);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "已取消发表"
      });

      await loadSubmissions();

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission({
          ...selectedSubmission,
          is_published: false
        });
      }
    } catch (error) {
      console.error("Error unpublishing:", error);
      setMessage({
        type: "error",
        text: "取消发表失败"
      });
    }
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleDownloadPDF = (pdfUrl, filename) => {
    // 如果是 Base64 格式，创建下载链接
    if (pdfUrl && pdfUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 如果是 URL，直接打开
      window.open(pdfUrl, '_blank');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-badge status-badge--pending';
      case 'under_review': return 'status-badge status-badge--review';
      case 'accepted': return 'status-badge status-badge--accepted';
      case 'rejected': return 'status-badge status-badge--rejected';
      case 'published': return 'status-badge status-badge--published';
      default: return 'status-badge';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'under_review': return '审核中';
      case 'accepted': return '已接受';
      case 'rejected': return '已拒绝';
      case 'published': return '已发表';
      default: return status;
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="section">
          <div className="container">
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <Header />
      <main className="section">
        <div className="container">
          <div className="admin-header">
            <div>
              <div className="mono" style={{ marginBottom: 8 }}>
                Admin Dashboard / 管理员仪表板
              </div>
              <h1 style={{ marginBottom: 8, fontSize: "2rem" }}>
                论文投稿管理
              </h1>
              <p style={{ color: "var(--muted)" }}>
                查看和处理所有投稿
              </p>
            </div>
            <div className="admin-filter">
              <label>筛选状态：</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input"
                style={{ width: '200px' }}
              >
                <option value="all">全部</option>
                <option value="pending">待审核</option>
                <option value="under_review">审核中</option>
                <option value="accepted">已接受</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
          </div>

          {message && (
            <div className={`auth-message auth-message--${message.type}`} style={{ marginTop: 24 }}>
              {message.text}
            </div>
          )}

          <div className="admin-layout">
            {/* Submissions List */}
            <div className="submissions-list">
              <h2 style={{ marginTop: 0 }}>投稿列表 ({submissions.length})</h2>

              {submissions.length === 0 ? (
                <div className="empty-state">
                  <p>暂无投稿</p>
                </div>
              ) : (
                <div className="submissions-grid">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className={`submission-card ${selectedSubmission?.id === submission.id ? 'submission-card--selected' : ''}`}
                      onClick={() => handleViewSubmission(submission)}
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
                          <strong>邮箱：</strong>{submission.email}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          提交时间：{new Date(submission.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Details */}
            {selectedSubmission && (
              <div className="submission-detail">
                <div className="section-box">
                  <h2 style={{ marginTop: 0 }}>投稿详情</h2>

                  <div className="detail-section">
                    <h3>基本信息</h3>
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
                    <h3>文件信息</h3>
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

                  <div className="detail-section">
                    <h3>状态管理</h3>
                    <div className="status-actions">
                      <button
                        className="button button--status button--pending"
                        onClick={() => handleStatusChange(selectedSubmission.id, 'pending')}
                        disabled={selectedSubmission.status === 'pending'}
                      >
                        待审核
                      </button>
                      <button
                        className="button button--status button--review"
                        onClick={() => handleStatusChange(selectedSubmission.id, 'under_review')}
                        disabled={selectedSubmission.status === 'under_review'}
                      >
                        审核中
                      </button>
                      <button
                        className="button button--status button--accepted"
                        onClick={() => handleStatusChange(selectedSubmission.id, 'accepted')}
                        disabled={selectedSubmission.status === 'accepted'}
                      >
                        接受
                      </button>
                      <button
                        className="button button--status button--rejected"
                        onClick={() => handleStatusChange(selectedSubmission.id, 'rejected')}
                        disabled={selectedSubmission.status === 'rejected'}
                      >
                        拒绝
                      </button>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>发表管理</h3>
                    {selectedSubmission.is_published ? (
                      <div>
                        <div style={{
                          padding: 16,
                          background: '#d1e7dd',
                          borderRadius: 4,
                          marginBottom: 16,
                          borderLeft: '4px solid #0f5132'
                        }}>
                          <p style={{ margin: 0 }}>
                            ✅ 已发表于：{new Date(selectedSubmission.published_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        <button
                          className="button button--status button--rejected"
                          onClick={() => handleUnpublish(selectedSubmission.id)}
                        >
                          取消发表
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 16 }}>
                          发表后，论文将在网站上公开展示（包括 PDF 和摘要）
                        </p>
                        <button
                          className="button button--accent"
                          onClick={() => handlePublish(selectedSubmission.id)}
                          style={{ width: '100%' }}
                        >
                          🚀 发表论文
                        </button>
                      </div>
                    )}
                  </div>

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
        </div>
      </main>
      <Footer />
    </>
  );
}
