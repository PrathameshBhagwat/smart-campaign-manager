'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Campaign, CampaignCreate, CampaignUpdate } from '@/types/campaign'
import { CampaignService } from '@/services/campaign.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CAMPAIGN_TEMPLATES } from '@/constants/campaignTemplates'

const campaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters'),
  course_name: z.string().min(1, 'Offering name is required'),
  city: z.string().min(1, 'City is required'),
  business_type: z.string().min(1, 'Business type is required'),
  offering_type: z.string().min(1, 'Offering type is required'),
  target_goal: z.string().min(1, 'Target goal is required'),
})

type CampaignFormValues = z.infer<typeof campaignSchema>

interface CampaignFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: Campaign
}

export function CampaignForm({ open, onOpenChange, onSuccess, initialData }: CampaignFormProps) {
  const isEditing = !!initialData

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initialData?.name || '',
      course_name: initialData?.course_name || '', // Legacy compatibility
      city: initialData?.city || '',
      business_type: initialData?.business_type || 'education',
      offering_type: initialData?.offering_type || 'course',
      target_goal: initialData?.target_goal || 'enrollment',
    },
  })

  // Watch for smart defaults
  const businessType = form.watch('business_type')
  
  useEffect(() => {
    if (!isEditing && businessType) {
      // @ts-ignore
      const template = CAMPAIGN_TEMPLATES[businessType];
      if (template) {
        form.setValue('offering_type', template.offering_type);
        form.setValue('target_goal', template.target_goal);
      }
    }
  }, [businessType, form, isEditing])

  async function onSubmit(data: CampaignFormValues) {
    try {
      const payload: CampaignCreate | CampaignUpdate = {
        ...data,
        offering_name: data.course_name, // Map for new schema
        business_config: { tone: "professional", cta_style: "soft", language: "english", industry_notes: "" }
      }
      
      if (isEditing) {
        await CampaignService.updateCampaign(initialData.id, payload)
        toast.success('Campaign updated successfully')
      } else {
        await CampaignService.createCampaign(payload as CampaignCreate)
        toast.success('Campaign created successfully')
      }
      form.reset()
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while saving the campaign')
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) form.reset()
    onOpenChange(newOpen)
  }

  // Get preview text based on type
  const getPreviewStyle = () => {
    switch (businessType) {
      case 'education': return 'Professional Educational Outreach\nFocused on learning and career growth.';
      case 'finance': return 'Professional Financial Education Outreach\nFocused on awareness and responsible investing.';
      case 'recruitment': return 'Professional Recruitment Outreach\nFocused on opportunities, not guarantees.';
      case 'real_estate': return 'Professional Property Outreach\nFocused on information and consultation.';
      case 'generic': return 'Professional Business Outreach\nFocused on relationship building.';
      default: return 'Professional Outreach';
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Make changes to your campaign here. Click save when you are done.'
              : 'Configure a domain-agnostic campaign to organize your outreach.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Q3 Outreach" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="business_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="recruitment">Recruitment</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="generic">Generic Business</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="offering_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offering Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="bootcamp">Bootcamp</SelectItem>
                        <SelectItem value="mentorship">Mentorship</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="program">Program</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="target_goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="enrollment">Enrollment</SelectItem>
                        <SelectItem value="lead_generation">Lead Generation</SelectItem>
                        <SelectItem value="applications">Applications</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="awareness">Awareness</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="course_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offering Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Fullstack Web Dev or Retail Space" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 text-sm flex flex-col mt-2">
              <span className="font-semibold text-indigo-900 mb-1">Preview AI Tone</span>
              <span className="text-indigo-700 whitespace-pre-line">{getPreviewStyle()}</span>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Save changes' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
