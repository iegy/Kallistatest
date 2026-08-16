import React from 'react';
import {
  Facebook,
  Ghost,
  Globe2,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Pin,
  Send,
  Twitter,
  Youtube,
} from 'lucide-react';

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'website', label: 'رابط آخر' },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORM_OPTIONS)[number]['value'];

export const inferSocialPlatform = (label = '', url = ''): SocialPlatform => {
  const value = `${label} ${url}`.toLowerCase();
  if (value.includes('instagram')) return 'instagram';
  if (value.includes('facebook') || value.includes('fb.com')) return 'facebook';
  if (value.includes('tiktok')) return 'tiktok';
  if (value.includes('youtube') || value.includes('youtu.be')) return 'youtube';
  if (value.includes('linkedin')) return 'linkedin';
  if (value.includes('twitter') || value.includes('x.com')) return 'x';
  if (value.includes('pinterest')) return 'pinterest';
  if (value.includes('snapchat')) return 'snapchat';
  if (value.includes('telegram') || value.includes('t.me')) return 'telegram';
  if (value.includes('whatsapp') || value.includes('wa.me')) return 'whatsapp';
  return 'website';
};

interface SocialPlatformIconProps {
  platform?: string;
  label?: string;
  url?: string;
  className?: string;
}

export const SocialPlatformIcon: React.FC<SocialPlatformIconProps> = ({
  platform,
  label,
  url,
  className = 'h-4 w-4',
}) => {
  const selected = (platform || inferSocialPlatform(label, url)) as SocialPlatform;

  switch (selected) {
    case 'instagram': return <Instagram className={className} />;
    case 'facebook': return <Facebook className={className} />;
    case 'tiktok': return <Music2 className={className} />;
    case 'youtube': return <Youtube className={className} />;
    case 'linkedin': return <Linkedin className={className} />;
    case 'x': return <Twitter className={className} />;
    case 'pinterest': return <Pin className={className} />;
    case 'snapchat': return <Ghost className={className} />;
    case 'telegram': return <Send className={className} />;
    case 'whatsapp': return <MessageCircle className={className} />;
    default: return <Globe2 className={className} />;
  }
};
