import "./globals.css";
import { LanguageProvider } from "../contexts/LanguageContext";
import { AuthProvider } from "../contexts/AuthContext";
import BodyLangSync from "../components/BodyLangSync";

export const metadata = {
  title: "Novelty King | 创新之王 - Academic Journal Platform",
  description:
    "Novelty King (创新之王) is an academic journal platform for publishing innovative research papers. Submit your research and join our cultivation pool. 学术期刊平台，发表创新研究论文。",
  keywords: "academic journal, research papers, novelty, innovation, peer review, 学术期刊, 研究论文, 创新, 同行评审",
  authors: [{ name: "Novelty King Editorial Board" }],
  openGraph: {
    title: "Novelty King | 创新之王",
    description: "Academic journal platform for innovative research papers",
    url: "https://novelty-king.vercel.app",
    siteName: "Novelty King",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Novelty King | 创新之王",
    description: "Academic journal platform for innovative research papers",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '202e2d3727eb3f3f',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body data-lang="both">
        <AuthProvider>
          <LanguageProvider>
            <BodyLangSync />
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
