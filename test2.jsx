import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Loader2 } from "lucide-react";

const SendEmailDialog = ({
   pdfRef,
   mailWoheaderWoSign,
   mailheadersign,
   mailHeaderWOSign,
   mailWOheadersign,
   showLetterhead,
   showSignature
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    to_email: '',
    subject_email: '',
    description_email: '',
    attachment_email: null
  });

  const handleEmail = async (ref) => {
    if (showLetterhead && showSignature) {
      return await mailheadersign(ref);
    } else if (showLetterhead) {
      return await mailHeaderWOSign(ref);
    } else if (showSignature) {
      return await mailWOheadersign(ref);
    } else {
      return await mailWoheaderWoSign(ref);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate PDF based on checkbox states
      const pdfBlob = await handleEmail(pdfRef.current);
      
      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('to_email', formData.to_email);
      formDataToSend.append('subject_email', formData.subject_email);
      formDataToSend.append('description_email', formData.description_email);
      formDataToSend.append('attachment_email', pdfBlob, 'Sales_Contract.pdf');

      // Send email
      const token = localStorage.getItem('token');
      const response = await fetch('https://exportbiz.in/public/api/panel-send-document-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Close dialog and reset form
      setIsOpen(false);
      setFormData({
        to_email: '',
        subject_email: '',
        description_email: '',
        attachment_email: null
      });
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-yellow-200 text-black hover:bg-yellow-500 flex items-center justify-start gap-2">
          <Mail className="h-4 w-4" />
          <span>Send Mail</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Contract via Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Recipient Email"
              type="email"
              required
              value={formData.to_email}
              onChange={(e) => setFormData(prev => ({ ...prev, to_email: e.target.value }))}
            />
          </div>
          <div>
            <Input
              placeholder="Subject"
              required
              value={formData.subject_email}
              onChange={(e) => setFormData(prev => ({ ...prev, subject_email: e.target.value }))}
            />
          </div>
          <div>
            <Textarea
              placeholder="Email Description"
              required
              value={formData.description_email}
              onChange={(e) => setFormData(prev => ({ ...prev, description_email: e.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailDialog;