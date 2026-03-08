"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { useLang } from "../../contexts/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user } = useAuth();
  const { lang } = useLang();
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Redirect if already logged in
  if (user) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "register") {
        // Validate password match
        if (password !== confirmPassword) {
          setMessage({
            type: "error",
            text: {
              en: "Passwords do not match",
              zh: "密码不匹配"
            }
          });
          setLoading(false);
          return;
        }

        // Validate password length
        if (password.length < 6) {
          setMessage({
            type: "error",
            text: {
              en: "Password must be at least 6 characters",
              zh: "密码至少需要6个字符"
            }
          });
          setLoading(false);
          return;
        }

        const { data, error } = await signUp(email, password);

        if (error) {
          setMessage({
            type: "error",
            text: {
              en: error.message,
              zh: "注册失败: " + error.message
            }
          });
        } else {
          // Check if user is immediately confirmed (email confirmation disabled in Supabase)
          if (data.user && data.session) {
            // User is confirmed and logged in, redirect to home
            setMessage({
              type: "success",
              text: {
                en: "Registration successful! Redirecting...",
                zh: "注册成功！正在跳转..."
              }
            });
            setTimeout(() => {
              router.push("/");
            }, 1000);
          } else {
            // User needs to verify email with OTP code
            setMessage({
              type: "success",
              text: {
                en: "Registration successful! Please check your email for the verification code.",
                zh: "注册成功！请检查您的邮箱获取验证码。"
              }
            });
            // Redirect to verification page after a short delay
            setTimeout(() => {
              router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            }, 2000);
          }
        }
      } else {
        const { data, error } = await signIn(email, password);

        if (error) {
          setMessage({
            type: "error",
            text: {
              en: "Invalid email or password",
              zh: "邮箱或密码错误"
            }
          });
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: {
          en: "An error occurred. Please try again.",
          zh: "发生错误，请重试。"
        }
      });
    }

    setLoading(false);
  };

  const getMessage = () => {
    if (!message) return null;
    if (lang === "en") return message.text.en;
    if (lang === "zh") return message.text.zh;
    return message.text.en + " / " + message.text.zh;
  };

  return (
    <>
      <Header />

      <main>
        <section className="section">
          <div className="container">
            <div className="auth-container">
              <div className="auth-box">
                <div className="auth-header">
                  <div className="mono" style={{ marginBottom: 8, color: "var(--accent)" }}>
                    ✍️ AUTHOR ACCESS
                  </div>
                  <h1 className="auth-title">
                    {mode === "login" ? (
                      <>
                        <span className="lang-en-inline">Author Log In</span>
                        <span className="lang-zh-inline"> / 作者登录</span>
                      </>
                    ) : (
                      <>
                        <span className="lang-en-inline">Author Register</span>
                        <span className="lang-zh-inline"> / 作者注册</span>
                      </>
                    )}
                  </h1>
                  <p className="auth-subtitle">
                    <span className="lang-en">
                      {mode === "login"
                        ? "Sign in as an author to submit papers"
                        : "Create a new author account"
                      }
                    </span>
                    <span className="lang-zh">
                      {mode === "login"
                        ? "作者登录以提交论文"
                        : "创建新的作者账户"
                      }
                    </span>
                  </p>
                </div>

                {message && (
                  <div className={`auth-message auth-message--${message.type}`}>
                    {getMessage()}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <span className="lang-en-inline">Email</span>
                      <span className="lang-zh-inline"> / 邮箱</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-input"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      <span className="lang-en-inline">Password</span>
                      <span className="lang-zh-inline"> / 密码</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="form-input"
                      placeholder="••••••••"
                    />
                  </div>

                  {mode === "register" && (
                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">
                        <span className="lang-en-inline">Confirm Password</span>
                        <span className="lang-zh-inline"> / 确认密码</span>
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="form-input"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="button button--accent button--full"
                  >
                    {loading ? (
                      <>
                        <span className="lang-en-inline">Loading...</span>
                        <span className="lang-zh-inline">加载中...</span>
                      </>
                    ) : mode === "login" ? (
                      <>
                        <span className="lang-en-inline">Log In</span>
                        <span className="lang-zh-inline">登录</span>
                      </>
                    ) : (
                      <>
                        <span className="lang-en-inline">Register</span>
                        <span className="lang-zh-inline">注册</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-switch">
                  {mode === "login" ? (
                    <p>
                      <span className="lang-en">
                        Don't have an account?{" "}
                      </span>
                      <span className="lang-zh">
                        还没有账户？{" "}
                      </span>
                      <button
                        onClick={() => {
                          setMode("register");
                          setMessage(null);
                        }}
                        className="auth-link"
                      >
                        <span className="lang-en-inline">Register</span>
                        <span className="lang-zh-inline">注册</span>
                      </button>
                    </p>
                  ) : (
                    <p>
                      <span className="lang-en">
                        Already have an account?{" "}
                      </span>
                      <span className="lang-zh">
                        已有账户？{" "}
                      </span>
                      <button
                        onClick={() => {
                          setMode("login");
                          setMessage(null);
                        }}
                        className="auth-link"
                      >
                        <span className="lang-en-inline">Log In</span>
                        <span className="lang-zh-inline">登录</span>
                      </button>
                    </p>
                  )}
                </div>

                <div className="auth-footer">
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                      管理员登录？{" "}
                      <Link href="/admin/login" style={{ color: "#dc3545", fontWeight: 600 }}>
                        管理员入口 →
                      </Link>
                    </p>
                  </div>
                  <Link href="/" className="auth-back">
                    <span className="lang-en-inline">← Back to Home</span>
                    <span className="lang-zh-inline">← 返回首页</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
