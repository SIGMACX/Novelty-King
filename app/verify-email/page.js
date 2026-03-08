"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";
import { useLang } from "../../contexts/LanguageContext";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP, resendVerification, user } = useAuth();
  const { lang } = useLang();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Get email from URL params if available
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Redirect if already logged in
  if (user) {
    router.push("/");
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (!email || !code) {
        setMessage({
          type: "error",
          text: {
            en: "Please enter both email and verification code",
            zh: "请输入邮箱和验证码"
          }
        });
        setLoading(false);
        return;
      }

      const { data, error } = await verifyOTP(email, code);

      if (error) {
        setMessage({
          type: "error",
          text: {
            en: "Invalid verification code. Please check and try again.",
            zh: "验证码无效，请检查后重试。"
          }
        });
      } else {
        setMessage({
          type: "success",
          text: {
            en: "Email verified successfully! Redirecting...",
            zh: "邮箱验证成功！正在跳转..."
          }
        });
        setTimeout(() => {
          router.push("/");
        }, 1500);
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

  const handleResend = async () => {
    if (!email) {
      setMessage({
        type: "error",
        text: {
          en: "Please enter your email address",
          zh: "请输入您的邮箱地址"
        }
      });
      return;
    }

    setMessage(null);
    setLoading(true);

    try {
      const { data, error } = await resendVerification(email);

      if (error) {
        setMessage({
          type: "error",
          text: {
            en: "Failed to resend verification code. Please try again later.",
            zh: "重新发送验证码失败，请稍后重试。"
          }
        });
      } else {
        setMessage({
          type: "success",
          text: {
            en: "Verification code resent! Please check your email.",
            zh: "验证码已重新发送！请检查您的邮箱。"
          }
        });
        setResendCooldown(60); // 60 seconds cooldown
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
                  <h1 className="auth-title">
                    <span className="lang-en-inline">Verify Your Email</span>
                    <span className="lang-zh-inline"> / 验证邮箱</span>
                  </h1>
                  <p className="auth-subtitle">
                    <span className="lang-en">
                      Enter the verification code sent to your email
                    </span>
                    <span className="lang-zh">
                      输入发送到您邮箱的验证码
                    </span>
                  </p>
                </div>

                {message && (
                  <div className={`auth-message auth-message--${message.type}`}>
                    {getMessage()}
                  </div>
                )}

                <form onSubmit={handleVerify} className="auth-form">
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
                    <label htmlFor="code" className="form-label">
                      <span className="lang-en-inline">Verification Code</span>
                      <span className="lang-zh-inline"> / 验证码</span>
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      className="form-input"
                      placeholder="123456"
                      maxLength="6"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="button button--accent button--full"
                  >
                    {loading ? (
                      <>
                        <span className="lang-en-inline">Verifying...</span>
                        <span className="lang-zh-inline">验证中...</span>
                      </>
                    ) : (
                      <>
                        <span className="lang-en-inline">Verify Email</span>
                        <span className="lang-zh-inline">验证邮箱</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-switch">
                  <p>
                    <span className="lang-en">
                      Didn't receive the code?{" "}
                    </span>
                    <span className="lang-zh">
                      没有收到验证码？{" "}
                    </span>
                    <button
                      onClick={handleResend}
                      disabled={loading || resendCooldown > 0}
                      className="auth-link"
                      type="button"
                    >
                      {resendCooldown > 0 ? (
                        <>
                          <span className="lang-en-inline">Resend ({resendCooldown}s)</span>
                          <span className="lang-zh-inline">重新发送 ({resendCooldown}秒)</span>
                        </>
                      ) : (
                        <>
                          <span className="lang-en-inline">Resend Code</span>
                          <span className="lang-zh-inline">重新发送</span>
                        </>
                      )}
                    </button>
                  </p>
                </div>

                <div className="auth-footer">
                  <Link href="/login" className="auth-back">
                    <span className="lang-en-inline">← Back to Login</span>
                    <span className="lang-zh-inline">← 返回登录</span>
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
