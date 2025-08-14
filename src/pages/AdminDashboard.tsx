
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building, Calendar, BarChart3, Images, Clock, FileText, MessageSquare, HelpCircle, Star, FileText as FileTextIcon, Mail } from 'lucide-react';
import ClientsManagement from '@/components/admin/ClientsManagement';
import PropertiesManagement from '@/components/admin/PropertiesManagement';
import SiteVisitsManagement from '@/components/admin/SiteVisitsManagement';
import GalleryManagement from '@/components/admin/GalleryManagement';
import ProgressTimelineManagement from '@/components/admin/ProgressTimelineManagement';
import SubscriptionsManagement from '@/components/admin/SubscriptionsManagement';
import BlogManagement from '@/components/admin/BlogManagement';
import TestimonialsManagement from '@/components/admin/TestimonialsManagement';
import FAQManagement from '@/components/admin/FAQManagement';
import FeedbackManagement from '@/components/admin/FeedbackManagement';
import NewsletterManagement from '@/components/admin/NewsletterManagement';

const AdminDashboard = () => {
  const { user, loading } = useAuth(true, 'admin');
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState({
    clients: 0,
    properties: 0,
    siteVisits: 0,
    revenue: 0,
  });
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      // Total clients
      const { count: clientsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      // Total properties
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      // Site visit requests
      const { count: siteVisitsCount } = await supabase
        .from('site_visit_bookings')
        .select('*', { count: 'exact', head: true });
      // Revenue (sum of all property_bookings.total_price)
      const { data: revenueData, error: revenueError } = await supabase
        .from('property_bookings')
        .select('total_price');
      let revenue = 0;
      if (!revenueError && revenueData) {
        revenue = revenueData.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      }
      setOverview({
        clients: clientsCount || 0,
        properties: propertiesCount || 0,
        siteVisits: siteVisitsCount || 0,
        revenue,
      });
    } catch (e) {
      // fallback to 0s
      setOverview({ clients: 0, properties: 0, siteVisits: 0, revenue: 0 });
    } finally {
      setOverviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-gold"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'properties', label: 'Properties', icon: Building },
    { id: 'site-visits', label: 'Site Visits', icon: Calendar },
    { id: 'subscriptions', label: 'Subscriptions', icon: FileText },
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'progress', label: 'Progress Timeline', icon: Clock },
    { id: 'blog', label: 'Blog', icon: FileTextIcon },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'clients':
        return <ClientsManagement />;
      case 'properties':
        return <PropertiesManagement />;
      case 'site-visits':
        return <SiteVisitsManagement />;
      case 'subscriptions':
        return <SubscriptionsManagement />;
      case 'gallery':
        return <GalleryManagement />;
      case 'progress':
        return <ProgressTimelineManagement />;
      case 'blog':
        return <BlogManagement />;
      case 'testimonials':
        return <TestimonialsManagement />;
      case 'faq':
        return <FAQManagement />;
      case 'feedback':
        return <FeedbackManagement />;
      case 'newsletter':
        return <NewsletterManagement />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewLoading ? '...' : overview.clients}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewLoading ? '...' : overview.properties}</div>
                <p className="text-xs text-muted-foreground">Listed properties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Site Visit Requests</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewLoading ? '...' : overview.siteVisits}</div>
                <p className="text-xs text-muted-foreground">Pending visits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{overviewLoading ? '...' : overview.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-brand-blue">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your real estate platform</p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="ml-4 px-4 py-2 bg-brand-gold text-brand-blue font-semibold rounded hover:bg-brand-gold/90 border border-brand-gold transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-gold text-brand-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
