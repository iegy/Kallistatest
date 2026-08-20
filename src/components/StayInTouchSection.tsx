import React from 'react';
import { PortfolioCategory } from '../types';

interface StayInTouchSectionProps {
  categories: PortfolioCategory[];
  onSaveLead: (lead: {
    name: string;
    phone: string;
    whatsapp?: string;
    email: string;
    birthday?: string;
    governorate?: string;
    city?: string;
    serviceInterests?: string[];
    notes?: string;
  }) => Promise<boolean>;
}

/**
 * Intentionally disabled.
 * The main ContactAndBookingSection now contains the single public enquiry form,
 * including optional birthday/anniversary fields, so the second lead form is no
 * longer rendered to visitors. Keeping this component preserves App.tsx and the
 * existing Firebase lead infrastructure without duplicating the public UI.
 */
export const StayInTouchSection: React.FC<StayInTouchSectionProps> = () => null;
