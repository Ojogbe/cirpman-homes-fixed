import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Mail, Download, Trash2, User, Calendar, Filter } from 'lucide-react';

interface NewsletterSubscription {
  id: string;
  email: string;
  name: string;
  status: string;
  source: string;
  created_at: string;
  unsubscribed_at: string;
}

const NewsletterManagement = () => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch newsletter subscriptions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || subscription.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleStatusChange = async (subscriptionId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'unsubscribed') {
        updateData.unsubscribed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update(updateData)
        .eq('id', subscriptionId);

      if (error) throw error;
      toast.success('Subscription status updated successfully!');
      fetchSubscriptions();
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const handleDelete = async (subscriptionId: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        const { error } = await supabase
          .from('newsletter_subscriptions')
          .delete()
          .eq('id', subscriptionId);

        if (error) throw error;
        toast.success('Subscription deleted successfully!');
        fetchSubscriptions();
      } catch (error: any) {
        toast.error('Failed to delete subscription: ' + error.message);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Name', 'Status', 'Source', 'Created At', 'Unsubscribed At'];
    const csvContent = [
      headers.join(','),
      ...filteredSubscriptions.map(sub => [
        sub.email,
        sub.name || '',
        sub.status,
        sub.source,
        new Date(sub.created_at).toLocaleDateString(),
        sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      unsubscribed: { color: 'bg-red-100 text-red-800', label: 'Unsubscribed' },
      bounced: { color: 'bg-yellow-100 text-yellow-800', label: 'Bounced' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    unsubscribed: subscriptions.filter(s => s.status === 'unsubscribed').length,
    bounced: subscriptions.filter(s => s.status === 'bounced').length
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently subscribed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <Mail className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unsubscribed}</div>
            <p className="text-xs text-muted-foreground">Opted out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounced</CardTitle>
            <Mail className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.bounced}</div>
            <p className="text-xs text-muted-foreground">Failed deliveries</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Newsletter Subscriptions</span>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
          <CardDescription>
            Manage newsletter subscriptions, track engagement, and export subscriber data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="contact_form">Contact Form</SelectItem>
                <SelectItem value="website_subscription">Website Subscription</SelectItem>
                <SelectItem value="manual">Manual Entry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => (
              <Card key={subscription.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-brand-gold flex items-center justify-center">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {subscription.email}
                        </h3>
                        {subscription.name && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {subscription.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined: {formatDate(subscription.created_at)}
                        </p>
                        {subscription.unsubscribed_at && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Unsubscribed: {formatDate(subscription.unsubscribed_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(subscription.status)}
                    <Badge variant="outline" className="text-xs">
                      {subscription.source}
                    </Badge>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {subscription.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(subscription.id, 'unsubscribed')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Unsubscribe
                      </Button>
                    )}
                    {subscription.status === 'unsubscribed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(subscription.id, 'active')}
                        className="text-green-600 hover:text-green-700"
                      >
                        Resubscribe
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(subscription.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredSubscriptions.length === 0 && !loading && (
            <div className="text-center py-12">
              <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 text-lg mb-4">No subscribers found</div>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterManagement;
