import React, { useEffect, useState, useRef } from 'react';
import {
  Lock, Key, Image as ImageIcon, Upload, Plus, Trash2, Edit3, CheckCircle2,
  Calendar, Users, Star, Settings, Download, RefreshCw, MessageCircle, AlertCircle,
  Sparkles, Gift, Eye, Filter, ArrowUpRight, Phone, Mail, Check, Layers, FileText,
  Sliders, Shield, Database, Globe, HelpCircle, UserCheck, ArrowRight, Type
} from 'lucide-react';
import {
  Album, Booking, ClientContact, Review, SiteSettings, PhotoItem,
  PortfolioCategory, SiteContent, ServiceItem, FAQItem, SocialLink
} from '../types';
import {
  uploadImageToImgBB, getUpcomingBirthdayAlerts, createBirthdayWhatsAppLink,
  createBookingInquiryWhatsAppLink,
  ronadisaPhoto, veiledWeddingPhoto, veiledFashionPhoto, veiledFamilyPhoto
} from '../services/storage';
import { logoutFirebase } from '../services/firebase';
import { SOCIAL_PLATFORM_OPTIONS, SocialPlatformIcon, inferSocialPlatform } from './SocialPlatformIcon';
import {
  BODY_FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  ensureSiteFontsLoaded,
  getBodyFontOption,
  getHeadingFontOption,
} from '../themeFonts';

interface RegisteredUserProfile {
  id: string;
  name?: string;
  email?: string;
  provider?: string;
}

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminAuthenticated: boolean;
  registeredUsersCount: number;
  registeredUsers: RegisteredUserProfile[];
  currentUserId?: string;
  onRequestLogin: () => void;
  albums: Album[];
  categories: PortfolioCategory[];
  content: SiteContent;
  bookings: Booking[];
  clients: ClientContact[];
  reviews: Review[];
  settings: SiteSettings;
  onUpdateAlbums: (albums: Album[]) => Promise<void>;
  onUpdateCategories: (categories: PortfolioCategory[]) => Promise<void>;
  onUpdateContent: (content: SiteContent) => Promise<void>;
  onUpdateBookings: (bookings: Booking[]) => Promise<void>;
  onUpdateClients: (clients: ClientContact[]) => Promise<void>;
  onUpdateReviews: (reviews: Review[]) => Promise<void>;
  onUpdateSettings: (settings: SiteSettings) => Promise<void>;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  isAdminAuthenticated,
  registeredUsersCount,
  registeredUsers,
  currentUserId,
  onRequestLogin,
  albums,
  categories,
  content,
  bookings,
  clients,
  reviews,
  settings,
  onUpdateAlbums,
  onUpdateCategories,
  onUpdateContent,
  onUpdateBookings,
  onUpdateClients,
  onUpdateReviews,
  onUpdateSettings,
}) => {
  // Active Admin Tab (Firebase tab removed as requested, Firebase Auth is retained for login)
  const [activeTab, setActiveTab] = useState<
    'content' | 'categories' | 'albums' | 'uploader' | 'bookings' | 'users' | 'clients' | 'reviews' | 'settings'
  >('content');

  // Content Sub-section Tab
  const [contentSubTab, setContentSubTab] = useState<
    'brand' | 'hero' | 'intro' | 'services' | 'approach' | 'about' | 'experience' | 'faq' | 'contact' | 'footer'
  >('brand');

  // Local Editable Content State
  const [editableContent, setEditableContent] = useState<SiteContent>(content);
  const [contentSavedSuccess, setContentSavedSuccess] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);

  // Categories Local State
  const [editingCategory, setEditingCategory] = useState<PortfolioCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categorySavedSuccess, setCategorySavedSuccess] = useState(false);
  const categoryFormRef = useRef<HTMLDivElement>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<PortfolioCategory>>({
    nameAr: '',
    nameEn: '',
    slug: '',
    description: '',
    active: true,
    displayOrder: categories.length + 1,
  });

  // ImgBB Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoItem[]>([]);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [targetAlbumIdForUpload, setTargetAlbumIdForUpload] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logo upload state
  const headerLogoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingHeaderLogo, setIsUploadingHeaderLogo] = useState(false);
  const [isUploadingFooterLogo, setIsUploadingFooterLogo] = useState(false);

  // Album creation / edit modal state
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [isUploadingAlbumCover, setIsUploadingAlbumCover] = useState(false);
  const [isUploadingAlbumImages, setIsUploadingAlbumImages] = useState(false);
  const [albumUploadProgress, setAlbumUploadProgress] = useState('');
  const albumCoverInputRef = useRef<HTMLInputElement>(null);
  const albumImagesInputRef = useRef<HTMLInputElement>(null);

  const [albumFormData, setAlbumFormData] = useState<Partial<Album>>({
    title: '',
    titleEn: '',
    category: 'weddings',
    coverImage: '',
    date: new Date().toISOString().split('T')[0],
    location: 'الإسكندرية',
    story: '',
    featured: true,
    images: [],
  });

  // Client addition state
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientData, setNewClientData] = useState<Partial<ClientContact>>({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    birthday: '',
    weddingAnniversary: '',
    serviceInterests: ['weddings'],
    notes: '',
    subscribeUpdates: true,
    tags: ['New Client'],
  });

  // Settings edit state
  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    setEditableContent(content);
  }, [content]);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  useEffect(() => {
    ensureSiteFontsLoaded(tempSettings.bodyFontKey, tempSettings.headingFontKey);
  }, [tempSettings.bodyFontKey, tempSettings.headingFontKey]);
  const editableSocialLinks: SocialLink[] = editableContent.contact.socialLinks ?? [
    ...(editableContent.contact.instagram ? [{ id: 'social-instagram', label: 'Instagram', icon: 'instagram', url: editableContent.contact.instagram }] : []),
    ...(editableContent.contact.facebook ? [{ id: 'social-facebook', label: 'Facebook', icon: 'facebook', url: editableContent.contact.facebook }] : []),
    ...(editableContent.contact.tiktok ? [{ id: 'social-tiktok', label: 'TikTok', icon: 'tiktok', url: editableContent.contact.tiktok }] : []),
  ];
  if (!isOpen) return null;

  const handleLogout = async () => {
    await logoutFirebase();
    onClose();
  };

  // Birthday Alerts calculation
  const birthdayAlerts = getUpcomingBirthdayAlerts(clients);

  // Uploader Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(Array.from(e.target.files));
    }
  };

  const handleStartUpload = async () => {
    if (uploadFiles.length === 0) return;
    setIsUploading(true);
    const newItems: PhotoItem[] = [];

    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      setUploadProgressText(`جاري رفع صورة ${i + 1} من ${uploadFiles.length} إلى ImgBB...`);
      const res = await uploadImageToImgBB(file, settings.imgbbApiKey);

      if (res.success && res.url) {
        newItems.push({
          id: 'img-' + Date.now() + '-' + i,
          url: res.url,
          thumbUrl: res.thumbUrl || res.url,
          deleteUrl: res.deleteUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          uploadedAt: new Date().toISOString(),
        });
      }
    }

    setIsUploading(false);
    setUploadProgressText('');
    setUploadedPhotos([...uploadedPhotos, ...newItems]);
    setUploadFiles([]);

    // If target album selected, attach directly
    if (targetAlbumIdForUpload && newItems.length > 0) {
      const updated = albums.map((alb) => {
        if (alb.id === targetAlbumIdForUpload) {
          return { ...alb, images: [...alb.images, ...newItems] };
        }
        return alb;
      });
      try {
        await onUpdateAlbums(updated);
      } catch {
        return;
      }
      alert(`تم رفع وإضافة ${newItems.length} صورة إلى الألبوم المحدد بنجاح!`);
    }
  };

  // Direct Album Cover Upload Handler
  const handleUploadAlbumCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAlbumCover(true);
    setAlbumUploadProgress('جاري رفع صورة الغلاف إلى ImgBB...');
    const res = await uploadImageToImgBB(file, settings.imgbbApiKey);
    setIsUploadingAlbumCover(false);
    setAlbumUploadProgress('');

    if (res.success && res.url) {
      setAlbumFormData((prev) => ({
        ...prev,
        coverImage: res.url,
      }));
    } else {
      alert('فشل رفع صورة الغلاف: ' + (res.error || 'تأكد من اتصال الإنترنت وصلاحية مفتاح ImgBB'));
    }
  };

  // Direct Album Multiple Images Upload Handler
  const handleUploadAlbumImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray: File[] = Array.from(files);
    setIsUploadingAlbumImages(true);
    const newItems: PhotoItem[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setAlbumUploadProgress(`جاري رفع صورة الألبوم (${i + 1} من ${fileArray.length})...`);
      const res = await uploadImageToImgBB(file, settings.imgbbApiKey);

      if (res.success && res.url) {
        newItems.push({
          id: 'album-img-' + Date.now() + '-' + i,
          url: res.url,
          thumbUrl: res.thumbUrl || res.url,
          deleteUrl: res.deleteUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          uploadedAt: new Date().toISOString(),
        });
      }
    }

    setIsUploadingAlbumImages(false);
    setAlbumUploadProgress('');

    if (newItems.length > 0) {
      setAlbumFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newItems],
      }));
    }
  };

  // Direct Header Logo Upload Handler
  const handleUploadHeaderLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingHeaderLogo(true);
    const res = await uploadImageToImgBB(file, settings.imgbbApiKey);
    setIsUploadingHeaderLogo(false);

    if (res.success && res.url) {
      setEditableContent((prev) => ({
        ...prev,
        brand: {
          ...prev.brand,
          logoType: 'image',
          logoImageUrl: res.url,
        },
      }));
      alert('تم رفع لوجو أعلى الموقع. اضغط «حفظ كافة التعديلات في الموقع» لتثبيت الرابط في Firebase.');
    } else {
      alert('فشل رفع لوجو أعلى الموقع: ' + (res.error || 'يرجى التأكد من اتصال الإنترنت وصلاحية مفتاح ImgBB'));
    }
  };

  // Direct Footer Logo Upload Handler
  const handleUploadFooterLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFooterLogo(true);
    const res = await uploadImageToImgBB(file, settings.imgbbApiKey);
    setIsUploadingFooterLogo(false);

    if (res.success && res.url) {
      setEditableContent((prev) => ({
        ...prev,
        brand: {
          ...prev.brand,
          footerLogoType: 'image',
          footerLogoImageUrl: res.url,
        },
      }));
      alert('تم رفع لوجو أسفل الموقع. اضغط «حفظ كافة التعديلات في الموقع» لتثبيت الرابط في Firebase.');
    } else {
      alert('فشل رفع لوجو أسفل الموقع: ' + (res.error || 'يرجى التأكد من اتصال الإنترنت وصلاحية مفتاح ImgBB'));
    }
  };

  const handleRemovePhotoFromAlbum = (photoIndex: number) => {
    setAlbumFormData((prev) => {
      const currentImages = [...(prev.images || [])];
      currentImages.splice(photoIndex, 1);
      return {
        ...prev,
        images: currentImages,
      };
    });
  };

  // Category Start Edit
  const handleStartEditCategory = (cat: PortfolioCategory) => {
    setEditingCategory(cat);
    setCategoryFormData({
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'Sparkles',
      active: cat.active,
      displayOrder: cat.displayOrder,
    });
    setIsAddingCategory(false);
    setTimeout(() => {
      categoryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  // Category Save / Delete Handlers
  const handleSaveCategory = async () => {
    if (!categoryFormData.nameAr || !categoryFormData.slug) {
      alert('يرجى كتابة الاسم بالعربية والمعرّف (Slug)');
      return;
    }

    const cleanSlug = categoryFormData.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    if (editingCategory) {
      const updated = categories.map((c) =>
        c.id === editingCategory.id
          ? ({ ...c, ...categoryFormData, slug: cleanSlug } as PortfolioCategory)
          : c
      );
      try {
        await onUpdateCategories(updated);
      } catch {
        return;
      }
      setEditingCategory(null);
    } else {
      const newCat: PortfolioCategory = {
        id: 'cat-' + Date.now(),
        nameAr: categoryFormData.nameAr || '',
        nameEn: categoryFormData.nameEn || '',
        slug: cleanSlug,
        description: categoryFormData.description || '',
        icon: categoryFormData.icon || 'Sparkles',
        active: categoryFormData.active ?? true,
        displayOrder: categoryFormData.displayOrder || categories.length + 1,
      };
      try {
        await onUpdateCategories([...categories, newCat]);
      } catch {
        return;
      }
      setIsAddingCategory(false);
    }
    setCategoryFormData({ nameAr: '', nameEn: '', slug: '', description: '', active: true, displayOrder: categories.length + 1 });
    setCategorySavedSuccess(true);
    setTimeout(() => setCategorySavedSuccess(false), 3000);
  };

  const handleDeleteCategory = async (catId: string, slug: string, nameAr?: string) => {
    if (slug === 'all') {
      alert('لا يمكن حذف قسم "كافة الأعمال" الأساسي.');
      return;
    }
    const catLabel = nameAr ? `"${nameAr}"` : `(${slug})`;
    if (confirm(`هل أنت متأكد من حذف تصنيف ${catLabel} نهائياً؟\n\nلن يتم حذف الألبومات المرتبطة به ولكن سيتم عرضها ضمن كافة الأعمال.`)) {
      try {
        await onUpdateCategories(categories.filter((c) => c.id !== catId));
      } catch {
        return;
      }
      if (editingCategory?.id === catId) {
        setEditingCategory(null);
        setIsAddingCategory(false);
      }
    }
  };

  // Content Save Handler
  const handleSaveSiteContent = async () => {
    setIsSavingContent(true);
    try {
      await onUpdateContent(editableContent);
      setContentSavedSuccess(true);
      setTimeout(() => setContentSavedSuccess(false), 3000);
    } catch {
      setContentSavedSuccess(false);
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleAddServicePackage = () => {
    const newServiceId = `srv-${Date.now()}`;
    const defaultCategory = categories.find((category) => category.slug === 'weddings')?.slug
      || categories.find((category) => category.slug !== 'all' && category.active !== false)?.slug
      || 'weddings';
    const newService: ServiceItem = {
      id: newServiceId,
      titleAr: 'باقة تصوير جديدة',
      titleEn: 'New Photography Package',
      categorySlug: defaultCategory,
      descriptionAr: 'اكتب هنا وصف الباقة والخدمة المقدمة للعميل.',
      descriptionEn: 'Add the English package description here.',
      inclusions: [],
      priceStarting: '',
      showPrice: true,
      badge: '',
      featured: false,
    };

    setEditableContent((current) => ({
      ...current,
      services: [...current.services, newService],
    }));

    setTimeout(() => {
      document.getElementById(`service-editor-${newServiceId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleDeleteServicePackage = (service: ServiceItem) => {
    if (!confirm(`هل تريد حذف باقة "${service.titleAr}"؟\n\nلن يتم الحذف النهائي إلا بعد الضغط على حفظ تغييرات المحتوى.`)) return;
    setEditableContent((current) => ({
      ...current,
      services: current.services.filter((item) => item.id !== service.id),
    }));
  };

  // Album Save / Delete Handlers
  const handleSaveAlbum = async () => {
    if (!albumFormData.title || !albumFormData.coverImage) {
      alert('يرجى كتابة عنوان الألبوم ووضع رابط صورة الغلاف');
      return;
    }

    if (editingAlbum) {
      const updated = albums.map((a) =>
        a.id === editingAlbum.id
          ? ({ ...a, ...albumFormData } as Album)
          : a
      );
      try {
        await onUpdateAlbums(updated);
      } catch {
        return;
      }
      setEditingAlbum(null);
    } else {
      const newAlbum: Album = {
        id: 'album-' + Date.now(),
        title: albumFormData.title || '',
        titleEn: albumFormData.titleEn || '',
        category: albumFormData.category || 'weddings',
        coverImage: albumFormData.coverImage || '',
        date: albumFormData.date || new Date().toISOString().split('T')[0],
        location: albumFormData.location || 'الإسكندرية',
        story: albumFormData.story || '',
        featured: albumFormData.featured ?? true,
        tags: albumFormData.tags || ['Editorial', 'Kallista'],
        images: albumFormData.images || [],
      };
      try {
        await onUpdateAlbums([newAlbum, ...albums]);
      } catch {
        return;
      }
      setIsCreatingAlbum(false);
    }
    setAlbumFormData({
      title: '',
      titleEn: '',
      category: 'weddings',
      coverImage: '',
      date: new Date().toISOString().split('T')[0],
      location: 'الإسكندرية',
      story: '',
      featured: true,
      images: [],
    });
  };

  const handleDeleteAlbum = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الألبوم بالكامل؟')) {
      try {
        await onUpdateAlbums(albums.filter((a) => a.id !== id));
      } catch {
        return;
      }
    }
  };

  // Booking Status Handler
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b));
    try {
      await onUpdateBookings(updated);
    } catch {
      return;
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm('هل تريد حذف هذا الحجز نهائياً؟')) {
      try {
        await onUpdateBookings(bookings.filter((b) => b.id !== bookingId));
      } catch {
        return;
      }
    }
  };

  // Client Handlers
  const handleSaveNewClient = async () => {
    if (!newClientData.name || !newClientData.phone) {
      alert('يرجى إدخال اسم العميل ورقم الهاتف');
      return;
    }
    const newClient: ClientContact = {
      id: 'client-' + Date.now(),
      name: newClientData.name || '',
      phone: newClientData.phone || '',
      whatsapp: newClientData.whatsapp || newClientData.phone || '',
      email: newClientData.email,
      birthday: newClientData.birthday,
      weddingAnniversary: newClientData.weddingAnniversary,
      serviceInterests: newClientData.serviceInterests || ['weddings'],
      notes: newClientData.notes,
      subscribeUpdates: newClientData.subscribeUpdates ?? true,
      totalBookings: 1,
      tags: newClientData.tags || ['VIP Client'],
      createdAt: new Date().toISOString(),
      userId: currentUserId,
    };
    try {
      await onUpdateClients([newClient, ...clients]);
    } catch {
      return;
    }
    setShowAddClient(false);
    setNewClientData({ name: '', phone: '', whatsapp: '', email: '', birthday: '', weddingAnniversary: '', serviceInterests: ['weddings'], notes: '', subscribeUpdates: true, tags: ['New Client'] });
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('هل تريد حذف هذا العميل من سجل الـ CRM؟')) {
      try {
        await onUpdateClients(clients.filter((c) => c.id !== clientId));
      } catch {
        return;
      }
    }
  };

  // Review Handlers
  const handleToggleReviewApproval = async (id: string) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, approved: !r.approved } : r));
    try {
      await onUpdateReviews(updated);
    } catch {
      return;
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm('هل تريد حذف هذا التقييم؟')) {
      try {
        await onUpdateReviews(reviews.filter((r) => r.id !== id));
      } catch {
        return;
      }
    }
  };

  // Settings Save
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await onUpdateSettings({
        ...tempSettings,
        adminUsername: import.meta.env.VITE_ADMIN_EMAIL || tempSettings.adminUsername,
        adminPassword: '',
        adminPin: '',
        useFirebaseAuth: true,
      });
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 3000);
    } catch {
      setSettingsSavedSuccess(false);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Backup handlers
  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify({
      version: '4.0',
      exportDate: new Date().toISOString(),
      categories,
      content,
      albums,
      bookings,
      clients,
      reviews,
      settings,
    }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kallista_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileContent = event.target?.result as string;
        const data = JSON.parse(fileContent) as Partial<{
          categories: PortfolioCategory[];
          content: SiteContent;
          albums: Album[];
          bookings: Booking[];
          clients: ClientContact[];
          reviews: Review[];
          settings: SiteSettings;
        }>;
        if (!data || !Object.keys(data).some((key) => ['categories', 'content', 'albums', 'bookings', 'clients', 'reviews', 'settings'].includes(key))) {
          throw new Error('Invalid backup payload');
        }

        if (data.content) await onUpdateContent(data.content);
        if (data.settings) await onUpdateSettings(data.settings);
        if (data.categories) await onUpdateCategories(data.categories);
        if (data.albums) await onUpdateAlbums(data.albums);
        if (data.bookings) await onUpdateBookings(data.bookings);
        if (data.clients) await onUpdateClients(data.clients);
        if (data.reviews) await onUpdateReviews(data.reviews);

        if (data.content) setEditableContent(data.content);
        if (data.settings) setTempSettings(data.settings);
        alert('تمت استعادة النسخة الاحتياطية وحفظها في Firebase بنجاح.');
      } catch {
        alert('فشل استيراد الملف، يرجى التأكد من أنه ملف JSON صالح.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="kallista-admin-dashboard" dir="rtl" className="fixed inset-0 z-50 overflow-hidden bg-[#fffefb]">
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#fffefb] text-[#24211e]">
        
        {/* MODAL HEADER */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[#e6e1d6] bg-[#FAF8F5] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#24211e] text-[#fffefb] flex items-center justify-center font-serif font-bold text-lg shadow-md">
              K
            </div>
            <div>
              <h2 className="flex flex-wrap items-center gap-2 font-arabic-editorial text-base font-bold text-[#24211e] sm:text-xl">
                <span>لوحة التحكم والإدارة الشاملة (Kallista CMS)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#738262]/20 text-[#495b3a] font-serif">
                  v3.0 Live
                </span>
              </h2>
              <p className="hidden text-xs text-[#73685d] font-sans sm:block">
                تحكم كامل في محتوى الموقع، الألبومات، التصنيفات، الحجوزات، وأمان Firebase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdminAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl border border-[#d8cfc4] hover:bg-[#e6e1d6] text-xs font-semibold text-[#5a4f44] transition-colors"
              >
                تسجيل الخروج
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl p-2 text-[#73685d] transition-colors hover:bg-[#e6e1d6] hover:text-[#24211e] sm:px-3"
              aria-label="العودة إلى الموقع"
            >
              <ArrowRight className="h-5 w-5" />
              <span className="hidden text-xs font-semibold sm:inline">العودة إلى الموقع</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        {!isAdminAuthenticated ? (
          /* LOGIN SCREEN */
          <div className="flex-1 p-8 sm:p-16 flex items-center justify-center">
            <div className="w-full max-w-md bg-[#fffefb] p-8 rounded-3xl border border-[#e6e1d6] shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#e6e1d6] text-[#24211e] flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8 text-[#8c6742]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e]">
                  تسجيل الدخول الآمن للوحة التحكم
                </h3>
                <p className="text-xs text-[#6e6359]">
                  لوحة مخصصة لإدارة ستوديو كاليستا والمصورة روناديسا
                </p>
              </div>

              <button
                type="button"
                onClick={onRequestLogin}
                className="w-full bg-[#24211e] hover:bg-[#3d3833] text-[#fffefb] py-3.5 rounded-xl font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-[#c6a585]" />
                <span>الدخول من حسابي</span>
              </button>

              <div className="pt-2 text-[11px] text-[#8c7f73] bg-[#faf7f2] p-3 rounded-xl border border-[#e8ded3]">
                الدخول محمي بواسطة Firebase Authentication، ولا توجد كلمة مرور افتراضية أو PIN داخل كود الموقع.
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* SIDEBAR NAVIGATION TABS */}
            <div className="w-full md:w-64 bg-[#FAF8F5] border-b md:border-b-0 md:border-l border-[#e6e1d6] p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto flex-shrink-0">
              
              {/* 1. Content CMS */}
              <button
                onClick={() => setActiveTab('content')}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'content'
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md'
                    : 'text-[#594f45] hover:bg-[#e6e1d6]/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#c6a585]" />
                  <span>تعديل أقسام الموقع</span>
                </div>
                <span className="text-[10px] opacity-70 font-mono">CMS</span>
              </button>

              {/* 2. Categories Manager */}
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'categories'
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md'
                    : 'text-[#594f45] hover:bg-[#e6e1d6]/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-[#738262]" />
                  <span>تصنيفات المعرض</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e6e1d6] text-[#24211e] font-serif">
                  {categories.length}
                </span>
              </button>

              {/* 3. Albums Management */}
              <button
                onClick={() => setActiveTab('albums')}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'albums'
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md'
                    : 'text-[#594f45] hover:bg-[#e6e1d6]/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-[#c6a585]" />
                  <span>ألبومات المعرض</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e6e1d6] text-[#24211e] font-serif">
                  {albums.length}
                </span>
              </button>

              {/* 4. ImgBB Uploader */}
              <button
                onClick={() => setActiveTab('uploader')}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'uploader'
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md'
                    : 'text-[#594f45] hover:bg-[#e6e1d6]/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-[#738262]" />
                  <span>رفع الصور (ImgBB)</span>
                </div>
                <span className="text-[10px] opacity-70 font-mono">API</span>
              </button>

              {/* 5. Bookings CRM */}
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md'
                    : 'text-[#594f45] hover:bg-[#e6e1d6]/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#c6a585]" />
                  <span>طلبات الحجز</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c6a585] text-white font-bold">
                  {bookings.length}
                </span>
              </button>

              {/* 6. Registered users */}
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'users'
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md'
                    : 'text-[#594f45] hover:bg-[#e6e1d6]/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#c6a585]" />
                  <span>المستخدمون المسجّلون</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e6e1d6] text-[#24211e] font-serif">
                  {registeredUsersCount}
                </span>
              </button>

              {/* 7. Clients CRM & Birthday Alerts */}
              <button
                onClick={() => setActiveTab('clients')}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'clients'
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md'
                    : 'text-[#594f45] hover:bg-[#e6e1d6]/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#738262]" />
                  <span>سجل العملاء والأعياد</span>
                </div>
                {birthdayAlerts.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold animate-pulse">
                    {birthdayAlerts.length} 🎂
                  </span>
                )}
              </button>

              {/* 8. Reviews */}
              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'reviews'
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md'
                    : 'text-[#594f45] hover:bg-[#e6e1d6]/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-[#c6a585]" />
                  <span>الآراء والتقييمات</span>
                </div>
                <span className="text-[10px] opacity-70 font-mono">{reviews.length}</span>
              </button>

              {/* 9. Settings */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#24211e] text-[#fffefb] shadow-md'
                    : 'text-[#594f45] hover:bg-[#e6e1d6]/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-[#738262]" />
                  <span>الإعدادات والنسخ</span>
                </div>
              </button>

            </div>

            {/* MAIN TAB CONTENT AREA */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[#fffefb]">
              
              {/* TAB 1: SITE CONTENT CMS (Edit All Sections) */}
              {activeTab === 'content' && (
                <div className="space-y-6 text-right">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'الحسابات المسجّلة', value: registeredUsersCount, icon: UserCheck },
                      { label: 'سجل العملاء', value: clients.length, icon: Users },
                      { label: 'طلبات الحجز', value: bookings.length, icon: Calendar },
                      { label: 'الألبومات', value: albums.length, icon: ImageIcon },
                    ].map(({ label, value, icon: MetricIcon }) => (
                      <div key={label} className="rounded-2xl border border-[#e6e1d6] bg-[#faf8f5] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <MetricIcon className="w-5 h-5 text-[#8c6742]" />
                          <span className="font-serif text-2xl font-bold text-[#24211e]">{value}</span>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-[#6e6359]">{label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#8c7f73]">
                    عداد الحسابات يعرض المستخدمين الفريدين الذين سجّلوا دخولهم إلى الموقع منذ تفعيل الإحصاء.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e1d6] pb-4">
                    <div>
                      <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e] flex items-center gap-2">
                        <span>تخصيص وتعديل كافة أقسام الموقع</span>
                        <Sparkles className="w-5 h-5 text-[#c6a585]" />
                      </h3>
                      <p className="text-xs text-[#73685d]">
                        يمكنك تعديل نصوص، عناوين، وصور كل قسم في الموقع وسيتم تحديثها فوراً
                      </p>
                    </div>

                    <button
                      onClick={handleSaveSiteContent}
                      disabled={isSavingContent}
                      className="bg-[#24211e] hover:bg-[#3d3833] disabled:cursor-wait disabled:opacity-60 text-[#fffefb] px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all"
                    >
                      {isSavingContent ? <RefreshCw className="w-4 h-4 animate-spin text-[#c6a585]" /> : <Check className="w-4 h-4 text-[#c6a585]" />}
                      <span>{isSavingContent ? 'جاري الحفظ في Firebase...' : 'حفظ كافة التعديلات في الموقع'}</span>
                    </button>
                  </div>

                  {contentSavedSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-end gap-2">
                      <span>تم حفظ ونشر تعديلات محتوى الموقع بنجاح!</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}

                  {/* Sub-tab navigation for sections */}
                  <div className="flex flex-wrap gap-2 pb-2 border-b border-[#e6e1d6]/70">
                    {[
                      { id: 'brand', label: '1. الهوية واللوجو' },
                      { id: 'hero', label: '2. واجهة الهيرو (Hero)' },
                      { id: 'intro', label: '3. الفلسفة والمقدمة' },
                      { id: 'services', label: '4. الخدمات والباقات' },
                      { id: 'approach', label: '5. منهجية كاليستا' },
                      { id: 'about', label: '6. كاليستا وروناديسا' },
                      { id: 'experience', label: '7. التجربة والمراحل' },
                      { id: 'faq', label: '8. الأسئلة الشائعة' },
                      { id: 'contact', label: '9. التواصل والحجز' },
                      { id: 'footer', label: '10. الفوتر' },
                    ].map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => setContentSubTab(sec.id as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          contentSubTab === sec.id
                            ? 'bg-[#c6a585] text-white font-bold shadow-sm'
                            : 'bg-[#e6e1d6]/50 text-[#594f45] hover:bg-[#e6e1d6]'
                        }`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>

                  {/* 1. Brand Subtab */}
                  {contentSubTab === 'brand' && (
                    <div className="space-y-4 bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6]">
                      <h4 className="font-bold text-sm text-[#24211e]">إعدادات الهوية والعلامة التجارية</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">اسم الاستوديو</label>
                          <input
                            type="text"
                            value={editableContent.brand.studioName}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              brand: { ...editableContent.brand, studioName: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">اسم المؤسسة والمصورة</label>
                          <input
                            type="text"
                            value={editableContent.brand.founderName}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              brand: { ...editableContent.brand, founderName: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">الشعار العربي (Tagline Ar)</label>
                          <input
                            type="text"
                            value={editableContent.brand.taglineAr}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              brand: { ...editableContent.brand, taglineAr: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">الشعار الإنجليزي (Tagline En)</label>
                          <input
                            type="text"
                            value={editableContent.brand.taglineEn}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              brand: { ...editableContent.brand, taglineEn: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      {/* LOGO CONFIGURATION & UPLOADS */}
                      <div className="border-t border-[#e6e1d6] pt-5 space-y-5">
                        <div>
                          <h5 className="font-bold text-xs text-[#24211e] flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-[#c6a585]" />
                            <span>تخصيص ورفع لوجو الموقع (الهيدر والفوتر)</span>
                          </h5>
                          <p className="text-[11px] text-[#73685d] mt-0.5">
                            يمكنك رفع لوجو خاص من جهازك أو وضع رابط صورة أو استخدام تصميم الشعار الفيكتور الأصلي.
                          </p>
                        </div>

                        {/* 1. Header Logo */}
                        <div className="p-4 bg-white rounded-xl border border-[#e6e1d6] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#24211e]">لوجو أعلى الموقع (Header Logo)</span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-[#594f45] cursor-pointer">
                                <input
                                  type="radio"
                                  name="headerLogoType"
                                  checked={editableContent.brand.logoType !== 'image'}
                                  onChange={() => setEditableContent({
                                    ...editableContent,
                                    brand: { ...editableContent.brand, logoType: 'vector' }
                                  })}
                                  className="accent-[#c6a585]"
                                />
                                <span>شعار نصي فيكتور (KALLISTA)</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-[#594f45] cursor-pointer">
                                <input
                                  type="radio"
                                  name="headerLogoType"
                                  checked={editableContent.brand.logoType === 'image'}
                                  onChange={() => setEditableContent({
                                    ...editableContent,
                                    brand: { ...editableContent.brand, logoType: 'image' }
                                  })}
                                  className="accent-[#c6a585]"
                                />
                                <span>صورة لوجو مخصصة</span>
                              </label>
                            </div>
                          </div>

                          {editableContent.brand.logoType === 'image' && (
                            <div className="space-y-3 pt-2">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <input
                                  type="text"
                                  value={editableContent.brand.logoImageUrl || ''}
                                  onChange={(e) => setEditableContent({
                                    ...editableContent,
                                    brand: { ...editableContent.brand, logoImageUrl: e.target.value }
                                  })}
                                  placeholder="https://... رابط صورة اللوجو أو ارفع من جهازك"
                                  className="flex-1 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                                />
                                <input
                                  type="file"
                                  ref={headerLogoInputRef}
                                  onChange={handleUploadHeaderLogo}
                                  accept="image/*"
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  disabled={isUploadingHeaderLogo}
                                  onClick={() => headerLogoInputRef.current?.click()}
                                  className="px-4 py-2 bg-[#24211e] hover:bg-[#3d3833] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                  <Upload className="w-3.5 h-3.5 text-[#c6a585]" />
                                  <span>{isUploadingHeaderLogo ? 'جاري الرفع...' : 'رفع لوجو الهيدر من جهازك'}</span>
                                </button>
                              </div>

                              {editableContent.brand.logoImageUrl && (
                                <div className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-xl border border-[#e6e1d6]">
                                  <div className="flex items-center gap-3">
                                    <div className="w-16 h-12 bg-white rounded-lg border border-[#e6e1d6] flex items-center justify-center p-1.5 overflow-hidden">
                                      <img
                                        src={editableContent.brand.logoImageUrl}
                                        alt="Header Logo Preview"
                                        className="max-h-full max-w-full object-contain"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold text-[#24211e] block">معاينة لوجو الهيدر</span>
                                      <span className="text-[10px] text-emerald-700 font-medium">جاهز ومعتمد</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setEditableContent({
                                      ...editableContent,
                                      brand: { ...editableContent.brand, logoImageUrl: '' }
                                    })}
                                    className="text-xs text-red-600 hover:text-red-700 px-2 py-1"
                                  >
                                    إزالة الصورة
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 2. Footer Logo */}
                        <div className="p-4 bg-white rounded-xl border border-[#e6e1d6] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#24211e]">لوجو أسفل الموقع (Footer Logo)</span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-[#594f45] cursor-pointer">
                                <input
                                  type="radio"
                                  name="footerLogoType"
                                  checked={!editableContent.brand.footerLogoType || editableContent.brand.footerLogoType === 'same_as_header'}
                                  onChange={() => setEditableContent({
                                    ...editableContent,
                                    brand: { ...editableContent.brand, footerLogoType: 'same_as_header' }
                                  })}
                                  className="accent-[#c6a585]"
                                />
                                <span>نفس لوجو الهيدر تلقائياً</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-[#594f45] cursor-pointer">
                                <input
                                  type="radio"
                                  name="footerLogoType"
                                  checked={editableContent.brand.footerLogoType === 'image'}
                                  onChange={() => setEditableContent({
                                    ...editableContent,
                                    brand: { ...editableContent.brand, footerLogoType: 'image' }
                                  })}
                                  className="accent-[#c6a585]"
                                />
                                <span>صورة مخصصة للفوتر (أبيض/ذهبي)</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-[#594f45] cursor-pointer">
                                <input
                                  type="radio"
                                  name="footerLogoType"
                                  checked={editableContent.brand.footerLogoType === 'vector'}
                                  onChange={() => setEditableContent({
                                    ...editableContent,
                                    brand: { ...editableContent.brand, footerLogoType: 'vector' }
                                  })}
                                  className="accent-[#c6a585]"
                                />
                                <span>فيكتور نصي أصلي</span>
                              </label>
                            </div>
                          </div>

                          {editableContent.brand.footerLogoType === 'image' && (
                            <div className="space-y-3 pt-2">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <input
                                  type="text"
                                  value={editableContent.brand.footerLogoImageUrl || ''}
                                  onChange={(e) => setEditableContent({
                                    ...editableContent,
                                    brand: { ...editableContent.brand, footerLogoImageUrl: e.target.value }
                                  })}
                                  placeholder="https://... رابط صورة لوجو الفوتر أو ارفع من جهازك"
                                  className="flex-1 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                                />
                                <input
                                  type="file"
                                  ref={footerLogoInputRef}
                                  onChange={handleUploadFooterLogo}
                                  accept="image/*"
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  disabled={isUploadingFooterLogo}
                                  onClick={() => footerLogoInputRef.current?.click()}
                                  className="px-4 py-2 bg-[#24211e] hover:bg-[#3d3833] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                                >
                                  <Upload className="w-3.5 h-3.5 text-[#c6a585]" />
                                  <span>{isUploadingFooterLogo ? 'جاري الرفع...' : 'رفع لوجو الفوتر من جهازك'}</span>
                                </button>
                              </div>

                              {editableContent.brand.footerLogoImageUrl && (
                                <div className="flex items-center justify-between p-3 bg-[#1c1a17] text-white rounded-xl border border-[#3d3833]">
                                  <div className="flex items-center gap-3">
                                    <div className="w-16 h-12 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center p-1.5 overflow-hidden">
                                      <img
                                        src={editableContent.brand.footerLogoImageUrl}
                                        alt="Footer Logo Preview"
                                        className="max-h-full max-w-full object-contain"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold text-[#faf8f5] block">معاينة لوجو الفوتر (الخلفية الداكنة)</span>
                                      <span className="text-[10px] text-[#c6a585] font-medium">جاهز ومعتمد للفوتر</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setEditableContent({
                                      ...editableContent,
                                      brand: { ...editableContent.brand, footerLogoImageUrl: '' }
                                    })}
                                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                                  >
                                    إزالة الصورة
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 text-xs text-[#403831] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editableContent.brand.showPalestinianBadge}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              brand: { ...editableContent.brand, showPalestinianBadge: e.target.checked }
                            })}
                            className="rounded accent-[#c6a585]"
                          />
                          <span>عرض شارة "فلسطين في القلب" في النافبار 🇵🇸</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 2. Hero Subtab */}
                  {contentSubTab === 'hero' && (
                    <div className="space-y-4 bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6]">
                      <h4 className="font-bold text-sm text-[#24211e]">واجهة الهيرو الرئيسية (Hero Section)</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">العنوان الفرعي الإنجليزي</label>
                          <input
                            type="text"
                            value={editableContent.hero.preTitle}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              hero: { ...editableContent.hero, preTitle: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">العنوان الرئيسي الأول</label>
                          <input
                            type="text"
                            value={editableContent.hero.titleMain}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              hero: { ...editableContent.hero, titleMain: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">العنوان الرئيسي المميز (Accent)</label>
                          <input
                            type="text"
                            value={editableContent.hero.titleAccent}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              hero: { ...editableContent.hero, titleAccent: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#594f45] mb-1">النص الترحيبي الشامل (موجه للجميع)</label>
                        <textarea
                          rows={3}
                          value={editableContent.hero.subtitle}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            hero: { ...editableContent.hero, subtitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#594f45] mb-1">رابط صورة الهيرو المميزة (ألبوم الزفاف / صورة روناديسا)</label>
                        <input
                          type="text"
                          value={editableContent.hero.bgImageUrl || ''}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            hero: { ...editableContent.hero, bgImageUrl: e.target.value }
                          })}
                          placeholder="اتركه فارغاً لاستخدام الصورة الافتراضية"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. Intro Subtab */}
                  {contentSubTab === 'intro' && (
                    <div className="space-y-4 bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6]">
                      <h4 className="font-bold text-sm text-[#24211e]">قسم الفلسفة والمقدمة</h4>
                      
                      <div>
                        <label className="block text-xs font-semibold text-[#594f45] mb-1">عنوان الفلسفة البصرية</label>
                        <input
                          type="text"
                          value={editableContent.intro.heading}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            intro: { ...editableContent.intro, heading: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">الفقرة الأولى</label>
                          <textarea
                            rows={3}
                            value={editableContent.intro.paragraph1}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              intro: { ...editableContent.intro, paragraph1: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">الفقرة الثانية</label>
                          <textarea
                            rows={3}
                            value={editableContent.intro.paragraph2}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              intro: { ...editableContent.intro, paragraph2: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">الاقتباس</label>
                          <input
                            type="text"
                            value={editableContent.intro.quote}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              intro: { ...editableContent.intro, quote: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">قائل الاقتباس</label>
                          <input
                            type="text"
                            value={editableContent.intro.quoteAuthor}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              intro: { ...editableContent.intro, quoteAuthor: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Services Subtab */}
                  {contentSubTab === 'services' && (
                    <div className="space-y-6 bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e6e1d6] pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-[#24211e]">باقات وخدمات التصوير وعرض الأسعار</h4>
                          <p className="text-xs text-[#73685d]">
                            التحكم في إظهار أو إخفاء الأسعار، مع تحويل العميل للواتساب عند الإخفاء
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-[#73685d]">
                            {editableContent.services.length} باقات مفعّلة
                          </span>
                          <button
                            type="button"
                            onClick={handleAddServicePackage}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#24211e] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#3d3833]"
                          >
                            <Plus className="h-4 w-4 text-[#c6a585]" />
                            إضافة باقة جديدة
                          </button>
                        </div>
                      </div>

                      {/* Global Price Display Settings */}
                      <div className="p-4 bg-white rounded-xl border border-[#c6a585] space-y-3">
                        <h5 className="font-bold text-xs text-[#24211e] flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-[#c6a585]" />
                          <span>إعدادات الأسعار العامة للباقات</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <label className="flex items-center gap-2 text-xs text-[#24211e] font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editableContent.servicesSettings?.showPricing ?? true}
                              onChange={(e) =>
                                setEditableContent({
                                  ...editableContent,
                                  servicesSettings: {
                                    ...(editableContent.servicesSettings || {
                                      showPricing: true,
                                      hidePriceCustomText: 'تواصل عبر واتساب لعرض الأسعار المخصصة',
                                    }),
                                    showPricing: e.target.checked,
                                  },
                                })
                              }
                              className="rounded accent-[#c6a585]"
                            />
                            <span>عرض الأسعار على الموقع (Show Pricing)</span>
                          </label>

                          <div>
                            <label className="block text-[11px] text-[#594f45] mb-0.5">
                              النص البديل عند إخفاء الأسعار
                            </label>
                            <input
                              type="text"
                              value={
                                editableContent.servicesSettings?.hidePriceCustomText ||
                                'تواصل عبر واتساب لعرض الأسعار المخصصة'
                              }
                              onChange={(e) =>
                                setEditableContent({
                                  ...editableContent,
                                  servicesSettings: {
                                    ...(editableContent.servicesSettings || { showPricing: true }),
                                    hidePriceCustomText: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                            />
                          </div>
                        </div>
                      </div>

                      {editableContent.services.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#c6a585] bg-white p-8 text-center">
                          <p className="text-sm font-bold text-[#403831]">لا توجد باقات حاليًا</p>
                          <p className="mt-1 text-xs text-[#73685d]">اضغط «إضافة باقة جديدة» لإنشاء أول باقة تصوير.</p>
                        </div>
                      )}

                      {editableContent.services.map((srv, idx) => (
                        <div id={`service-editor-${srv.id}`} key={srv.id} className="space-y-3 rounded-xl border border-[#e6e1d6] bg-white p-4">
                          <div className="flex items-center justify-between gap-3 border-b border-[#e6e1d6] pb-3">
                            <div>
                              <span className="text-[10px] font-semibold text-[#8c7f73]">الباقة رقم {idx + 1}</span>
                              <p className="text-xs font-bold text-[#403831]">{srv.titleAr || 'باقة بدون اسم'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteServicePackage(srv)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700 transition-colors hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              حذف الباقة
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] text-[#594f45] mb-0.5">اسم الباقة (عربي) *</label>
                              <input
                                type="text"
                                required
                                value={srv.titleAr}
                                onChange={(e) => {
                                  const updated = [...editableContent.services];
                                  updated[idx].titleAr = e.target.value;
                                  setEditableContent({ ...editableContent, services: updated });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-[#594f45] mb-0.5">اسم الباقة (إنجليزي)</label>
                              <input
                                type="text"
                                value={srv.titleEn}
                                onChange={(e) => {
                                  const updated = [...editableContent.services];
                                  updated[idx].titleEn = e.target.value;
                                  setEditableContent({ ...editableContent, services: updated });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-[#594f45] mb-0.5">السعر المعروض</label>
                              <input
                                type="text"
                                value={srv.priceStarting || ''}
                                onChange={(e) => {
                                  const updated = [...editableContent.services];
                                  updated[idx].priceStarting = e.target.value;
                                  setEditableContent({ ...editableContent, services: updated });
                                }}
                                placeholder="مثال: يبدأ من 4,500 ج.م"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                              />
                            </div>
                            <div className="flex items-center pt-4">
                              <label className="flex items-center gap-2 text-xs text-[#594f45] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={srv.showPrice ?? true}
                                  onChange={(e) => {
                                    const updated = [...editableContent.services];
                                    updated[idx].showPrice = e.target.checked;
                                    setEditableContent({ ...editableContent, services: updated });
                                  }}
                                  className="rounded accent-[#c6a585]"
                                />
                                <span>عرض سعر هذه الباقة</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="mb-0.5 block text-[11px] text-[#594f45]">التصنيف المرتبط بالباقة *</label>
                            <select
                              value={srv.categorySlug}
                              onChange={(e) => {
                                const updated = [...editableContent.services];
                                updated[idx].categorySlug = e.target.value;
                                setEditableContent({ ...editableContent, services: updated });
                              }}
                              className="w-full rounded-lg border border-[#e6e1d6] bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#24211e] sm:max-w-xs"
                            >
                              {categories.filter((category) => category.slug !== 'all' && category.active !== false).map((category) => (
                                <option key={category.id} value={category.slug}>{category.nameAr}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-[#594f45] mb-0.5">وصف الباقة *</label>
                            <textarea
                              rows={2}
                              required
                              value={srv.descriptionAr}
                              onChange={(e) => {
                                const updated = [...editableContent.services];
                                updated[idx].descriptionAr = e.target.value;
                                setEditableContent({ ...editableContent, services: updated });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 5. Approach Subtab */}
                  {contentSubTab === 'approach' && (
                    <div className="space-y-6 bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6]">
                      <div className="border-b border-[#e6e1d6] pb-3">
                        <h4 className="font-bold text-sm text-[#24211e]">منهجية العمل الفوتوغرافي والخطوات الأربعة</h4>
                        <p className="text-xs text-[#73685d]">
                          تعديل عناوين ووصف المراحل الأربعة التي يمر بها العميل مع كاليستا
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">عنوان القسم *</label>
                          <input
                            type="text"
                            required
                            value={editableContent.approach.sectionTitle}
                            onChange={(e) =>
                              setEditableContent({
                                ...editableContent,
                                approach: { ...editableContent.approach, sectionTitle: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">الوصف الفرعي *</label>
                          <input
                            type="text"
                            required
                            value={editableContent.approach.sectionSubtitle}
                            onChange={(e) =>
                              setEditableContent({
                                ...editableContent,
                                approach: { ...editableContent.approach, sectionSubtitle: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h5 className="font-bold text-xs text-[#24211e]">خطوات ومراحل المنهجية (4 مراحل)</h5>
                        {editableContent.approach.steps.map((step, sIdx) => (
                          <div key={sIdx} className="p-4 bg-white rounded-xl border border-[#e6e1d6] space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] text-[#594f45] mb-0.5">رقم الخطوة</label>
                                <input
                                  type="text"
                                  value={step.number}
                                  onChange={(e) => {
                                    const updatedSteps = [...editableContent.approach.steps];
                                    updatedSteps[sIdx].number = e.target.value;
                                    setEditableContent({
                                      ...editableContent,
                                      approach: { ...editableContent.approach, steps: updatedSteps },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e] font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-[#594f45] mb-0.5">عنوان الخطوة *</label>
                                <input
                                  type="text"
                                  required
                                  value={step.title}
                                  onChange={(e) => {
                                    const updatedSteps = [...editableContent.approach.steps];
                                    updatedSteps[sIdx].title = e.target.value;
                                    setEditableContent({
                                      ...editableContent,
                                      approach: { ...editableContent.approach, steps: updatedSteps },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-[#594f45] mb-0.5">العنوان الفرعي الإنجليزي</label>
                                <input
                                  type="text"
                                  value={step.subtitle}
                                  onChange={(e) => {
                                    const updatedSteps = [...editableContent.approach.steps];
                                    updatedSteps[sIdx].subtitle = e.target.value;
                                    setEditableContent({
                                      ...editableContent,
                                      approach: { ...editableContent.approach, steps: updatedSteps },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-[#594f45] mb-0.5">الوصف التفصيلي *</label>
                                <textarea
                                  rows={2}
                                  required
                                  value={step.description}
                                  onChange={(e) => {
                                    const updatedSteps = [...editableContent.approach.steps];
                                    updatedSteps[sIdx].description = e.target.value;
                                    setEditableContent({
                                      ...editableContent,
                                      approach: { ...editableContent.approach, steps: updatedSteps },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-[#594f45] mb-0.5">الميزة واللمسة الإضافية</label>
                                <textarea
                                  rows={2}
                                  value={step.detail}
                                  onChange={(e) => {
                                    const updatedSteps = [...editableContent.approach.steps];
                                    updatedSteps[sIdx].detail = e.target.value;
                                    setEditableContent({
                                      ...editableContent,
                                      approach: { ...editableContent.approach, steps: updatedSteps },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. About Ronadisa & Kallista Subtab */}
                  {contentSubTab === 'about' && (
                    <div className="space-y-6 bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6]">
                      <div className="border-b border-[#e6e1d6] pb-3">
                        <h4 className="font-bold text-sm text-[#24211e]">عن استوديو كاليستا والمصورة روناديسا (Ronadisa)</h4>
                        <p className="text-xs text-[#73685d]">
                          تعديل السيرة الذاتية، فلسفة الاستوديو، والرموز البصرية
                        </p>
                      </div>
                      
                      {/* About Kallista Section */}
                      <div className="p-4 bg-white rounded-xl border border-[#e6e1d6] space-y-3">
                        <h5 className="font-bold text-xs text-[#24211e]">1. قسم استوديو كاليستا (About Kallista)</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-[#594f45] mb-0.5">عنوان القسم</label>
                            <input
                              type="text"
                              value={editableContent.aboutKallista.title}
                              onChange={(e) =>
                                setEditableContent({
                                  ...editableContent,
                                  aboutKallista: { ...editableContent.aboutKallista, title: e.target.value },
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#594f45] mb-0.5">العنوان الفرعي</label>
                            <input
                              type="text"
                              value={editableContent.aboutKallista.subtitle}
                              onChange={(e) =>
                                setEditableContent({
                                  ...editableContent,
                                  aboutKallista: { ...editableContent.aboutKallista, subtitle: e.target.value },
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-[#594f45] mb-0.5">الفقرة الأولى</label>
                            <textarea
                              rows={3}
                              value={editableContent.aboutKallista.paragraph1}
                              onChange={(e) =>
                                setEditableContent({
                                  ...editableContent,
                                  aboutKallista: { ...editableContent.aboutKallista, paragraph1: e.target.value },
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#594f45] mb-0.5">الفقرة الثانية</label>
                            <textarea
                              rows={3}
                              value={editableContent.aboutKallista.paragraph2}
                              onChange={(e) =>
                                setEditableContent({
                                  ...editableContent,
                                  aboutKallista: { ...editableContent.aboutKallista, paragraph2: e.target.value },
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* About Ronadisa Section */}
                      <div className="p-4 bg-white rounded-xl border border-[#e6e1d6] space-y-3">
                        <h5 className="font-bold text-xs text-[#24211e]">2. سيرة المصورة روناديسا (Ronadisa Profile)</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#594f45] mb-1">عنوان القسم *</label>
                            <input
                              type="text"
                              required
                              value={editableContent.aboutRonadisa.title}
                              onChange={(e) => setEditableContent({
                                ...editableContent,
                                aboutRonadisa: { ...editableContent.aboutRonadisa, title: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#594f45] mb-1">رابط صورة روناديسا *</label>
                            <input
                              type="text"
                              required
                              value={editableContent.aboutRonadisa.photoUrl}
                              onChange={(e) => setEditableContent({
                                ...editableContent,
                                aboutRonadisa: { ...editableContent.aboutRonadisa, photoUrl: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#594f45] mb-1">السيرة الذاتية (الفقرة 1) *</label>
                            <textarea
                              rows={3}
                              required
                              value={editableContent.aboutRonadisa.bioParagraph1}
                              onChange={(e) => setEditableContent({
                                ...editableContent,
                                aboutRonadisa: { ...editableContent.aboutRonadisa, bioParagraph1: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#594f45] mb-1">السيرة الذاتية (الفقرة 2 والرمزية الفلسطينية) *</label>
                            <textarea
                              rows={3}
                              required
                              value={editableContent.aboutRonadisa.bioParagraph2}
                              onChange={(e) => setEditableContent({
                                ...editableContent,
                                aboutRonadisa: { ...editableContent.aboutRonadisa, bioParagraph2: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">نص التحية للهوية الفلسطينية</label>
                          <input
                            type="text"
                            value={editableContent.aboutRonadisa.palestinianTribute}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              aboutRonadisa: { ...editableContent.aboutRonadisa, palestinianTribute: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. Experience Subtab */}
                  {contentSubTab === 'experience' && (
                    <div className="space-y-6 bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6]">
                      <div className="border-b border-[#e6e1d6] pb-3">
                        <h4 className="font-bold text-sm text-[#24211e]">تجربة كاليستا، الجدول الزمني والضمانات</h4>
                        <p className="text-xs text-[#73685d]">
                          تعديل مراحل يوم الحفل، مواعيد التسليم، والضمانات الذهبية
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">عنوان القسم *</label>
                          <input
                            type="text"
                            required
                            value={editableContent.experience.title}
                            onChange={(e) =>
                              setEditableContent({
                                ...editableContent,
                                experience: { ...editableContent.experience, title: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">الوصف الفرعي *</label>
                          <input
                            type="text"
                            required
                            value={editableContent.experience.subtitle}
                            onChange={(e) =>
                              setEditableContent({
                                ...editableContent,
                                experience: { ...editableContent.experience, subtitle: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h5 className="font-bold text-xs text-[#24211e]">الجدول الزمني ومراحل التجربة</h5>
                        {editableContent.experience.timelineSteps.map((step, idx) => (
                          <div key={idx} className="p-4 bg-white rounded-xl border border-[#e6e1d6] space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] text-[#594f45] mb-0.5">رمز المرحلة</label>
                                <input
                                  type="text"
                                  value={step.step}
                                  onChange={(e) => {
                                    const updated = [...editableContent.experience.timelineSteps];
                                    updated[idx].step = e.target.value;
                                    setEditableContent({
                                      ...editableContent,
                                      experience: { ...editableContent.experience, timelineSteps: updated },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e] font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-[#594f45] mb-0.5">عنوان المرحلة *</label>
                                <input
                                  type="text"
                                  required
                                  value={step.title}
                                  onChange={(e) => {
                                    const updated = [...editableContent.experience.timelineSteps];
                                    updated[idx].title = e.target.value;
                                    setEditableContent({
                                      ...editableContent,
                                      experience: { ...editableContent.experience, timelineSteps: updated },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-[#594f45] mb-0.5">الوقت والتوقيت</label>
                                <input
                                  type="text"
                                  value={step.time}
                                  onChange={(e) => {
                                    const updated = [...editableContent.experience.timelineSteps];
                                    updated[idx].time = e.target.value;
                                    setEditableContent({
                                      ...editableContent,
                                      experience: { ...editableContent.experience, timelineSteps: updated },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] text-[#594f45] mb-0.5">شرح المرحلة *</label>
                              <textarea
                                rows={2}
                                required
                                value={step.desc}
                                onChange={(e) => {
                                  const updated = [...editableContent.experience.timelineSteps];
                                  updated[idx].desc = e.target.value;
                                  setEditableContent({
                                    ...editableContent,
                                    experience: { ...editableContent.experience, timelineSteps: updated },
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 pt-2">
                        <h5 className="font-bold text-xs text-[#24211e]">ضمانات كاليستا الذهبية</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {editableContent.experience.guarantees.map((guar, gIdx) => (
                            <div key={gIdx} className="p-4 bg-white rounded-xl border border-[#e6e1d6] space-y-2">
                              <div>
                                <label className="block text-[11px] text-[#594f45] mb-0.5">عنوان الضمان *</label>
                                <input
                                  type="text"
                                  required
                                  value={guar.title}
                                  onChange={(e) => {
                                    const updated = [...editableContent.experience.guarantees];
                                    updated[gIdx].title = e.target.value;
                                    setEditableContent({
                                      ...editableContent,
                                      experience: { ...editableContent.experience, guarantees: updated },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e] font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-[#594f45] mb-0.5">تفاصيل الضمان *</label>
                                <textarea
                                  rows={2}
                                  required
                                  value={guar.desc}
                                  onChange={(e) => {
                                    const updated = [...editableContent.experience.guarantees];
                                    updated[gIdx].desc = e.target.value;
                                    setEditableContent({
                                      ...editableContent,
                                      experience: { ...editableContent.experience, guarantees: updated },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#24211e]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. FAQ Subtab */}
                  {contentSubTab === 'faq' && (
                    <div className="space-y-4 bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6]">
                      <div className="flex items-center justify-between border-b border-[#e6e1d6] pb-3">
                        <h4 className="font-bold text-sm text-[#24211e]">إدارة الأسئلة الشائعة</h4>
                        <button
                          onClick={() => {
                            const newFaq: FAQItem = {
                              id: 'faq-' + Date.now(),
                              question: 'سؤال جديد؟',
                              answer: 'إجابة واضحة ومفصلة هنا.',
                              category: 'general',
                            };
                            setEditableContent({ ...editableContent, faq: [...editableContent.faq, newFaq] });
                          }}
                          className="px-3 py-1 bg-[#24211e] text-white rounded-lg text-xs flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة سؤال جديد</span>
                        </button>
                      </div>

                      {editableContent.faq.map((item, idx) => (
                        <div key={item.id || idx} className="p-4 bg-white rounded-xl border border-[#e6e1d6] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              required
                              value={item.question}
                              onChange={(e) => {
                                const updated = [...editableContent.faq];
                                updated[idx].question = e.target.value;
                                setEditableContent({ ...editableContent, faq: updated });
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs font-bold text-[#24211e]"
                            />
                            <button
                              onClick={() => {
                                setEditableContent({
                                  ...editableContent,
                                  faq: editableContent.faq.filter((_, i) => i !== idx)
                                });
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              title="حذف السؤال"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            required
                            value={item.answer}
                            onChange={(e) => {
                              const updated = [...editableContent.faq];
                              updated[idx].answer = e.target.value;
                              setEditableContent({ ...editableContent, faq: updated });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#e6e1d6] text-xs text-[#4d443b]"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 9. Contact Subtab */}
                  {contentSubTab === 'contact' && (
                    <div className="space-y-4 bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6]">
                      <h4 className="font-bold text-sm text-[#24211e]">بيانات التواصل وأرقام الهواتف</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">رقم الواتساب (WhatsApp) *</label>
                          <input
                            type="text"
                            required
                            value={editableContent.contact.whatsapp}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              contact: { ...editableContent.contact, whatsapp: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">الهاتف للاتصال (Phone) *</label>
                          <input
                            type="text"
                            required
                            value={editableContent.contact.phone}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              contact: { ...editableContent.contact, phone: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">البريد الإلكتروني (Email) *</label>
                          <input
                            type="email"
                            required
                            value={editableContent.contact.email}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              contact: { ...editableContent.contact, email: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">عنوان الاستوديو والمدينة *</label>
                          <input
                            type="text"
                            required
                            value={editableContent.contact.address}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              contact: { ...editableContent.contact, address: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">مواعيد العمل *</label>
                          <input
                            type="text"
                            required
                            value={editableContent.contact.workingHours}
                            onChange={(e) => setEditableContent({
                              ...editableContent,
                              contact: { ...editableContent.contact, workingHours: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 border-t border-[#e6e1d6] pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h5 className="text-xs font-bold text-[#403831]">روابط منصات التواصل</h5>
                            <p className="text-[11px] text-[#85796f]">اختر لوجو المنصة، ثم أضف اسم الحساب أو المنصة والرابط.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditableContent({
                              ...editableContent,
                              contact: {
                                ...editableContent.contact,
                                socialLinks: [...editableSocialLinks, { id: `social-${Date.now()}`, label: 'Instagram', icon: 'instagram', url: '' }],
                              },
                            })}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#24211e] px-3 py-2 text-[11px] font-semibold text-white"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            إضافة منصة
                          </button>
                        </div>

                        {editableSocialLinks.length === 0 && (
                          <div className="rounded-xl border border-dashed border-[#d8cfc4] bg-white p-4 text-center text-xs text-[#85796f]">
                            لا توجد روابط سوشيال مضافة بعد.
                          </div>
                        )}

                        {editableSocialLinks.map((link, index) => {
                          const selectedPlatform = link.icon || inferSocialPlatform(link.label, link.url);
                          return (
                            <div key={link.id} className="space-y-3 rounded-2xl border border-[#e6e1d6] bg-white p-3 sm:p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-[#403831]">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#24211e] text-white">
                                    <SocialPlatformIcon platform={selectedPlatform} className="h-4 w-4" />
                                  </span>
                                  <span>{link.label || 'منصة جديدة'}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditableContent({
                                    ...editableContent,
                                    contact: { ...editableContent.contact, socialLinks: editableSocialLinks.filter((_, itemIndex) => itemIndex !== index) },
                                  })}
                                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                  title="حذف الرابط"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div>
                                <span className="mb-2 block text-[11px] font-semibold text-[#6e6359]">اختر لوجو المنصة</span>
                                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-11">
                                  {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => {
                                        const updated = editableSocialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, icon: option.value, label: option.value === 'website' && item.label ? item.label : option.label } : item);
                                        setEditableContent({ ...editableContent, contact: { ...editableContent.contact, socialLinks: updated } });
                                      }}
                                      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-[9px] font-semibold transition-all ${selectedPlatform === option.value ? 'border-[#24211e] bg-[#24211e] text-white shadow-sm' : 'border-[#e6e1d6] bg-[#FAF8F5] text-[#594f45] hover:border-[#c6a585]'}`}
                                      title={option.label}
                                      aria-label={`اختيار ${option.label}`}
                                    >
                                      <SocialPlatformIcon platform={option.value} className="h-4 w-4" />
                                      <span className="max-w-full truncate">{option.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr]">
                                <input
                                  type="text"
                                  value={link.label}
                                  placeholder="اسم المنصة أو الحساب"
                                  onChange={(event) => {
                                    const updated = editableSocialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item);
                                    setEditableContent({ ...editableContent, contact: { ...editableContent.contact, socialLinks: updated } });
                                  }}
                                  className="w-full rounded-lg border border-[#e6e1d6] bg-[#FAF8F5] px-3 py-2 text-xs text-[#24211e]"
                                />
                                <input
                                  type="url"
                                  value={link.url}
                                  placeholder="https://..."
                                  dir="ltr"
                                  onChange={(event) => {
                                    const updated = editableSocialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item);
                                    setEditableContent({ ...editableContent, contact: { ...editableContent.contact, socialLinks: updated } });
                                  }}
                                  className="w-full rounded-lg border border-[#e6e1d6] bg-[#FAF8F5] px-3 py-2 text-left text-xs text-[#24211e]"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 10. Footer Subtab */}
                  {contentSubTab === 'footer' && (
                    <div className="space-y-4 bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6]">
                      <h4 className="font-bold text-sm text-[#24211e]">نصوص وتفاصيل الفوتر وحقوق النشر والمطور</h4>
                      
                      <div>
                        <label className="block text-xs font-semibold text-[#594f45] mb-1">نص حقوق الملكية (Copyright) *</label>
                        <input
                          type="text"
                          required
                          value={editableContent.footer.copyrightText}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            footer: { ...editableContent.footer, copyrightText: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#594f45] mb-1">حقوق التصميم والتطوير (Developer Credit)</label>
                        <input
                          type="text"
                          value={editableContent.footer.developerCredit ?? ''}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            footer: { ...editableContent.footer, developerCredit: e.target.value }
                          })}
                          placeholder="Designed & Developed by Mohammed Hussein · iegy.net ©"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e] font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#594f45] mb-1">الوصف التعريفي أسفل لوجو الفوتر</label>
                        <textarea
                          rows={2}
                          value={editableContent.footer.disclaimerText}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            footer: { ...editableContent.footer, disclaimerText: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#594f45] mb-1">تنبيه الخصوصية أسفل وصف الفوتر</label>
                        <textarea
                          rows={2}
                          value={editableContent.footer.privacyNotice}
                          onChange={(e) => setEditableContent({
                            ...editableContent,
                            footer: { ...editableContent.footer, privacyNotice: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveSiteContent}
                        disabled={isSavingContent}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#24211e] px-5 py-3 text-xs font-semibold text-[#fffefb] shadow-md transition-colors hover:bg-[#3d3833] disabled:cursor-wait disabled:opacity-60"
                      >
                        {isSavingContent ? <RefreshCw className="h-4 w-4 animate-spin text-[#c6a585]" /> : <Check className="h-4 w-4 text-[#c6a585]" />}
                        <span>{isSavingContent ? 'جاري حفظ الفوتر في Firebase...' : 'حفظ نصوص الفوتر في Firebase'}</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: PORTFOLIO CATEGORIES MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="space-y-6 text-right">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e6e1d6] pb-4">
                    <div>
                      <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e] flex items-center gap-2">
                        <span>إدارة وتعديل تصنيفات المعرض</span>
                        <Sliders className="w-5 h-5 text-[#738262]" />
                      </h3>
                      <p className="text-xs text-[#73685d] mt-1">
                        يمكنك إضافة تصنيفات جديدة، تعديل الأسماء والمعرفات البرمجية، أو حذف أي تصنيف بسهولة.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsAddingCategory(true);
                        setEditingCategory(null);
                        setCategoryFormData({
                          nameAr: '',
                          nameEn: '',
                          slug: '',
                          description: '',
                          icon: 'Sparkles',
                          active: true,
                          displayOrder: categories.length + 1,
                        });
                        setTimeout(() => {
                          categoryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 50);
                      }}
                      className="bg-[#24211e] hover:bg-[#3d3833] text-[#fffefb] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shrink-0"
                    >
                      <Plus className="w-4 h-4 text-[#c6a585]" />
                      <span>إضافة تصنيف جديد</span>
                    </button>
                  </div>

                  {categorySavedSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>تم حفظ وتحديث التصنيف بنجاح في المعرض!</span>
                    </div>
                  )}

                  {/* Add / Edit Category Form */}
                  {(isAddingCategory || editingCategory) && (
                    <div ref={categoryFormRef} className="p-6 bg-[#FAF8F5] rounded-2xl border-2 border-[#c6a585] space-y-4 animate-in fade-in shadow-md">
                      <div className="flex items-center justify-between border-b border-[#e6e1d6] pb-3">
                        <h4 className="font-bold text-sm text-[#24211e] flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-[#c6a585]" />
                          <span>{editingCategory ? `تعديل تصنيف: ${editingCategory.nameAr}` : 'إضافة تصنيف جديد للمعرض'}</span>
                        </h4>
                        <span className="text-[11px] text-[#73685d]">
                          {editingCategory ? 'تحديث البيانات وحفظ التعديلات' : 'إدخال بيانات التصنيف الجديد'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">
                            الاسم بالعربية *
                          </label>
                          <input
                            type="text"
                            required
                            value={categoryFormData.nameAr}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, nameAr: e.target.value })}
                            placeholder="مثال: جلسات الخطوبة الملكية"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e] font-bold focus:ring-2 focus:ring-[#c6a585]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">
                            الاسم بالإنجليزية
                          </label>
                          <input
                            type="text"
                            value={categoryFormData.nameEn}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, nameEn: e.target.value })}
                            placeholder="e.g. Royal Engagements"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e] font-serif"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">
                            المعرف البرمجي (Slug) *
                          </label>
                          <input
                            type="text"
                            required
                            disabled={editingCategory?.slug === 'all'}
                            value={categoryFormData.slug}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                            placeholder="e.g. engagements"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e] font-mono disabled:opacity-50"
                          />
                          {editingCategory?.slug === 'all' && (
                            <span className="text-[10px] text-[#73685d] mt-0.5 block">المعرف 'all' محجوز لكافة الأعمال</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">
                            وصف التصنيف
                          </label>
                          <input
                            type="text"
                            value={categoryFormData.description || ''}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                            placeholder="وصف مختصر يوضح نوع الصور في هذا القسم"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">
                            ترتيب الظهور في المعرض
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={categoryFormData.displayOrder || 1}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, displayOrder: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#e6e1d6]">
                        <label className="flex items-center gap-2 text-xs text-[#403831] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={categoryFormData.active ?? true}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, active: e.target.checked })}
                            className="rounded accent-[#c6a585] w-4 h-4"
                          />
                          <span className="font-semibold">تفعيل التصنيف وعرضه في شريط تصفية المعرض</span>
                        </label>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingCategory(false);
                              setEditingCategory(null);
                            }}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#e6e1d6] hover:bg-[#d8d2c5] text-xs font-semibold text-[#594f45] transition-colors"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveCategory}
                            className="flex-1 sm:flex-none px-6 py-2 rounded-xl bg-[#24211e] hover:bg-[#3d3833] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 text-[#c6a585]" />
                            <span>{editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1. Mobile & Tablet Cards View (Always clean and accessible on any screen) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                    {categories.map((cat) => {
                      const linkedAlbumsCount = cat.slug === 'all'
                        ? albums.length
                        : albums.filter((a) => a.category === cat.slug).length;

                      return (
                        <div
                          key={cat.id}
                          className="bg-white p-4 rounded-2xl border border-[#e6e1d6] shadow-sm space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-[#24211e]">{cat.nameAr}</h4>
                              <p className="text-xs font-serif text-[#73685d]">{cat.nameEn || '-'}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              cat.active ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {cat.active ? 'نشط في المعرض' : 'معطل'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#594f45] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#e6e1d6]">
                            <span className="font-mono text-[11px] text-[#8c6742] bg-white px-2 py-0.5 rounded border border-[#e6e1d6]">
                              Slug: {cat.slug}
                            </span>
                            <span className="font-bold text-[#24211e]">
                              {linkedAlbumsCount} ألبوم
                            </span>
                          </div>

                          {cat.description && (
                            <p className="text-[11px] text-[#73685d] line-clamp-2">
                              {cat.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 pt-2 border-t border-[#e6e1d6]">
                            <button
                              type="button"
                              onClick={() => handleStartEditCategory(cat)}
                              className="flex-1 py-2 px-3 bg-[#FAF8F5] hover:bg-[#e6e1d6] text-[#24211e] border border-[#c6a585] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#c6a585]" />
                              <span>تعديل التصنيف</span>
                            </button>

                            {cat.slug !== 'all' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id, cat.slug, cat.nameAr)}
                                className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                <span>حذف</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 2. Desktop Table View */}
                  <div className="hidden lg:block border border-[#e6e1d6] rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-[#FAF8F5] text-[#594f45] border-b border-[#e6e1d6]">
                          <tr>
                            <th className="p-3.5 font-bold">الاسم بالعربية</th>
                            <th className="p-3.5 font-bold">الاسم بالإنجليزية</th>
                            <th className="p-3.5 font-bold">المعرف (Slug)</th>
                            <th className="p-3.5 font-bold">الألبومات المرتبطة</th>
                            <th className="p-3.5 font-bold">الترتيب</th>
                            <th className="p-3.5 font-bold">الحالة</th>
                            <th className="p-3.5 text-center font-bold">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e6e1d6]/60">
                          {categories.map((cat) => {
                            const linkedAlbumsCount = cat.slug === 'all'
                              ? albums.length
                              : albums.filter((a) => a.category === cat.slug).length;

                            return (
                              <tr key={cat.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                                <td className="p-3.5 font-bold text-[#24211e]">{cat.nameAr}</td>
                                <td className="p-3.5 font-serif text-[#665a4e]">{cat.nameEn || '-'}</td>
                                <td className="p-3.5 font-mono text-[11px] text-[#8c6742]">
                                  <span className="bg-[#fdfaf6] border border-[#e6e1d6] px-2 py-1 rounded inline-block">
                                    {cat.slug}
                                  </span>
                                </td>
                                <td className="p-3.5 font-bold text-[#24211e]">
                                  {linkedAlbumsCount} ألبوم
                                </td>
                                <td className="p-3.5 text-[#594f45]">
                                  {cat.displayOrder || '-'}
                                </td>
                                <td className="p-3.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                    cat.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    {cat.active ? 'نشط' : 'معطل'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditCategory(cat)}
                                      className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#e6e1d6] text-[#24211e] border border-[#c6a585] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                      title="تعديل التصنيف"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-[#c6a585]" />
                                      <span>تعديل</span>
                                    </button>
                                    {cat.slug !== 'all' && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(cat.id, cat.slug, cat.nameAr)}
                                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                        title="حذف التصنيف"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                        <span>حذف</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ALBUMS MANAGEMENT */}
              {activeTab === 'albums' && (
                <div className="space-y-6 text-right">
                  <div className="flex items-center justify-between border-b border-[#e6e1d6] pb-4">
                    <div>
                      <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e]">
                        إدارة وتنسيق ألبومات المعرض
                      </h3>
                      <p className="text-xs text-[#73685d]">
                        إضافة ألبومات جديدة، تعديل صور المناسبات، وتحديد الألبومات المميزة
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsCreatingAlbum(true);
                        setEditingAlbum(null);
                        setAlbumFormData({
                          title: '',
                          titleEn: '',
                          category: 'weddings',
                          coverImage: '',
                          date: new Date().toISOString().split('T')[0],
                          location: 'الإسكندرية',
                          story: '',
                          featured: true,
                          images: [],
                        });
                      }}
                      className="bg-[#24211e] hover:bg-[#3d3833] text-[#fffefb] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md"
                    >
                      <Plus className="w-4 h-4 text-[#c6a585]" />
                      <span>إضافة ألبوم جديد</span>
                    </button>
                  </div>

                  {/* Album Create/Edit Drawer Modal */}
                  {(isCreatingAlbum || editingAlbum) && (
                    <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-[#c6a585] space-y-4 animate-in fade-in">
                      <h4 className="font-bold text-sm text-[#24211e]">
                        {editingAlbum ? `تعديل ألبوم: ${editingAlbum.title}` : 'إنشاء ألبوم فوتوغرافي جديد'}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">
                            عنوان الألبوم (العربية) *
                          </label>
                          <input
                            type="text"
                            required
                            value={albumFormData.title}
                            onChange={(e) => setAlbumFormData({ ...albumFormData, title: e.target.value })}
                            placeholder="مثال: حكاية زفاف ياسمين وعمر — القصر الملكي"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">
                            العنوان الإنجليزي (Editorial Title)
                          </label>
                          <input
                            type="text"
                            value={albumFormData.titleEn}
                            onChange={(e) => setAlbumFormData({ ...albumFormData, titleEn: e.target.value })}
                            placeholder="e.g. The Royal Garden Romance"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">
                            تصنيف الألبوم (Category) *
                          </label>
                          <select
                            value={albumFormData.category}
                            onChange={(e) => setAlbumFormData({ ...albumFormData, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          >
                            {categories.filter((c) => c.slug !== 'all').map((cat) => (
                              <option key={cat.id} value={cat.slug}>
                                {cat.nameAr} ({cat.slug})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">
                            تاريخ المناسبة (Date)
                          </label>
                          <input
                            type="date"
                            value={albumFormData.date}
                            onChange={(e) => setAlbumFormData({ ...albumFormData, date: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#594f45] mb-1">
                            المكان واللوكيشن (Location)
                          </label>
                          <input
                            type="text"
                            value={albumFormData.location}
                            onChange={(e) => setAlbumFormData({ ...albumFormData, location: e.target.value })}
                            placeholder="الإسكندرية — فندق الفورسيزونز"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                        </div>
                      </div>

                      {/* Cover Image URL and Direct Upload */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#594f45]">
                          صورة الغلاف (Cover Image) *
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            required
                            value={albumFormData.coverImage}
                            onChange={(e) => setAlbumFormData({ ...albumFormData, coverImage: e.target.value })}
                            placeholder="https://... أو اضغط لرفع صورة الغلاف من جهازك"
                            className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                          />
                          <input
                            type="file"
                            ref={albumCoverInputRef}
                            onChange={handleUploadAlbumCover}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={isUploadingAlbumCover}
                            onClick={() => albumCoverInputRef.current?.click()}
                            className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#e6e1d6] border border-[#c6a585] text-[#24211e] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#c6a585]" />
                            <span>{isUploadingAlbumCover ? 'جاري الرفع...' : 'رفع صورة الغلاف'}</span>
                          </button>
                        </div>
                        {albumFormData.coverImage && (
                          <div className="flex items-center gap-3 pt-1">
                            <img
                              src={albumFormData.coverImage}
                              alt="Cover Preview"
                              className="w-16 h-12 object-cover rounded-lg border border-[#e6e1d6] shadow-sm"
                            />
                            <span className="text-[11px] text-[#738262] font-semibold">تم تعيين صورة الغلاف بنجاح</span>
                          </div>
                        )}
                      </div>

                      {/* Album Photos Upload & Management */}
                      <div className="space-y-3 p-4 bg-white rounded-xl border border-[#e6e1d6]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h5 className="font-bold text-xs text-[#24211e] flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-[#738262]" />
                              <span>صور الألبوم الفردية (Album Gallery Images)</span>
                            </h5>
                            <p className="text-[11px] text-[#73685d]">
                              يمكنك رفع مجموعة صور دفعة واحدة للألبوم وتحديد صورة الغلاف منها أو حذف أي صورة
                            </p>
                          </div>
                          <div>
                            <input
                              type="file"
                              ref={albumImagesInputRef}
                              onChange={handleUploadAlbumImages}
                              accept="image/*"
                              multiple
                              className="hidden"
                            />
                            <button
                              type="button"
                              disabled={isUploadingAlbumImages}
                              onClick={() => albumImagesInputRef.current?.click()}
                              className="px-3 py-1.5 bg-[#24211e] hover:bg-[#3d3833] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#c6a585]" />
                              <span>{isUploadingAlbumImages ? 'جاري رفع الصور...' : 'رفع صور الألبوم'}</span>
                            </button>
                          </div>
                        </div>

                        {albumUploadProgress && (
                          <div className="p-2 bg-[#FAF8F5] text-xs text-[#24211e] rounded-lg border border-[#e6e1d6]">
                            {albumUploadProgress}
                          </div>
                        )}

                        {albumFormData.images && albumFormData.images.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 max-h-48 overflow-y-auto">
                            {albumFormData.images.map((photo, pIdx) => (
                              <div key={pIdx} className="relative group rounded-lg overflow-hidden border border-[#e6e1d6] aspect-square">
                                <img
                                  src={photo.url}
                                  alt={photo.caption || `Photo ${pIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                  <button
                                    type="button"
                                    onClick={() => setAlbumFormData({ ...albumFormData, coverImage: photo.url })}
                                    className="px-1.5 py-0.5 bg-[#c6a585] text-white text-[9px] rounded font-semibold"
                                    title="تعيين كغلاف"
                                  >
                                    غلاف
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhotoFromAlbum(pIdx)}
                                    className="p-1 bg-red-600 text-white text-[9px] rounded hover:bg-red-700"
                                    title="حذف الصورة"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center border border-dashed border-[#e6e1d6] rounded-xl text-xs text-[#73685d]">
                            لم يتم رفع صور داخل الألبوم بعد. اضغط على زر "رفع صور الألبوم" لاختيار صور من جهازك.
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#594f45] mb-1">
                          قصة وكواليس الجلسة (Story)
                        </label>
                        <textarea
                          rows={2}
                          value={albumFormData.story}
                          onChange={(e) => setAlbumFormData({ ...albumFormData, story: e.target.value })}
                          placeholder="وصف تفصيلي للأجواء، الإضاءة، وتفاصيل الحجاب والفستان..."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-xs text-[#403831] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={albumFormData.featured ?? true}
                            onChange={(e) => setAlbumFormData({ ...albumFormData, featured: e.target.checked })}
                            className="rounded accent-[#c6a585]"
                          />
                          <span>ألبوم مميز يظهر في الصفحة الأولى</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingAlbum(false);
                              setEditingAlbum(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#e6e1d6] text-xs font-semibold text-[#594f45]"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveAlbum}
                            className="px-6 py-2 rounded-xl bg-[#24211e] text-white text-xs font-semibold shadow-md"
                          >
                            حفظ الألبوم
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Album Cards List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                      <div
                        key={album.id}
                        className="bg-[#FAF8F5] rounded-2xl border border-[#e6e1d6] overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/3] bg-[#e6e1d6]">
                          <img
                            src={album.coverImage}
                            alt={album.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-[#24211e]/80 text-white px-2.5 py-1 rounded-full text-[10px] font-serif">
                            {album.category}
                          </div>
                          <div className="absolute top-3 left-3 bg-[#fffefb]/90 text-[#24211e] px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {album.images?.length || 0} صورة
                          </div>
                        </div>

                        <div className="p-4 text-right space-y-2">
                          <h4 className="font-arabic-editorial font-bold text-base text-[#24211e]">
                            {album.title}
                          </h4>
                          <p className="text-xs text-[#73685d] line-clamp-1">
                            {album.location} • {album.date}
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t border-[#e6e1d6]">
                            <button
                              onClick={() => {
                                setEditingAlbum(album);
                                setAlbumFormData(album);
                                setIsCreatingAlbum(false);
                              }}
                              className="px-3 py-1.5 bg-[#24211e] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>تعديل</span>
                            </button>

                            <button
                              onClick={() => handleDeleteAlbum(album.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                              title="حذف الألبوم"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: IMGBB UPLOADER */}
              {activeTab === 'uploader' && (
                <div className="space-y-6 text-right">
                  <div className="border-b border-[#e6e1d6] pb-4">
                    <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e] flex items-center gap-2">
                      <span>رفع وتخزين الصور الفورية عبر ImgBB API</span>
                      <Upload className="w-5 h-5 text-[#738262]" />
                    </h3>
                    <p className="text-xs text-[#73685d]">
                      ارفع صور عالية الدقة بسهولة مع الحصول على روابط مباشرة للاستخدام في الألبومات
                    </p>
                  </div>

                  <div className="p-8 border-2 border-dashed border-[#c6a585] rounded-3xl bg-[#FAF8F5] text-center space-y-4">
                    <Upload className="w-12 h-12 text-[#c6a585] mx-auto" />
                    <div>
                      <h4 className="font-arabic-editorial text-lg font-bold text-[#24211e]">
                        اختر أو اسحب الصور هنا للرفع
                      </h4>
                      <p className="text-xs text-[#73685d]">
                        يدعم JPG, PNG, WEBP بدقة فائقة
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#24211e] hover:bg-[#3d3833] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4 text-[#c6a585]" />
                        <span>اختيار الصور من جهازك</span>
                      </button>

                      {uploadFiles.length > 0 && (
                        <button
                          onClick={handleStartUpload}
                          disabled={isUploading}
                          className="bg-[#738262] hover:bg-[#5f6c50] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
                        >
                          {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          <span>بدء رفع {uploadFiles.length} صورة الآن</span>
                        </button>
                      )}
                    </div>

                    {isUploading && (
                      <div className="p-3 bg-[#e6e1d6]/50 rounded-xl text-xs font-bold text-[#24211e]">
                        {uploadProgressText}
                      </div>
                    )}
                  </div>

                  {/* Target Album Selection */}
                  <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#e6e1d6] flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-[#24211e]">
                      إرفاق الصور المرفوعة مباشرة إلى ألبوم:
                    </span>
                    <select
                      value={targetAlbumIdForUpload}
                      onChange={(e) => setTargetAlbumIdForUpload(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e]"
                    >
                      <option value="">-- بدون إرفاق تلقائي (نسخ الروابط فقط) --</option>
                      {albums.map((alb) => (
                        <option key={alb.id} value={alb.id}>
                          {alb.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Uploaded Photos Grid */}
                  {uploadedPhotos.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-[#24211e]">الصور التي تم رفعها بنجاح في هذه الجلسة:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {uploadedPhotos.map((photo) => (
                          <div key={photo.id} className="p-2 bg-[#FAF8F5] rounded-xl border border-[#e6e1d6] space-y-1 text-center">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img src={photo.thumbUrl || photo.url} alt={photo.title} className="w-full h-full object-cover" />
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(photo.url);
                                alert('تم نسخ رابط الصورة إلى الحافظة!');
                              }}
                              className="text-[10px] text-[#8c6742] hover:underline block truncate w-full"
                            >
                              نسخ الرابط
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BOOKINGS CRM */}
              {activeTab === 'bookings' && (
                <div className="space-y-6 text-right">
                  <div className="border-b border-[#e6e1d6] pb-4">
                    <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e]">
                      إدارة ومتابعة طلبات الحجز (Bookings CRM)
                    </h3>
                    <p className="text-xs text-[#73685d]">
                      استعراض طلبات الحجز القادمة، تأكيد المواعيد، والتواصل الفوري عبر الواتساب
                    </p>
                  </div>

                  <div className="border border-[#e6e1d6] rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#FAF8F5] text-[#594f45] border-b border-[#e6e1d6]">
                        <tr>
                          <th className="p-3.5">العميل</th>
                          <th className="p-3.5">الخدمة</th>
                          <th className="p-3.5">التاريخ والتوقيت</th>
                          <th className="p-3.5">المكان</th>
                          <th className="p-3.5">الحالة</th>
                          <th className="p-3.5 text-center">التواصل والإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e6e1d6]/60">
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[#73685d]">
                              لا توجد طلبات حجز حالياً.
                            </td>
                          </tr>
                        ) : (
                          bookings.map((b) => (
                            <tr key={b.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                              <td className="p-3.5 font-bold text-[#24211e]">
                                {b.clientName}
                                <span className="block text-[11px] font-normal text-[#73685d] font-mono">
                                  {b.phone}
                                </span>
                              </td>
                              <td className="p-3.5 text-[#594f45]">{b.serviceType}</td>
                              <td className="p-3.5 font-mono text-[11px] text-[#24211e]">
                                {b.date}
                                <span className="block text-[10px] text-[#8c7f73]">{b.timeSlot}</span>
                              </td>
                              <td className="p-3.5 text-[#594f45]">{b.location}</td>
                              <td className="p-3.5">
                                <select
                                  value={b.status}
                                  onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value as any)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                    b.status === 'confirmed'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : b.status === 'pending'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : 'bg-gray-100 text-gray-800 border-gray-300'
                                  }`}
                                >
                                  <option value="pending">بانتظار التأكيد (Pending)</option>
                                  <option value="confirmed">مؤكد (Confirmed)</option>
                                  <option value="completed">مكتمل (Completed)</option>
                                  <option value="cancelled">ملغي (Cancelled)</option>
                                </select>
                              </td>
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <a
                                    href={createBookingInquiryWhatsAppLink(b)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-[#738262]/20 text-[#495b3a] hover:bg-[#738262] hover:text-white rounded-lg transition-colors"
                                    title="مراسلة العميل عبر الواتساب"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </a>
                                  <button
                                    onClick={() => handleDeleteBooking(b.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="حذف الحجز"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: REGISTERED USERS */}
              {activeTab === 'users' && (
                <div className="space-y-6 text-right">
                  <div className="border-b border-[#e6e1d6] pb-4">
                    <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e] flex items-center gap-2">
                      <span>المستخدمون المسجّلون</span>
                      <UserCheck className="w-5 h-5 text-[#c6a585]" />
                    </h3>
                    <p className="mt-1 text-xs text-[#73685d]">
                      الأسماء والبريد الإلكتروني وطريقة التسجيل متاحة للمدير فقط. لا يعرض Firebase كلمات المرور مطلقًا.
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[#e6e1d6]">
                    <table className="w-full min-w-[620px] text-sm">
                      <thead className="bg-[#faf8f5] text-[#5a4f44]">
                        <tr>
                          <th className="p-3.5 text-right">الاسم</th>
                          <th className="p-3.5 text-right">البريد الإلكتروني</th>
                          <th className="p-3.5 text-right">طريقة التسجيل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eee8df]">
                        {registeredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-[#8c7f73]">
                              سيظهر المستخدمون هنا بعد تسجيل دخولهم إلى الموقع.
                            </td>
                          </tr>
                        ) : registeredUsers.map((profile) => (
                          <tr key={profile.id} className="hover:bg-[#faf8f5]/70">
                            <td className="p-3.5 font-semibold text-[#302a25]">{profile.name || 'بدون اسم'}</td>
                            <td className="p-3.5 text-[#6e6359]" dir="ltr">{profile.email || '—'}</td>
                            <td className="p-3.5 text-[#6e6359]">
                              {profile.provider === 'google.com' ? 'Google' : 'البريد الإلكتروني'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: CLIENT CRM & BIRTHDAY ALERTS */}
              {activeTab === 'clients' && (
                <div className="space-y-6 text-right">
                  <div className="flex items-center justify-between border-b border-[#e6e1d6] pb-4">
                    <div>
                      <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e] flex items-center gap-2">
                        <span>سجل العملاء وتنبيهات أعياد الميلاد والهدايا</span>
                        <Gift className="w-5 h-5 text-[#c6a585]" />
                      </h3>
                      <p className="text-xs text-[#73685d]">
                        نظام VIP CRM لتتبع مناسبات العملاء وإرسال تهنئة وخصومات خاصة تلقائياً عبر الواتساب
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddClient(true)}
                      className="bg-[#24211e] hover:bg-[#3d3833] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md"
                    >
                      <Plus className="w-4 h-4 text-[#c6a585]" />
                      <span>إضافة عميل جديد</span>
                    </button>
                  </div>

                  {/* Upcoming Birthday Alerts Banner */}
                  {birthdayAlerts.length > 0 && (
                    <div className="p-5 bg-[#FAF8F5] rounded-2xl border-2 border-[#c6a585] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#24211e] flex items-center gap-2">
                          <span>🎂 تنبيهات أعياد الميلاد القادمة خلال 30 يوماً:</span>
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#c6a585] text-white font-bold">
                          {birthdayAlerts.length} مناسبات
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {birthdayAlerts.map((alert, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-[#e6e1d6] flex items-center justify-between">
                            <div>
                              <span className="font-bold text-xs text-[#24211e] block">{alert.client.name}</span>
                              <span className="text-[11px] text-[#738262] font-semibold">
                                {alert.isToday ? 'اليوم! 🥳' : `بعد ${alert.daysRemaining} يوماً (${alert.formattedDate})`}
                              </span>
                            </div>
                            <a
                              href={createBirthdayWhatsAppLink(alert.client)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[#738262] hover:bg-[#5f6c50] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>إرسال هدية الواتساب</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client Database Table */}
                  <div className="border border-[#e6e1d6] rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#FAF8F5] text-[#594f45] border-b border-[#e6e1d6]">
                        <tr>
                          <th className="p-3.5">اسم العميل</th>
                          <th className="p-3.5">الهاتف والواتساب</th>
                          <th className="p-3.5">تاريخ الميلاد</th>
                          <th className="p-3.5">ذكرى الزواج</th>
                          <th className="p-3.5">الاهتمامات</th>
                          <th className="p-3.5 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e6e1d6]/60">
                        {clients.map((c) => (
                          <tr key={c.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                            <td className="p-3.5 font-bold text-[#24211e]">{c.name}</td>
                            <td className="p-3.5 font-mono text-[#594f45]">{c.whatsapp || c.phone}</td>
                            <td className="p-3.5 font-mono text-[#738262]">{c.birthday || '—'}</td>
                            <td className="p-3.5 font-mono text-[#c6a585]">{c.weddingAnniversary || '—'}</td>
                            <td className="p-3.5 text-[#594f45]">{c.serviceInterests?.join(', ') || 'weddings'}</td>
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={`https://wa.me/${(c.whatsapp || c.phone).replace(/[^0-9+]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-[#738262]/20 text-[#495b3a] rounded-lg"
                                  title="مراسلة"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleDeleteClient(c.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 text-right">
                  <div className="border-b border-[#e6e1d6] pb-4">
                    <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e]">
                      إدارة آراء وتقييمات العملاء
                    </h3>
                    <p className="text-xs text-[#73685d]">
                      الموافقة على الآراء ونشرها على الموقع أو إخفاؤها
                    </p>
                  </div>

                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#e6e1d6] flex items-start justify-between gap-4">
                        <div className="space-y-1 text-right">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#24211e]">{rev.clientName}</span>
                            <div className="flex text-amber-500">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-[#524941] leading-relaxed">"{rev.comment}"</p>
                          <span className="text-[10px] text-[#8c7f73] font-serif block">
                            {rev.service} • {rev.eventDate || rev.createdAt}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleReviewApproval(rev.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                              rev.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {rev.approved ? 'معروض' : 'مخفي'}
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: SETTINGS & BACKUP */}
              {activeTab === 'settings' && (
                <div className="space-y-6 text-right">
                  <div className="border-b border-[#e6e1d6] pb-4">
                    <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e]">
                      إعدادات الأمان والنسخ الاحتياطي
                    </h3>
                    <p className="text-xs text-[#73685d]">
                      إدارة رفع الصور والنسخ الاحتياطي. بيانات دخول المدير تُدار من Firebase Authentication.
                    </p>
                  </div>

                  {settingsSavedSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      تم حفظ الإعدادات بنجاح!
                    </div>
                  )}

                  <div className="rounded-2xl border border-[#d8cfc4] bg-[#fffefb] p-5 sm:p-6">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-[#24211e]">
                          <Type className="h-4 w-4 text-[#738262]" />
                          خطوط الموقع
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-[#73685d]">
                          اختر خط النصوص وخط العناوين. يتم تحميل الخط المختار فقط للحفاظ على سرعة الموقع.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-[#594f45]">خط النصوص والمحتوى</span>
                        <select
                          value={tempSettings.bodyFontKey}
                          onChange={(event) => setTempSettings({ ...tempSettings, bodyFontKey: event.target.value })}
                          className="w-full rounded-xl border border-[#e6e1d6] bg-white px-3 py-2.5 text-xs text-[#24211e] outline-none focus:border-[#738262]"
                        >
                          {BODY_FONT_OPTIONS.map((font) => (
                            <option key={font.key} value={font.key}>{font.labelAr}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-[#594f45]">خط العناوين التحريرية</span>
                        <select
                          value={tempSettings.headingFontKey}
                          onChange={(event) => setTempSettings({ ...tempSettings, headingFontKey: event.target.value })}
                          className="w-full rounded-xl border border-[#e6e1d6] bg-white px-3 py-2.5 text-xs text-[#24211e] outline-none focus:border-[#738262]"
                        >
                          {HEADING_FONT_OPTIONS.map((font) => (
                            <option key={font.key} value={font.key}>{font.labelAr}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-[#f4f0e9] p-4 sm:grid-cols-2">
                      <p
                        className="rounded-xl bg-white px-4 py-3 text-sm leading-7 text-[#4d443b]"
                        style={{ fontFamily: getBodyFontOption(tempSettings.bodyFontKey).stack }}
                      >
                        نص تجريبي لعرض وضوح خط الموقع المختار.
                      </p>
                      <p
                        className="rounded-xl bg-white px-4 py-3 text-xl font-bold leading-8 text-[#24211e]"
                        style={{ fontFamily: getHeadingFontOption(tempSettings.headingFontKey).stack }}
                      >
                        لحظات تستحق أن تبقى
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="mt-4 w-full rounded-xl bg-[#738262] px-5 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#5f6c50] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                    >
                      {isSavingSettings ? 'جاري حفظ الخطوط في Firebase...' : 'حفظ الخطوط وتطبيقها على الموقع'}
                    </button>
                  </div>

                  <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6] space-y-4">
                    <h4 className="font-bold text-sm text-[#24211e]">حماية لوحة التحكم</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#594f45] mb-1">البريد الإلكتروني للادمن</label>
                        <input
                          type="email"
                          readOnly
                          value={import.meta.env.VITE_ADMIN_EMAIL || tempSettings.adminUsername}
                          className="w-full px-3 py-2 rounded-xl bg-[#f2eee8] border border-[#e6e1d6] text-xs text-[#24211e]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#594f45] mb-1">UID المدير المعتمد</label>
                        <input
                          type="text"
                          readOnly
                          value={import.meta.env.VITE_ADMIN_UID || ''}
                          className="w-full px-3 py-2 rounded-xl bg-[#f2eee8] border border-[#e6e1d6] text-xs text-[#24211e] font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-[#594f45] mb-1">مفتاح ImgBB API Key لرفع الصور</label>
                      <input
                        type="text"
                        value={tempSettings.imgbbApiKey}
                        onChange={(e) => setTempSettings({ ...tempSettings, imgbbApiKey: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#e6e1d6] text-xs text-[#24211e] font-mono"
                      />
                    </div>

                    <div className="pt-3">
                      <button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="px-6 py-2.5 bg-[#24211e] hover:bg-[#3d3833] disabled:cursor-wait disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-md"
                      >
                        {isSavingSettings ? 'جاري الحفظ في Firebase...' : 'حفظ الإعدادات'}
                      </button>
                    </div>
                  </div>

                  {/* Backup & Restore */}
                  <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#e6e1d6] space-y-4">
                    <h4 className="font-bold text-sm text-[#24211e]">النسخ الاحتياطي والاستعادة الكاملة (JSON)</h4>
                    <p className="text-xs text-[#73685d]">
                      يمكنك تحميل نسخة احتياطية تحتوي على كافة الألبومات، التصنيفات، نصوص الموقع، والعملاء، أو استعادتها في أي وقت.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        onClick={handleDownloadBackup}
                        className="px-5 py-2.5 bg-[#738262] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل نسخة احتياطية (Download JSON Backup)</span>
                      </button>

                      <label className="px-5 py-2.5 bg-[#e6e1d6] hover:bg-[#d8cfc4] text-[#24211e] rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm">
                        <Upload className="w-4 h-4 text-[#8c6742]" />
                        <span>استعادة نسخة احتياطية (Restore from JSON)</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportBackup}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
