import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FollowAuthorProvider } from './context/follow-author-context';
import { FollowedAuthorsModal } from './components/FollowedAuthorsModal';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/Home';
import { ArticlesPage } from './pages/Articles';
import { ArticleDetailPage } from './pages/ArticleDetail';
import { AboutPage } from './pages/About';
import { MastheadPage } from './pages/Masthead';
import { AuthorProfilePage } from './pages/AuthorProfile';
import { CitationsPage } from './pages/Citations';
import { ContactPage } from './pages/Contact';
import { PrivacyPage, TermsPage, NotFoundPage } from './pages/LegalAndMisc';

export function App() {
  return (
    <FollowAuthorProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:slug" element={<ArticleDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/masthead" element={<MastheadPage />} />
              <Route path="/authors/:id" element={<AuthorProfilePage />} />
              <Route path="/author/:id" element={<AuthorProfilePage />} />
              <Route path="/citations" element={<CitationsPage />} />
              <Route path="/citation-guidelines" element={<CitationsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <FollowedAuthorsModal />
        </div>
      </BrowserRouter>
    </FollowAuthorProvider>
  );
}
