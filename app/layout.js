import "./globals.css";
import { LanguageProvider } from "../contexts/LanguageContext";
import { AuthProvider } from "../contexts/AuthContext";
import BodyLangSync from "../components/BodyLangSync";

export const metadata = {
  title: "Novelty King - A Platform for Novel Research",
  description:
    "Novelty King is an open platform for publishing innovative research papers and preprints.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
