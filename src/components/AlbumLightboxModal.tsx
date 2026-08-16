import React, { useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { PhotoItem } from '../types';

interface AlbumLightboxModalProps {
  photo: PhotoItem | null;
  albumTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const AlbumLightboxModal: React.FC<AlbumLightboxModalProps> = ({
  photo,
  albumTitle,
  isOpen,
  onClose,
  onNext,
  onPrev,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onPrev) onPrev();
      if (e.key === 'ArrowLeft' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !photo) return null;

  return (
    <div
      id="lightbox-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#24211e]/95 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar Actions */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20 pointer-events-auto">
        <div className="text-right text-[#fffefb]">
          {albumTitle && (
            <p className="text-xs text-[#c6a585] font-serif uppercase tracking-widest">
              {albumTitle}
            </p>
          )}
          <h4 className="font-arabic-editorial text-sm sm:text-base font-bold truncate max-w-md">
            {photo.title || 'صورة من معرض كاليستا'}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="protected-photo-notice hidden items-center gap-1.5 rounded-full border border-[#c6a585]/25 bg-[#24211e]/70 px-3 py-2 text-[10px] text-[#e6e1d6]/80 sm:flex"
            title="الصور محمية بحقوق النشر ولا يتوفر تنزيل مباشر"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#c6a585]" />
            <span>صور محمية بحقوق النشر</span>
          </div>

          <button
            id="close-lightbox-btn"
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#fffefb]/15 hover:bg-[#fffefb]/30 text-[#fffefb] transition-colors"
            aria-label="Close photo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-w-5xl max-h-[82vh] flex items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          id="lightbox-active-img"
          src={photo.url}
          alt={photo.title || 'Kallista Photography'}
          draggable={false}
          className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl border border-[#fffefb]/10"
        />

        {/* Prev & Next Navigation Buttons */}
        {onPrev && (
          <button
            id="lightbox-prev-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute right-2 sm:-right-14 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-[#fffefb]/20 hover:bg-[#fffefb]/30 text-[#fffefb] backdrop-blur-md transition-all shadow-lg"
            title="الصورة السابقة"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {onNext && (
          <button
            id="lightbox-next-btn"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute left-2 sm:-left-14 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-[#fffefb]/20 hover:bg-[#fffefb]/30 text-[#fffefb] backdrop-blur-md transition-all shadow-lg"
            title="الصورة التالية"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption at bottom */}
      {photo.caption && (
        <div className="absolute bottom-4 inset-x-4 text-center z-20 pointer-events-none">
          <p className="inline-block bg-[#24211e]/80 backdrop-blur-md text-[#e6e1d6] px-5 py-2 rounded-full text-xs sm:text-sm font-arabic-editorial">
            {photo.caption}
          </p>
        </div>
      )}
    </div>
  );
};
