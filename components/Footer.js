"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__content">
          {/* Left section - About */}
          <div className="footer-section footer-about">
            <div className="footer-logo">
              <Image
                src="/image_logo/logo.png"
                alt="Novelty King Logo"
                width={60}
                height={60}
                style={{ objectFit: 'contain' }}
              />
              <h3>Novelty King</h3>
            </div>
            <p className="footer-description">
              A platform for publishing innovative research papers and preprints.
              Join our cultivation pool and share your groundbreaking ideas.
            </p>
            <p className="footer-disclaimer">
              整活不代表学术观点，请各位看官自行分辨！
            </p>
          </div>

          {/* Middle section - Guidelines */}
          <div className="footer-section">
            <h4 className="footer-section__title">Guidelines</h4>
            <ul className="footer-links">
              <li>
                <Link href="/submit">Submission Guidelines</Link>
              </li>
              <li>
                <Link href="/publications">Publication Process</Link>
              </li>
              <li>
                <Link href="/about">Review Criteria</Link>
              </li>
              <li>
                <Link href="/about">Author Rights</Link>
              </li>
            </ul>
          </div>

          {/* Right section - Contact */}
          <div className="footer-section">
            <h4 className="footer-section__title">Contact</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:contact@noveltyking.com">Email Us</a>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/my-submissions">My Submissions</Link>
              </li>
              <li>
                <Link href="/admin/login">Admin Login</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="site-footer__bottom">
          <p>&copy; {new Date().getFullYear()} Novelty King. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
