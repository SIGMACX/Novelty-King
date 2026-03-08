"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useLang } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import NoticeBar from "./NoticeBar";

export default function Header() {
  const { lang, setLang } = useLang();
  const { user, signOut, checkIsAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef(null);
  const menuDropdownRef = useRef(null);

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
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target)) {
        setShowMenuDropdown(false);
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
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <div className="site-header__left">
            <div className="menu-dropdown-container" ref={menuDropdownRef}>
              <button
                className="menu-button"
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              >
                <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>☰</span>
                <span style={{ fontWeight: 600 }}>MENU</span>
              </button>

              {showMenuDropdown && (
                <div className="menu-dropdown">
                  <Link
                    className="menu-dropdown-item"
                    href="/"
                    onClick={() => setShowMenuDropdown(false)}
                  >
                    <span className="nav-link__en">Home</span>
                    <span className="nav-link__zh">首页</span>
                  </Link>
                  <Link
                    className="menu-dropdown-item"
                    href="/publications"
                    onClick={() => setShowMenuDropdown(false)}
                  >
                    <span className="nav-link__en">Articles</span>
                    <span className="nav-link__zh">文章</span>
                  </Link>
                  <Link
                    className="menu-dropdown-item"
                    href="/about"
                    onClick={() => setShowMenuDropdown(false)}
                  >
                    <span className="nav-link__en">About</span>
                    <span className="nav-link__zh">关于</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <Link className="site-logo" href="/" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Image
              src="/image_logo/logo.png"
              alt="Novelty King Logo"
              width={80}
              height={80}
              style={{ objectFit: 'contain' }}
            />
            <span className="site-logo__mark">Novelty King</span>
          </Link>

          <div className="site-header__right">
            <Link className="button button--accent" href="/submit">
              Submit
            </Link>

            {user ? (
              <div className="user-menu" ref={dropdownRef}>
                <button
                  className="user-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span>👤</span>
                  <span>Account</span>
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
                      My Submissions
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="user-dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      className="user-dropdown-item"
                      onClick={handleSignOut}
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link className="button" href="/login">
                  Author
                </Link>
                <Link className="button" href="/admin/login" style={{
                  background: "#dc3545",
                  color: "white",
                  borderColor: "#dc3545"
                }}>
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <NoticeBar />
    </>
  );
}
