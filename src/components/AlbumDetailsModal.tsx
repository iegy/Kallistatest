import React, { useState } from 'react';
import { X, Calendar, MapPin, Layers, Eye, Sparkles } from 'lucide-react';
import { Album, PhotoItem } from '../types';
import { useLanguage } from '../i18n';

interface AlbumDetailsModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenLightbox: (photo: PhotoItem, albumTitle?: string) => void;
  onInquireAlbumService: (serviceType: string) => void;
}

export const AlbumDetailsModal: React.FC<AlbumDetailsModalProps> = ({
  album,
  isOpen,
  onClose,
  onOpenLightbox,
  onInquireAlbumService,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !album) return null;

  return (
    <div
      id="album-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#24211e]/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-[#fffefb] w-full max-w-5xl max-h-[90vh] rounded-3xl border border-[#e6e1d6] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="p-6 sm:p-8 border-b border-[#e6e1d6] flex items-start justify-between bg-[#fffefb] relative z-10">
          <div className="text-right space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#e6e1d6] text-[#24211e] text-xs font-serif rounded-full font-medium">
                {album.category === 'weddings' ? t('حفل زفاف', 'Wedding') : album.category === 'children' ? t('أطفال', 'Family') : t('أزياء', 'Fashion')}
              </span>
              <span className="text-xs text-[#7d7266] flex items-center gap-1 font-serif">
                <Layers className="w-3.5 h-3.5 text-[#c6a585]" />
                {album.images.length} {t('صورة متوفرة', 'photographs')}
              </span>
            </div>

            <h2 className="font-arabic-editorial text-2xl sm:text-3xl font-bold text-[#24211e]">
              {album.title}
            </h2>

            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#70655a] pt-1">
              {album.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#c6a585]" />
                  {album.location}
                </span>
              )}
              {album.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#afbb9c]" />
                  {album.date}
                </span>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            id="close-album-modal-btn"
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#e6e1d6]/70 hover:bg-[#e6e1d6] text-[#24211e] transition-colors focus:outline-none"
            aria-label={t('إغلاق', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Story Narrative Box */}
          {album.story && (
            <div className="p-6 bg-[#e6e1d6]/40 rounded-2xl border-r-4 border-[#c6a585] text-right">
              <span className="text-xs font-serif uppercase tracking-widest text-[#8c6d4e] block mb-1">
                {t('حكاية الجلسة', 'Story Behind The Session')}
              </span>
              <p className="font-arabic-editorial text-base sm:text-lg text-[#3d362f] leading-relaxed">
                {album.story}
              </p>
            </div>
          )}

          {/* Photos Grid (Complete Album Gallery) */}
          <div className="space-y-4">
            <h3 className="text-right font-arabic-editorial text-xl font-bold text-[#24211e] flex items-center justify-end gap-2">
              <span>{t('معرض صور المناسبة الكاملة', 'Complete session gallery')}</span>
              <Sparkles className="w-4 h-4 text-[#c6a585]" />
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {album.images.map((img, idx) => (
                <div
                  key={img.id || idx}
                  id={`album-photo-item-${idx}`}
                  onClick={() => onOpenLightbox(img, album.title)}
                  className="group relative rounded-xl overflow-hidden border border-[#e6e1d6] bg-[#e6e1d6]/30 aspect-[4/3] cursor-pointer editorial-img-wrapper hover:shadow-lg transition-all"
                >
                  <img
                    src={img.url}
                    alt={img.title || `Photo ${idx + 1}`}
                    draggable={false}
                    className="w-full h-full object-cover editorial-img"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#24211e]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-right text-[#fffefb]">
                    <p className="font-arabic-editorial text-sm font-bold truncate">
                      {img.title || t(`صورة ${idx + 1}`, `Photograph ${idx + 1}`)}
                    </p>
                    {img.caption && (
                      <p className="text-xs text-[#e6e1d6] font-light line-clamp-1">
                        {img.caption}
                      </p>
                    )}
                    <span className="mt-1 text-[10px] text-[#c6a585] flex items-center justify-end gap-1">
                      <Eye className="w-3 h-3" /> {t('تكبير الصورة', 'Enlarge')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-6 bg-[#fffefb] border-t border-[#e6e1d6] flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-[#70655a] font-arabic-editorial text-right">
            {t('هل ترغبون في توثيق يومكم بأسلوب مماثل؟ يمكنكم حجز جلستكم مباشرة معنا.', 'Would you like your story photographed with the same care? Enquire about a tailored session.')}
          </p>

          <div className="flex items-center gap-3">
            <button
              id="inquire-from-album-btn"
              onClick={() => {
                onClose();
                onInquireAlbumService(album.category);
              }}
              className="bg-[#24211e] hover:bg-[#3d3833] text-[#fffefb] px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c6a585]" />
              <span>{t('احجزوا جلسة مماثلة', 'Enquire about a similar session')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
