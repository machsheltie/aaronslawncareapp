import { useState, useRef, useEffect } from 'react'
import { usePhotos, useUploadPhoto, useDeletePhoto, getPhotoUrl, PHOTO_TYPES } from '@/hooks/usePhotos'
import type { PhotoType } from '@/hooks/usePhotos'

export default function JobPhotos({ jobId }: { jobId: string }) {
  const { data: photos, isLoading } = usePhotos(jobId)
  const uploadPhoto = useUploadPhoto()
  const deletePhoto = useDeletePhoto()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState<PhotoType>('before')
  const [uploading, setUploading] = useState(false)
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const [lightbox, setLightbox] = useState<string | null>(null)

  // Load signed URLs for all photos
  useEffect(() => {
    if (!photos) return
    let cancelled = false
    const loadUrls = async () => {
      const urls: Record<string, string> = {}
      for (const photo of photos) {
        if (!photoUrls[photo.id]) {
          try {
            urls[photo.id] = await getPhotoUrl(photo.storage_path)
          } catch {
            // skip failed URLs
          }
        }
      }
      if (!cancelled && Object.keys(urls).length > 0) {
        setPhotoUrls(prev => ({ ...prev, ...urls }))
      }
    }
    loadUrls()
    return () => { cancelled = true }
  }, [photos]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await uploadPhoto.mutateAsync({
          jobId,
          file,
          photoType: selectedType,
        })
      }
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = (id: string, storagePath: string) => {
    if (confirm('Delete this photo?')) {
      deletePhoto.mutate({ id, jobId, storagePath })
    }
  }

  const beforePhotos = photos?.filter(p => p.photo_type === 'before') ?? []
  const afterPhotos = photos?.filter(p => p.photo_type === 'after') ?? []
  const progressPhotos = photos?.filter(p => p.photo_type === 'progress') ?? []

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Photos</h3>

      {/* Upload controls */}
      <div className="flex items-center gap-2 mb-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as PhotoType)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          {PHOTO_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-brand-green text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Add Photo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-green" />
        </div>
      )}

      {photos && photos.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No photos yet. Tap "Add Photo" to capture before/after shots.</p>
      )}

      {/* Before / After side-by-side */}
      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Before</p>
              <div className="space-y-2">
                {beforePhotos.map(p => (
                  <PhotoThumbnail
                    key={p.id}
                    url={photoUrls[p.id]}
                    onView={() => setLightbox(photoUrls[p.id])}
                    onDelete={() => handleDelete(p.id, p.storage_path)}
                  />
                ))}
                {beforePhotos.length === 0 && (
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                    No before photos
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">After</p>
              <div className="space-y-2">
                {afterPhotos.map(p => (
                  <PhotoThumbnail
                    key={p.id}
                    url={photoUrls[p.id]}
                    onView={() => setLightbox(photoUrls[p.id])}
                    onDelete={() => handleDelete(p.id, p.storage_path)}
                  />
                ))}
                {afterPhotos.length === 0 && (
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                    No after photos
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress photos */}
      {progressPhotos.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Progress</p>
          <div className="grid grid-cols-3 gap-2">
            {progressPhotos.map(p => (
              <PhotoThumbnail
                key={p.id}
                url={photoUrls[p.id]}
                onView={() => setLightbox(photoUrls[p.id])}
                onDelete={() => handleDelete(p.id, p.storage_path)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  )
}

function PhotoThumbnail({
  url,
  onView,
  onDelete,
}: {
  url?: string
  onView: () => void
  onDelete: () => void
}) {
  if (!url) {
    return (
      <div className="aspect-[4/3] bg-gray-100 rounded-lg animate-pulse" />
    )
  }

  return (
    <div className="relative group">
      <img
        src={url}
        alt="Job photo"
        className="aspect-[4/3] w-full object-cover rounded-lg cursor-pointer"
        onClick={onView}
      />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        &times;
      </button>
    </div>
  )
}
