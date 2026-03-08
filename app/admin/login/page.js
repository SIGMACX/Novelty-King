"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const { signIn, verifyOTP, checkIsAdmin } = useAuth();
  const router = useRouter();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // 验证邮箱格式
      if (!email || !email.includes("@")) {
        throw new Error("请输入有效的邮箱地址");
      }

      const { error } = await signIn(email);

      if (error) {
        throw error;
      }

      setOtpSent(true);
      setMessage({
        type: "success",
        text: "验证码已发送到您的邮箱，请查收。",
      });
    } catch (error) {
      console.error("发送验证码失败:", error);

      // 特殊处理 OTP 注册不允许的错误
      if (error.message && error.message.includes("Signups not allowed")) {
        setMessage({
          type: "error",
          text: "该邮箱尚未注册。请先通过作者登录页面注册账户，然后在 Supabase 中添加为管理员。详见《管理员设置说明.md》",
        });
      } else {
        setMessage({
          type: "error",
          text: error.message || "发送验证码失败，请重试。",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (!otp || otp.length !== 6) {
        throw new Error("请输入6位验证码");
      }

      const { error } = await verifyOTP(email, otp);

      if (error) {
        throw error;
      }

      // 验证成功后，检查是否是管理员
      const isAdmin = await checkIsAdmin();

      if (!isAdmin) {
        setMessage({
          type: "error",
          text: "您没有管理员权限。请使用作者登录入口。",
        });
        // 3秒后跳转到作者登录页
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      }

      // 是管理员，跳转到管理后台
      setMessage({
        type: "success",
        text: "管理员登录成功！正在跳转...",
      });

      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } catch (error) {
      console.error("验证失败:", error);
      setMessage({
        type: "error",
        text: error.message || "验证码错误，请重试。",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="section">
        <div className="container" style={{ maxWidth: 480 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="mono" style={{ marginBottom: 8, color: "#dc3545" }}>
              🔐 ADMINISTRATOR ACCESS
            </div>
            <h1 style={{ marginBottom: 8, fontSize: "2rem" }}>
              管理员登录
            </h1>
            <p style={{ color: "var(--muted)" }}>
              仅限管理员账户访问
            </p>
          </div>

          {/* 设置提示 */}
          <div style={{
            padding: 16,
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: 4,
            marginBottom: 24,
            fontSize: "0.9rem"
          }}>
            <p style={{ margin: 0, marginBottom: 8, fontWeight: 600 }}>
              ⚠️ 首次设置管理员账号？
            </p>
            <p style={{ margin: 0, color: "#856404" }}>
              1. 先通过<a href="/login" style={{ color: "#dc3545", fontWeight: 600 }}>作者登录</a>注册账户<br />
              2. 在 Supabase SQL Editor 中执行设置脚本<br />
              3. 详细步骤请查看《管理员设置说明.md》
            </p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="section-box">
              <div style={{ marginBottom: 24 }}>
                <label className="form-label">管理员邮箱</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 8 }}>
                  请使用已注册并添加到管理员表的邮箱地址
                </p>
              </div>

              {message.text && (
                <div
                  style={{
                    padding: 16,
                    background: message.type === "error" ? "#f8d7da" : "#d1e7dd",
                    color: message.type === "error" ? "#721c24" : "#0f5132",
                    borderRadius: 4,
                    marginBottom: 16,
                    borderLeft: `4px solid ${message.type === "error" ? "#dc3545" : "#28a745"}`,
                  }}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                className="button button--accent"
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? "发送中..." : "发送验证码"}
              </button>

              <div style={{ marginTop: 24, textAlign: "center" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                  不是管理员？{" "}
                  <a href="/login" style={{ color: "var(--accent)" }}>
                    作者登录入口 →
                  </a>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="section-box">
              <div style={{ marginBottom: 24 }}>
                <label className="form-label">验证码</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入6位验证码"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  disabled={loading}
                  style={{
                    fontSize: "1.5rem",
                    textAlign: "center",
                    letterSpacing: "0.5rem",
                  }}
                />
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 8 }}>
                  验证码已发送至 {email}
                </p>
              </div>

              {message.text && (
                <div
                  style={{
                    padding: 16,
                    background: message.type === "error" ? "#f8d7da" : "#d1e7dd",
                    color: message.type === "error" ? "#721c24" : "#0f5132",
                    borderRadius: 4,
                    marginBottom: 16,
                    borderLeft: `4px solid ${message.type === "error" ? "#dc3545" : "#28a745"}`,
                  }}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                className="button button--accent"
                style={{ width: "100%", marginBottom: 12 }}
                disabled={loading}
              >
                {loading ? "验证中..." : "验证并登录"}
              </button>

              <button
                type="button"
                className="button"
                style={{ width: "100%" }}
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setMessage({ type: "", text: "" });
                }}
                disabled={loading}
              >
                ← 返回重新发送
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
