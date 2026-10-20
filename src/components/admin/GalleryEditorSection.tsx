import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderOpen,
  Save,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useTournament } from '../../context/TournamentContext';
import { GalleryPhoto } from '../../types';

const GALLERY_CATEGORIES: Array<{
  id: GalleryPhoto['category'];
  label: string;
  defaultTitle: string;
  defaultDate: string;
  defaultCaption: string;
}> = [
  {
    id: 'WORKSHOP',
    label: 'Workshop',
    defaultTitle: 'Workshop - Debate Unlocked',
    defaultDate: '03 September',
    defaultCaption:
      'Faculty Convenor and advisors conducting the pre-tournament workshop on Asian Parliamentary debate structure.',
  },
  {
    id: 'KIT_DISTRIBUTION',
    label: 'Kit Distribution',
    defaultTitle: 'Official Delegate Kit Distribution',
    defaultDate: '25 October',
    defaultCaption:
      'Participating CSE debaters receiving their official tournament badges, folders, and delegate kits.',
  },
  {
    id: 'DEBATE_SESSIONS',
    label: 'Debate Sessions',
    defaultTitle: 'Parliamentary Debate Sessions & Rebuttals',
    defaultDate: '26 October',
    defaultCaption:
      'Fierce debate sessions, constructive speeches, and sharp Point of Information (POI) exchanges on stage.',
  },
  {
    id: 'JUDGES',
    label: 'Judges & Adjudication',
    defaultTitle: 'Adjudication Core Evaluation Panel',
    defaultDate: 'October 2026',
    defaultCaption:
      'Distinguished faculty adjudicators deliberating on speaker marks and motion interpretations.',
  },
  {
    id: 'FINAL_EVENT',
    label: 'Final Event',
    defaultTitle: 'Grand Final Showdown on Stage',
    defaultDate: 'Upcoming',
    defaultCaption:
      'Grand final clash in the central auditorium packed with CSE faculty and students.',
  },
  {
    id: 'AWARDS',
    label: 'Award Ceremony',
    defaultTitle: 'Championship Trophy & Award Ceremony',
    defaultDate: 'Upcoming',
    defaultCaption:
      'Official conferral of Champion, Runners-Up, Emerging Team, and Best Tournament Debater awards.',
  },
];

export const GalleryEditorSection: React.FC = () => {
  const {
    gallery,
    uploadGalleryPhotos,
    updateGallerySegment,
    removeGalleryPhoto,
  } = useTournament();

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [previewIdx, setPreviewIdx] = useState<Record<string, number>>({});
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({});
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local editable text states keyed by category
  const [draftEdits, setDraftEdits] = useState<
    Record<string, { title: string; date: string; caption: string }>
  >({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const segments: GalleryPhoto[] = GALLERY_CATEGORIES.map((cat) => {
    const existing = gallery.find((g) => g.category === cat.id);
    if (existing) return existing;
    return {
      id: `g-${cat.id.toLowerCase()}`,
      title: cat.defaultTitle,
      category: cat.id,
      imageUrl: '',
      images: [],
      caption: cat.defaultCaption,
      date: cat.defaultDate,
    };
  });

  const visibleSegments =
    selectedFilter === 'ALL'
      ? segments
      : segments.filter((s) => s.category === selectedFilter);

  const getValidImages = (seg: GalleryPhoto): string[] => {
    const raw =
      Array.isArray(seg.images) && seg.images.length > 0
        ? seg.images
        : seg.imageUrl
        ? [seg.imageUrl]
        : [];
    return raw.filter(
      (u) =>
        typeof u === 'string' &&
        u.trim().length > 0 &&
        !u.includes('images.unsplash.com') &&
        !brokenUrls[u]
    );
  };

  const readFileAsDataUrl = (file: File): Promise<{ fileName: string; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const isAllowed =
        /\.(png|jpe?g)$/i.test(file.name) ||
        ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type.toLowerCase());

      if (!isAllowed) {
        reject(new Error(`"${file.name}" is not a PNG, JPG, or JPEG image.`));
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = String(ev.target?.result || '');
        if (!result) {
          reject(new Error(`Could not read "${file.name}"`));
          return;
        }
        resolve({ fileName: file.name, dataUrl: result });
      };
      reader.onerror = () => reject(new Error(`Failed to read "${file.name}"`));
      reader.readAsDataURL(file);
    });
  };

  const handleMultiFileUpload = async (
    category: GalleryPhoto['category'],
    categoryLabel: string,
    fileList: FileList | null
  ) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);
    setUploadingCategory(category);

    try {
      const filesArray = Array.from(fileList);
      const encodedFiles = await Promise.all(filesArray.map(readFileAsDataUrl));
      const savedUrls = await uploadGalleryPhotos(category, encodedFiles);
      showToast(
        `Uploaded ${savedUrls.length} picture(s) to public/gallery for "${categoryLabel}"!`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to upload pictures.');
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleSaveTextDetails = async (seg: GalleryPhoto, categoryLabel: string) => {
    const draft = draftEdits[seg.category];
    const nextTitle = draft ? draft.title.trim() : seg.title;
    const nextDate = draft ? draft.date.trim() : seg.date;
    const nextCaption = draft ? draft.caption.trim() : seg.caption;

    await updateGallerySegment(seg.category, {
      title: nextTitle || seg.title,
      date: nextDate || seg.date,
      caption: nextCaption || seg.caption,
    });
    showToast(`Saved "${categoryLabel}" details!`);
  };

  const handleDeleteSinglePhoto = async (
    category: GalleryPhoto['category'],
    categoryLabel: string,
    imageUrl: string
  ) => {
    await removeGalleryPhoto(category, imageUrl);
    showToast(`Removed picture from "${categoryLabel}".`);
  };

  const handleClearAllSegmentPhotos = async (
    seg: GalleryPhoto,
    categoryLabel: string
  ) => {
    const imgs = getValidImages(seg);
    for (const url of imgs) {
      await removeGalleryPhoto(seg.category, url);
    }
    await updateGallerySegment(seg.category, { images: [], imageUrl: '' });
    showToast(`Cleared all pictures for "${categoryLabel}" (now showing Upload Soon banner).`);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <GlassCard className="p-6" glow>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>ADMIN-ONLY GALLERY STUDIO</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Official Gallery Editor & Multi-Photo Uploader
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Manage all 6 Gallery segments (<strong className="text-cyan-400">Workshop</strong>,{' '}
              <strong className="text-cyan-400">Kit Distribution</strong>,{' '}
              <strong className="text-cyan-400">Debate Sessions</strong>,{' '}
              <strong className="text-cyan-400">Judges &amp; Adjudication</strong>,{' '}
              <strong className="text-cyan-400">Final Event</strong>,{' '}
              <strong className="text-cyan-400">Award Ceremony</strong>). Uploaded{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono">.png</code>,{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono">.jpg</code>, and{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono">.jpeg</code>{' '}
              pictures are automatically saved inside{' '}
              <code className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono">
                public/gallery/
              </code>
              . Any segment without uploaded pictures automatically displays the{' '}
              <strong className="text-amber-300">UPLOAD SOON</strong> banner.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#071532] border border-cyan-500/30 text-xs font-mono text-cyan-300 shrink-0">
            <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Auto-Save Path: public/gallery/</span>
          </div>
        </div>

        {/* Category Option Filter Bar (matches public Gallery options) */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedFilter === 'ALL'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_4px_15px_rgba(6,182,212,0.35)]'
                : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            All Moments (6 Segments)
          </button>

          {GALLERY_CATEGORIES.map((cat) => {
            const seg = segments.find((s) => s.category === cat.id);
            const count = seg ? getValidImages(seg).length : 0;
            const isActive = selectedFilter === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_4px_15px_rgba(6,182,212,0.35)]'
                    : 'bg-slate-900/70 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    count > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  }`}
                >
                  {count > 0 ? `${count} Pic${count > 1 ? 's' : ''}` : 'Upload Soon'}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Toast / Error Alerts */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-300 text-xs font-mono font-bold flex items-center justify-between gap-2.5 shadow-lg">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-200 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Segment Editor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleSegments.map((seg) => {
          const catMeta =
            GALLERY_CATEGORIES.find((c) => c.id === seg.category) ||
            GALLERY_CATEGORIES[0];
          const validImgs = getValidImages(seg);
          const total = validImgs.length;
          const currIdx = total > 0 ? (previewIdx[seg.category] || 0) % total : 0;
          const activeImg = total > 0 ? validImgs[currIdx] : '';

          const draft = draftEdits[seg.category] || {
            title: seg.title,
            date: seg.date,
            caption: seg.caption,
          };

          const updateDraft = (
            field: 'title' | 'date' | 'caption',
            value: string
          ) => {
            setDraftEdits((prev) => ({
              ...prev,
              [seg.category]: {
                title: prev[seg.category]?.title ?? seg.title,
                date: prev[seg.category]?.date ?? seg.date,
                caption: prev[seg.category]?.caption ?? seg.caption,
                [field]: value,
              },
            }));
          };

          return (
            <GlassCard key={seg.category} className="p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
                      GALLERY SEGMENT
                    </span>
                    <h4 className="font-display text-lg font-extrabold text-white">
                      {catMeta.label}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {total > 0 ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold">
                        {total} {total === 1 ? 'Picture' : 'Pictures'} Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Upload Soon Banner Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Banner Preview with Left/Right Arrows or Upload Soon Banner */}
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#06132d] border border-sky-500/30">
                  {total > 0 && activeImg ? (
                    <>
                      <img
                        src={activeImg}
                        alt={`${catMeta.label} preview`}
                        onError={() =>
                          setBrokenUrls((prev) => ({ ...prev, [activeImg]: true }))
                        }
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#051026]/85 border border-cyan-400/40 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                        {catMeta.label}
                      </div>

                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#051026]/85 border border-sky-400/40 text-[11px] font-mono font-bold text-white">
                        {currIdx + 1} / {total}
                      </div>

                      {/* Left & Right Arrow Buttons */}
                      {total > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewIdx((prev) => ({
                                ...prev,
                                [seg.category]: (currIdx - 1 + total) % total,
                              }))
                            }
                            aria-label="Previous picture"
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#051026]/90 hover:bg-cyan-500 text-white border border-cyan-400/60 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                          >
                            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewIdx((prev) => ({
                                ...prev,
                                [seg.category]: (currIdx + 1) % total,
                              }))
                            }
                            aria-label="Next picture"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#051026]/90 hover:bg-cyan-500 text-white border border-cyan-400/60 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                          >
                            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                          </button>
                        </>
                      )}

                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[#051026]/85 backdrop-blur-md border border-slate-700/80">
                        <span className="text-[11px] font-mono text-slate-300 truncate">
                          {activeImg}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSinglePhoto(
                              seg.category,
                              catMeta.label,
                              activeImg
                            )
                          }
                          className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove Pic
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0b1d42] via-[#07132c] to-[#040a18]">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center mb-2.5">
                        <ImageIcon className="w-6 h-6 text-cyan-300" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-extrabold uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        UPLOAD SOON
                      </span>
                      <p className="text-xs font-mono text-slate-300 mt-2">
                        No pictures uploaded yet for <strong className="text-cyan-300">{catMeta.label}</strong>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Multiple Pictures (.png, .jpg, .jpeg) */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-mono font-bold text-cyan-300 uppercase">
                        Upload Multiple Pictures (.png, .jpg, .jpeg)
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">
                        Select 1 or multiple images — auto-saves to <code className="text-cyan-300">public/gallery/</code>
                      </span>
                    </div>

                    {total > 0 && (
                      <button
                        type="button"
                        onClick={() => handleClearAllSegmentPhotos(seg, catMeta.label)}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[11px] font-mono font-bold cursor-pointer self-start sm:self-auto"
                      >
                        Clear All ({total})
                      </button>
                    )}
                  </div>

                  <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-dashed border-cyan-400/60 text-cyan-200 font-mono text-xs font-bold cursor-pointer transition-all">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>
                      {uploadingCategory === seg.category
                        ? 'Uploading & Saving to public/gallery...'
                        : `Choose .PNG / .JPG / .JPEG Pictures for ${catMeta.label}`}
                    </span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                      multiple
                      disabled={uploadingCategory === seg.category}
                      onChange={(e) => {
                        handleMultiFileUpload(
                          seg.category,
                          catMeta.label,
                          e.target.files
                        );
                        e.currentTarget.value = '';
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Thumbnail Strip of Uploaded Pictures */}
                  {total > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
                      {validImgs.map((imgUrl, idx) => (
                        <div
                          key={imgUrl + idx}
                          className={`relative group/thumb w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                            idx === currIdx
                              ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                              : 'border-slate-700 opacity-75 hover:opacity-100'
                          }`}
                          onClick={() =>
                            setPreviewIdx((prev) => ({
                              ...prev,
                              [seg.category]: idx,
                            }))
                          }
                        >
                          <img
                            src={imgUrl}
                            alt={`${catMeta.label} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSinglePhoto(
                                seg.category,
                                catMeta.label,
                                imgUrl
                              );
                            }}
                            title="Delete picture"
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Editable Segment Title, Date & Caption */}
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                        Card Title
                      </label>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => updateDraft('title', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                        Date / Stage
                      </label>
                      <input
                        type="text"
                        value={draft.date}
                        onChange={(e) => updateDraft('date', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
                      Description / Caption
                    </label>
                    <textarea
                      rows={2}
                      value={draft.caption}
                      onChange={(e) => updateDraft('caption', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveTextDetails(seg, catMeta.label)}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save {catMeta.label} Details</span>
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
