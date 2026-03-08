"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useLang } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { lang, setLang } = useLang();
  const { user, signOut, checkIsAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef(null);

  // Check admin status
  useEffect(() => {
    const verifyAdmin = async () => {
      if (user && checkIsAdmin) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };
    verifyAdmin();
  }, [user, checkIsAdmin]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <div className="site-header__left">
          <Link className="nav-link" href="/">
            <span className="lang-en-inline">Home</span>
            <span className="lang-zh-inline">首页</span>
          </Link>
          <Link className="nav-link" href="/publications">
            <span className="lang-en-inline">Publications</span>
            <span className="lang-zh-inline">已发表</span>
          </Link>
          <Link className="nav-link" href="/preprints">
            <span className="lang-en-inline">Articles</span>
            <span className="lang-zh-inline">文章</span>
          </Link>
          <Link className="nav-link" href="/about">
            <span className="lang-en-inline">About</span>
            <span className="lang-zh-inline">关于</span>
          </Link>
        </div>

        <Link className="site-logo" href="/" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Image
            src="/image_logo/logo.png"
            alt="Novelty King Logo"
            width={80}
            height={80}
            style={{ objectFit: 'contain' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="site-logo__mark" style={{ fontSize: '1.8rem', fontWeight: 700 }}>Novelty King</span>
            <span className="site-logo__meta" style={{ fontSize: '0.8rem', lineHeight: 1.2, maxWidth: '200px', color: 'var(--muted)' }}>
              创新之王
            </span>
          </div>
        </Link>

        <div className="site-header__right">
          {/* Language switcher */}
          <div className="lang-switcher" data-lang={lang}>
            <button
              className={`lang-btn${lang === "en" ? " active" : ""}`}
              onClick={() => setLang(lang === "en" ? "both" : "en")}
              title="English only"
            >
              EN
            </button>
            <button
              className={`lang-btn${lang === "zh" ? " active" : ""}`}
              onClick={() => setLang(lang === "zh" ? "both" : "zh")}
              title="仅中文"
            >
              中
            </button>
          </div>

          <Link className="button button--accent" href="/submit">
            <span className="lang-en-inline">Submit</span>
            <span className="lang-zh-inline" style={{ color: "rgba(255,255,255,0.82)" }}>投稿</span>
          </Link>

          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>👤</span>
                <span className="lang-en-inline">Account</span>
                <span className="lang-zh-inline">账户</span>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="user-dropdown-email">
                    {user.email}
                  </div>
                  <Link
                    href="/my-submissions"
                    className="user-dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="lang-en-inline">My Submissions</span>
                    <span className="lang-zh-inline">我的投稿</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="user-dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="lang-en-inline">Admin Dashboard</span>
                      <span className="lang-zh-inline">管理后台</span>
                    </Link>
                  )}
                  <button
                    className="user-dropdown-item"
                    onClick={handleSignOut}
                  >
                    <span className="lang-en-inline">Log Out</span>
                    <span className="lang-zh-inline">登出</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="button" href="/login">
                <span className="lang-en-inline">Author</span>
                <span className="lang-zh-inline">作者</span>
              </Link>
              <Link className="button" href="/admin/login" style={{
                background: "#dc3545",
                color: "white",
                borderColor: "#dc3545"
              }}>
                <span className="lang-en-inline">Admin</span>
                <span className="lang-zh-inline">管理</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
