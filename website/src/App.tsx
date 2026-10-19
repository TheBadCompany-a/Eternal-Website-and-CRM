import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { ConciergeModal } from './components/ConciergeModal';
import { CookieConsent } from './components/CookieConsent';
import { trackPageview } from './utils/analytics';
import { HomeView } from './views/HomeView';
import { SHOW_VEHICLE } from './config/features';

// Route-split everything but the homepage — the most common entry point
// stays eager so the first paint has no loading flash; every other view is
// fetched only when its route is actually visited, keeping the initial
// bundle smaller.
const AboutView = lazy(() => import('./views/AboutView').then((m) => ({ default: m.AboutView })));
const OurStoryView = lazy(() => import('./views/OurStoryView').then((m) => ({ default: m.OurStoryView })));
const VehicleView = lazy(() => import('./views/VehicleView').then((m) => ({ default: m.VehicleView })));
const ServicesView = lazy(() => import('./views/ServicesView').then((m) => ({ default: m.ServicesView })));
const InstitutionsView = lazy(() => import('./views/InstitutionsView').then((m) => ({ default: m.InstitutionsView })));
const VisionView = lazy(() => import('./views/VisionView').then((m) => ({ default: m.VisionView })));
const ConciergePanelView = lazy(() => import('./views/ConciergePanelView').then((m) => ({ default: m.ConciergePanelView })));
const InsightsView = lazy(() => import('./views/InsightsView').then((m) => ({ default: m.InsightsView })));
const ContactView = lazy(() => import('./views/ContactView').then((m) => ({ default: m.ContactView })));
const NoteView = lazy(() => import('./views/NoteView').then((m) => ({ default: m.NoteView })));
const NotFoundView = lazy(() => import('./views/NotFoundView').then((m) => ({ default: m.NotFoundView })));
const PrivacyPolicyView = lazy(() => import('./views/PrivacyPolicyView').then((m) => ({ default: m.PrivacyPolicyView })));
const TermsOfUseView = lazy(() => import('./views/TermsOfUseView').then((m) => ({ default: m.TermsOfUseView })));
const FAQView = lazy(() => import('./views/FAQView').then((m) => ({ default: m.FAQView })));
const HomeViewV2 = lazy(() => import('./views/HomeViewV2').then((m) => ({ default: m.HomeViewV2 })));
const AsthiVisarjanView = lazy(() => import('./views/AsthiVisarjanView').then((m) => ({ default: m.AsthiVisarjanView })));
const StarTributeView = lazy(() => import('./views/StarTributeView').then((m) => ({ default: m.StarTributeView })));
const BookStarView = lazy(() => import('./views/star/BookStarView').then((m) => ({ default: m.BookStarView })));
const StarPaymentView = lazy(() => import('./views/star/StarPaymentView').then((m) => ({ default: m.StarPaymentView })));
const StarLoginView = lazy(() => import('./views/star/StarLoginView').then((m) => ({ default: m.StarLoginView })));
const StarDashboardView = lazy(() => import('./views/star/StarDashboardView').then((m) => ({ default: m.StarDashboardView })));
const BookedStarProfileView = lazy(() => import('./views/star/BookedStarProfileView').then((m) => ({ default: m.BookedStarProfileView })));
const StarResetPasswordView = lazy(() => import('./views/star/StarResetPasswordView').then((m) => ({ default: m.StarResetPasswordView })));
const ImmediateReliefView = lazy(() => import('./views/services/ServiceCategoryDetailView').then((m) => ({ default: m.ImmediateReliefView })));
const SereneGatheringsView = lazy(() => import('./views/services/ServiceCategoryDetailView').then((m) => ({ default: m.SereneGatheringsView })));
const NaturalBeautyView = lazy(() => import('./views/services/ServiceCategoryDetailView').then((m) => ({ default: m.NaturalBeautyView })));
const EmpathicCareView = lazy(() => import('./views/services/ServiceCategoryDetailView').then((m) => ({ default: m.EmpathicCareView })));
const PeaceOfMindView = lazy(() => import('./views/services/ServiceCategoryDetailView').then((m) => ({ default: m.PeaceOfMindView })));
const SpecialisedServicesView = lazy(() => import('./views/services/ServiceCategoryDetailView').then((m) => ({ default: m.SpecialisedServicesView })));
const ServiceDetailPage = lazy(() => import('./views/services/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })));

const RouteFallback: React.FC = () => <div className="min-h-[60vh] bg-ivory" aria-hidden="true" />;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageview(pathname);
  }, [pathname]);
  return null;
};

const AppShell: React.FC = () => {
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [conciergeCategory, setConciergeCategory] = useState('General Service Enquiry');
  const handleOpenConcierge = (category: string = 'General Service Enquiry') => {
    setConciergeCategory(category);
    setConciergeOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-ivory text-charcoal font-sans antialiased selection:bg-gold selection:text-white`}>
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomeView onOpenConcierge={() => handleOpenConcierge('General Service Enquiry')} />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="/our-story" element={<OurStoryView />} />
            <Route path="/vehicle" element={SHOW_VEHICLE ? <VehicleView onOpenConcierge={() => handleOpenConcierge('Vehicle Inspection')} /> : <Navigate to="/" replace />} />
            <Route path="/services" element={<ServicesView onOpenConcierge={(title) => handleOpenConcierge(title || 'Service Enquiry')} />} />
            <Route path="/services/immediate-relief-transport" element={<ImmediateReliefView onOpenConcierge={(title) => handleOpenConcierge(title || 'Immediate Response')} />} />
            <Route path="/services/immediate-response" element={<ImmediateReliefView onOpenConcierge={(title) => handleOpenConcierge(title || 'Immediate Response')} />} />
            <Route path="/services/serene-gatherings-remembrance" element={<SereneGatheringsView onOpenConcierge={(title) => handleOpenConcierge(title || 'Memorial & Floral Services')} />} />
            <Route path="/services/memorial-floral-services" element={<SereneGatheringsView onOpenConcierge={(title) => handleOpenConcierge(title || 'Memorial & Floral Services')} />} />
            <Route path="/services/natural-beauty-reverence" element={<NaturalBeautyView onOpenConcierge={(title) => handleOpenConcierge(title || 'Memorial & Floral Services')} />} />
            <Route path="/services/empathic-care-keepsakes" element={<EmpathicCareView onOpenConcierge={(title) => handleOpenConcierge(title || 'Family Support')} />} />
            <Route path="/services/family-support" element={<EmpathicCareView onOpenConcierge={(title) => handleOpenConcierge(title || 'Family Support')} />} />
            <Route path="/services/reassuring-peace-of-mind" element={<PeaceOfMindView onOpenConcierge={(title) => handleOpenConcierge(title || 'Pre-Planning')} />} />
            <Route path="/services/financial-pre-planning" element={<PeaceOfMindView onOpenConcierge={(title) => handleOpenConcierge(title || 'Pre-Planning')} />} />
            <Route path="/services/specialised-services" element={<SpecialisedServicesView onOpenConcierge={(title) => handleOpenConcierge(title || 'Specialized Services')} />} />
            <Route path="/services/detail/:slug" element={<ServiceDetailPage onOpenConcierge={(title) => handleOpenConcierge(title || 'Service Enquiry')} />} />
            <Route path="/asthi-visarjan" element={<AsthiVisarjanView onOpenConcierge={() => handleOpenConcierge('Asthi Visarjan')} />} />
            <Route path="/services/asthi-visarjan" element={<AsthiVisarjanView onOpenConcierge={() => handleOpenConcierge('Asthi Visarjan')} />} />
            <Route path="/asthi-visarjan/star/:slug" element={<StarTributeView />} />
            <Route path="/book-a-star" element={<BookStarView />} />
            <Route path="/star-payment" element={<StarPaymentView />} />
            <Route path="/my-star/login" element={<StarLoginView />} />
            <Route path="/my-star/reset-password" element={<StarResetPasswordView />} />
            <Route path="/my-star" element={<StarDashboardView />} />
            <Route path="/star/:slug" element={<BookedStarProfileView />} />
            <Route path="/aastivisarjan" element={<Navigate to="/asthi-visarjan" replace />} />
            <Route path="/institutions" element={<InstitutionsView onOpenConcierge={() => handleOpenConcierge('Institutional Briefing')} />} />
            <Route path="/vision" element={<VisionView />} />
            <Route path="/concierge" element={<ConciergePanelView />} />
            <Route path="/insights" element={<InsightsView />} />
            <Route path="/contact" element={<ContactView />} />
            <Route path="/a-word-of-trust" element={<NoteView />} />
            <Route path="/faq" element={<FAQView />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyView />} />
            <Route path="/terms-of-use" element={<TermsOfUseView />} />
            <Route path="/v2" element={<HomeViewV2 onOpenConcierge={() => handleOpenConcierge('General Service Enquiry')} />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
      <ConciergeModal isOpen={conciergeOpen} onClose={() => setConciergeOpen(false)} defaultCategory={conciergeCategory} />
      <CookieConsent />
    </div>
  );
};

export const App: React.FC = () => (
  <BrowserRouter>
    <ScrollToTop />
    <AppShell />
  </BrowserRouter>
);

export default App;
