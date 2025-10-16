
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Properties from "./pages/Properties";
import Progress from "./pages/Progress";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import BookSiteVisit from "./pages/BookSiteVisit";
import CustomerSubscription from "./pages/CustomerSubscription";
import ConsultantSubscription from "./pages/ConsultantSubscription";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Testimonials from "./pages/Testimonials";
import FAQ from "./pages/FAQ";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book-site-visit" element={<BookSiteVisit />} />
                     <Route path="/customer-subscription" element={<CustomerSubscription />} />
           <Route path="/consultant-subscription" element={<ConsultantSubscription />} />
           <Route path="/blog" element={<Blog />} />
           <Route path="/blog/:slug" element={<BlogPost />} />
           <Route path="/testimonials" element={<Testimonials />} />
           <Route path="/faq" element={<FAQ />} />
           <Route path="/feedback" element={<Feedback />} />
           <Route path="/dashboard/admin" element={<AdminDashboard />} />
           <Route path="/dashboard/client" element={<ClientDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
