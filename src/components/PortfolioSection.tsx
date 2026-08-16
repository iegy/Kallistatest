import React, { useState } from 'react';
import { Sparkles, Calendar, MapPin, Image as ImageIcon, ArrowLeft, Eye, Maximize2, Layers } from 'lucide-react';
import { Album, PhotoItem, PortfolioCategory } from '../types';
import { useLanguage } from '../i18n';

interface PortfolioSectionProps {
  albums: Album[];
  categories: PortfolioCategory[];
  selectedCategory: string;
  onCategoryChange: (categorySlug: string) => void;
  onOpenAlbumModal: (album: Album) => void;
  onOpenLightbox: (photo: PhotoItem, albumTitle?: string) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  albums,
  categories,
  selectedCategory,
  onCategoryChange,
  onOpenAlbumModal,
  onOpenLightbox,
}) => {
  const { language, t } = useLanguage();
  const [hoveredAlbumId, setHoveredAlbumId] = useState<string | null>(null);

  const activeCategories = categories.filter((c) => c.active !== false);

  const filteredAlbums = selectedCategory === 'all'
    ? albums
    : albums.filter((a) => a.category === selectedCategory);

  return (
    <section id="portfolio" className="py-24 sm:py-32 bg-[#fffefb] relative border-b border-[#e6e1d6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="font-serif text-sm tracking-[0.25em] text-[#afbb9c] uppercase block mb-3 font-semibold">
            {t('12 — معرض الأعمال', '12 — The Work / Portfolio')}
          </span>
          <h2
            id="portfolio-headline"
            className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e] mb-4"
          >
            {t('مجموعة من اللحظات التي اخترنا أن نحتفظ بها.', 'A collection of moments chosen to endure.')}
          </h2>
          <p className="text-[#6c6258] text-base sm:text-lg font-light">
            {t('استكشفوا ألبومات المناسبات الكاملة، حيث تحظى كل جلسة بتوثيق سينمائي متكامل لجميع تفاصيلها ومشاعرها.', 'Explore complete session stories, each documented with a cinematic eye for detail and emotion.')}
          </p>
        </div>

        {/* Dynamic Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-14">
          {activeCategories.map((tab) => {
            const isActive = selectedCategory === tab.slug;
            return (
              <button
                key={tab.id}
                id={`portfolio-filter-${tab.slug}`}
                onClick={() => onCategoryChange(tab.slug)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md scale-102'
                    : 'bg-[#e6e1d6]/70 text-[#594f45] hover:bg-[#e6e1d6] hover:text-[#24211e]'
                }`}
              >
                <span>{tab.nameAr}</span>
                {language === 'ar' && tab.nameEn && (
                  <span className="text-[11px] opacity-70 font-serif">({tab.nameEn})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Albums Collection (Editorial Asymmetric Layout) */}
        {filteredAlbums.length === 0 ? (
          <div className="text-center py-16 bg-[#e6e1d6]/30 rounded-2xl border border-dashed border-[#c6a585]/40">
            <ImageIcon className="w-12 h-12 text-[#c6a585] mx-auto mb-3 opacity-60" />
            <p className="text-[#61574d] text-base font-arabic-editorial">
              {t('لا توجد ألبومات في هذا القسم حالياً.', 'There are no published albums in this collection yet.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {filteredAlbums.map((album, index) => {
              const photoCount = album.images?.length || 0;
              const matchedCat = categories.find((c) => c.slug === album.category);

              return (
                <div
                  key={album.id}
                  id={`album-card-${album.id}`}
                  onMouseEnter={() => setHoveredAlbumId(album.id)}
                  onMouseLeave={() => setHoveredAlbumId(null)}
                  className="group bg-[#fffefb] rounded-2xl border border-[#e6e1d6] overflow-hidden flex flex-col justify-between transition-all duration-500 hover:shadow-[0_16px_40px_rgba(198,165,133,0.15)] hover:border-[#c6a585]"
                >
                  {/* Cover Image Frame */}
                  <div className="relative aspect-[4/3] bg-[#e6e1d6] overflow-hidden cursor-pointer editorial-img-wrapper"
                    onClick={() => onOpenAlbumModal(album)}
                  >
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover editorial-img"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#24211e]/85 via-[#24211e]/20 to-transparent" />
                    
                    {/* Category pill */}
                    <div className="absolute top-4 right-4 bg-[#fffefb]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-serif font-medium text-[#24211e]">
                      {matchedCat ? matchedCat.nameAr : album.category}
                    </div>

                    {/* Photos count indicator */}
                    <div className="absolute top-4 left-4 bg-[#24211e]/80 backdrop-blur-md text-[#fffefb] px-3 py-1 rounded-full text-xs font-serif flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-[#c6a585]" />
                      <span>{photoCount} {t('صورة', 'photos')}</span>
                    </div>

                    {/* Overlay Action */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#24211e]/40 backdrop-blur-[2px]">
                      <span className="bg-[#fffefb] text-[#24211e] px-4 py-2 rounded-full text-xs font-medium tracking-wide shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Eye className="w-3.5 h-3.5 text-[#c6a585]" />
                        <span>{t('فتح الألبوم بالكامل', 'Open full album')}</span>
                      </span>
                    </div>

                    {/* Bottom Metadata in Image */}
                    <div className="absolute bottom-4 right-4 left-4 text-right text-[#fffefb]">
                      <h3 className="font-arabic-editorial text-xl font-bold leading-snug">
                        {album.title}
                      </h3>
                    </div>
                  </div>

                  {/* Album Body & Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Location & Date */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#786d62] mb-3">
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

                      {/* Brief Story */}
                      {album.story && (
                        <p className="text-[#595046] text-xs sm:text-sm leading-relaxed line-clamp-2 font-light">
                          {album.story}
                        </p>
                      )}
                    </div>

                    {/* Thumbnails preview strip */}
                    {album.images && album.images.length > 1 && (
                      <div className="pt-2 border-t border-[#e6e1d6]/60">
                        <span className="text-[11px] text-[#85796f] block mb-2 font-arabic-editorial">
                          {t('صور من الجلسة:', 'Selected frames:')}
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {album.images.slice(0, 4).map((img, i) => (
                            <button
                              key={img.id || i}
                              id={`thumb-preview-${album.id}-${i}`}
                              onClick={() => onOpenLightbox(img, album.title)}
                              className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#e6e1d6] hover:border-[#c6a585] flex-shrink-0 transition-transform hover:scale-105"
                              title={img.title || t('عرض الصورة', 'View photograph')}
                            >
                              <img
                                src={img.thumbUrl || img.url}
                                alt={img.title || 'Photo'}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                          {album.images.length > 4 && (
                            <button
                              onClick={() => onOpenAlbumModal(album)}
                              className="w-12 h-12 rounded-lg bg-[#e6e1d6] text-[#24211e] text-xs font-serif font-bold flex items-center justify-center flex-shrink-0 hover:bg-[#c6a585] hover:text-white transition-colors"
                            >
                              +{album.images.length - 4}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        id={`view-full-album-${album.id}`}
                        onClick={() => onOpenAlbumModal(album)}
                        className="w-full bg-[#e6e1d6] hover:bg-[#c6a585] hover:text-white text-[#24211e] py-2.5 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition-colors flex items-center justify-center gap-2"
                      >
                        <span>{t('مشاهدة الألبوم والمناسبة كاملة', 'View the complete story')}</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
