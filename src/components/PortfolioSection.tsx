import React from 'react';
import { Calendar, MapPin, Image as ImageIcon, ArrowLeft, Eye, Layers } from 'lucide-react';
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
  const { t } = useLanguage();

  const activeCategories = categories
    .filter((c) => c.active !== false)
    .sort((a, b) => {
      if (a.slug === 'all' && b.slug !== 'all') return -1;
      if (b.slug === 'all' && a.slug !== 'all') return 1;

      const orderA = Number.isFinite(a.displayOrder) ? a.displayOrder : Number.MAX_SAFE_INTEGER;
      const orderB = Number.isFinite(b.displayOrder) ? b.displayOrder : Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) return orderA - orderB;
      return a.nameAr.localeCompare(b.nameAr, 'ar');
    });

  const filteredAlbums = selectedCategory === 'all'
    ? albums
    : albums.filter((a) => a.category === selectedCategory);

  return (
    <section id="portfolio" className="relative border-b border-[#e6e1d6] bg-[#fffefb] py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-4xl text-center sm:mb-12">
          <span className="font-serif text-sm tracking-[0.25em] text-[#afbb9c] uppercase block mb-3 font-semibold">
            {t('معرض الأعمال', 'The Work / Portfolio')}
          </span>
          <h2
            id="portfolio-headline"
            className="mb-4 font-arabic-editorial text-[clamp(2rem,4.2vw,3.35rem)] font-bold leading-[1.3] text-[#24211e]"
          >
            {t('مجموعة من اللحظات التي اخترنا أن نحتفظ بها.', 'A collection of moments chosen to endure.')}
          </h2>
          <p className="mx-auto max-w-3xl text-sm font-light leading-7 text-[#6c6258] sm:text-base lg:text-lg">
            {t('استكشفوا ألبومات المناسبات الكاملة، حيث تحظى كل جلسة بتوثيق سينمائي متكامل لجميع تفاصيلها ومشاعرها.', 'Explore complete session stories, each documented with a cinematic eye for detail and emotion.')}
          </p>
        </div>

        {/* Dynamic Category Filter Tabs */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:mb-12 sm:gap-2.5">
          {activeCategories.map((tab) => {
            const isActive = selectedCategory === tab.slug;
            return (
              <button
                key={tab.id}
                id={`portfolio-filter-${tab.slug}`}
                onClick={() => onCategoryChange(tab.slug)}
                className={`flex items-center rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-all duration-300 sm:px-5 sm:text-sm ${
                  isActive
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md scale-102'
                    : 'bg-[#e6e1d6]/70 text-[#594f45] hover:bg-[#e6e1d6] hover:text-[#24211e]'
                }`}
              >
                <span>{tab.nameAr}</span>
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 xl:grid-cols-3 xl:gap-8">
            {filteredAlbums.map((album) => {
              const photoCount = album.images?.length || 0;
              const matchedCat = categories.find((c) => c.slug === album.category);

              return (
                <div
                  key={album.id}
                  id={`album-card-${album.id}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e6e1d6] bg-[#fffefb] transition-all duration-500 hover:border-[#c6a585] hover:shadow-[0_16px_40px_rgba(198,165,133,0.15)]"
                >
                  {/* Cover Image Frame */}
                  <div className="editorial-img-wrapper relative aspect-[4/3] cursor-pointer overflow-hidden bg-[#e6e1d6] md:aspect-[16/10] xl:aspect-[4/3]"
                    onClick={() => onOpenAlbumModal(album)}
                  >
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      draggable={false}
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
                  <div className="flex flex-1 flex-col justify-between space-y-3 p-4 sm:p-5 xl:p-6">
                    <div>
                      {/* Location & Date */}
                      <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#786d62]">
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
                        <p className="line-clamp-2 text-xs font-light leading-relaxed text-[#595046] sm:text-sm">
                          {album.story}
                        </p>
                      )}
                    </div>

                    {/* Thumbnails preview strip */}
                    {album.images && album.images.length > 1 && (
                      <div className="border-t border-[#e6e1d6]/60 pt-2 md:pt-1.5 xl:pt-2">
                        <span className="text-[11px] text-[#85796f] block mb-2 font-arabic-editorial">
                          {t('صور من الجلسة:', 'Selected frames:')}
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {album.images.slice(0, 3).map((img, i) => (
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
                                draggable={false}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                          {album.images.length > 3 && (
                            <button
                              onClick={() => onOpenAlbumModal(album)}
                              className="w-12 h-12 rounded-lg bg-[#e6e1d6] text-[#24211e] text-xs font-serif font-bold flex items-center justify-center flex-shrink-0 hover:bg-[#c6a585] hover:text-white transition-colors"
                            >
                              +{album.images.length - 3}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-1">
                      <button
                        id={`view-full-album-${album.id}`}
                        onClick={() => onOpenAlbumModal(album)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e6e1d6] py-2.5 text-xs font-medium tracking-wide text-[#24211e] transition-colors hover:bg-[#c6a585] hover:text-white sm:text-sm"
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
