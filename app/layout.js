import "./globals.css";
import { LanguageProvider } from "../contexts/LanguageContext";
import { AuthProvider } from "../contexts/AuthContext";
import BodyLangSync from "../components/BodyLangSync";

export const metadata = {
  title: "Novelty - Journal of Academic Novelty",
  description: "Journal of Academic Novelty - Advancing research through innovative scholarship",
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
