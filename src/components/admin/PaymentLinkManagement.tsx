import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { invokeWorker } from '@/lib/worker';

interface PaymentLink {
  id: string;
  section_name: string;
  link_url: string;
  created_at?: string | null;
}

interface PaymentLinkFormData {
  section_name: string;
  link_url: string;
}

const SECTIONS_WITH_PAYMENT_LINKS = [
  'Customer Subscription',
  'Consultant Application',
  // Add other sections as needed
];

const PaymentLinkManagement: React.FC = () => {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<PaymentLink | null>(null);
  const [formData, setFormData] = useState<PaymentLinkFormData>({
    section_name: '',
    link_url: '',
  });

  useEffect(() => {
    fetchPaymentLinks();
  }, []);

  const fetchPaymentLinks = async () => {
    try {
      setLoading(true);
      const data = await invokeWorker('get-payment-links', {});
      setPaymentLinks(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Error fetching payment links: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingLink) {
      // Update existing link
      try {
        await invokeWorker('update-payment-link', { ...formData, id: editingLink.id });
        toast.success('Payment link updated successfully!');
        setEditingLink(null);
        setFormData({ section_name: '', link_url: '' });
        fetchPaymentLinks();
      } catch (error: any) {
        toast.error('Error updating payment link: ' + error.message);
      }
    } else {
      // Add new link
      try {
        await invokeWorker('create-payment-link', formData);
        toast.success('Payment link added successfully!');
        setFormData({ section_name: '', link_url: '' });
        fetchPaymentLinks();
      } catch (error: any) {
        toast.error('Error adding payment link: ' + error.message);
      }
    }
    setLoading(false);
  };

  const handleEdit = (link: PaymentLink) => {
    setEditingLink(link);
    setFormData({
      section_name: link.section_name,
      link_url: link.link_url,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment link?')) {
      return;
    }
    setLoading(true);
    try {
      await invokeWorker('delete-payment-link', { id });
      toast.success('Payment link deleted successfully!');
      fetchPaymentLinks();
    } catch (error: any) {
      toast.error('Error deleting payment link: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Link Management</h1>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {editingLink ? 'Edit Payment Link' : 'Add New Payment Link'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="section_name" className="block text-sm font-medium text-gray-700">
              Section Name
            </Label>
            {editingLink ? (
              <Input
                type="text"
                id="section_name"
                value={formData.section_name}
                disabled
                className="mt-1 block w-full bg-gray-100 cursor-not-allowed"
              />
            ) : (
              <Select
                value={formData.section_name}
                onValueChange={(value) => setFormData({ ...formData, section_name: value })}
                required
              >
                <SelectTrigger className="mt-1 block w-full">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS_WITH_PAYMENT_LINKS.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label htmlFor="link_url" className="block text-sm font-medium text-gray-700">
              Payment Link URL
            </Label>
            <Input
              type="url"
              id="link_url"
              value={formData.link_url}
              onChange={handleChange}
              required
              className="mt-1 block w-full"
            />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Processing...' : editingLink ? 'Update Link' : 'Add Link'}
        </Button>
        {editingLink && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditingLink(null);
              setFormData({ section_name: '', link_url: '', });
            }}
            className="w-full mt-2"
            disabled={loading}
          >
            Cancel Edit
          </Button>
        )}
      </form>

      <h2 className="text-xl font-semibold mb-4">Existing Payment Links</h2>
      {loading ? (
        <p>Loading payment links...</p>
      ) : (
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow>
              <TableHead>Section Name</TableHead>
              <TableHead>Link URL</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentLinks.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-medium">{link.section_name}</TableCell>
                <TableCell>
                  <a href={link.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {link.link_url}
                  </a>
                </TableCell>
                <TableCell>{new Date(link.created_at || '').toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(link)} className="mr-2">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(link.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default PaymentLinkManagement;
