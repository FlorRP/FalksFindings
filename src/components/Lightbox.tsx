import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from '../lib/supabase';

type Props = {
  images: ProductImage[];
  initialIndex: number;
  onClose: () => void;
};

export default function Lightbox({ images, initialIndex, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
  const currentImage = sortedImages[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onClose]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStart - touchEnd > 75) {
      goToNext();
    }
    if (touchEnd - touchStart > 75) {
      goToPrevious();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.9)' }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative max-w-4xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={currentImage.image_url}
          alt="Fullscreen"
          className="max-w-full max-h-full object-contain"
          style={{ animation: 'fadeIn 0.3s ease-in-out' }}
        />

        {/* Navigation buttons */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all hover:bg-black/30"
              style={{ color: '#D4A017' }}
              type="button"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all hover:bg-black/30"
              style={{ color: '#D4A017' }}
              type="button"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-black/30"
          style={{ color: '#D4A017' }}
          type="button"
        >
          <X size={32} />
        </button>

        {/* Image counter */}
        {sortedImages.length > 1 && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded text-sm font-semibold"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#D4A017' }}
          >
            {currentIndex + 1} of {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 mt-4 pb-4 px-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
          {sortedImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className="flex-shrink-0 w-16 h-16 rounded border-2 transition-all"
              style={{
                borderColor: idx === currentIndex ? '#D4A017' : 'rgba(212,160,23,0.3)',
                cursor: 'pointer',
              }}
              type="button"
            >
              <img
                src={img.image_url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
