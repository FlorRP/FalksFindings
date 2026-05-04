import { useRef, useState } from "react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Upload, GripVertical } from "lucide-react";
import { useProductImages } from "@/hooks/useProductImages";
import { uploadProductImage, deleteProductImage, reorderProductImages, ProductImage, MAX_IMAGES } from "@/lib/productImages";

interface Props {
  productId: string;
}

const GOLD = "#D4A017";
const FOREST = "#2C4A2E";

function SortableThumb({ image, isCover, onRemove }: { image: ProductImage; isCover: boolean; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="relative group w-24 h-24 rounded-md overflow-hidden border-2"
         {...attributes}>
      <img src={image.image_url} alt="" className="w-full h-full object-cover" />
      {isCover && (
        <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-semibold rounded"
              style={{ background: GOLD, color: FOREST }}>COVER</span>
      )}
      <button {...listeners} type="button"
              className="absolute top-1 right-1 p-1 bg-black/60 rounded text-white cursor-grab active:cursor-grabbing">
        <GripVertical size={12} />
      </button>
      <button type="button" onClick={onRemove}
              className="absolute bottom-1 right-1 p-1 bg-black/60 hover:bg-red-600 rounded text-white">
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export default function ProductImagesManager({ productId }: Props) {
  const { images, setImages, refresh } = useProductImages(productId);
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      alert(`Maximum ${MAX_IMAGES} images per product.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setBusy(true);
    try {
      let order = images.length;
      for (const file of toUpload) {
        await uploadProductImage(productId, file, order++);
      }
      await refresh();
    } catch (e) {
      console.error(e);
      alert("Upload failed: " + (e as Error).message);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const handleRemove = async (img: ProductImage) => {
    if (!confirm("Remove this image?")) return;
    try {
      await deleteProductImage(img);
      await refresh();
    } catch (e) {
      alert("Delete failed: " + (e as Error).message);
    }
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = images.findIndex((i) => i.id === active.id);
    const newIdx = images.findIndex((i) => i.id === over.id);
    const next = arrayMove(images, oldIdx, newIdx);
    setImages(next); // optimistic
    try {
      await reorderProductImages(next);
    } catch {
      await refresh();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium" style={{ color: FOREST }}>
          Product Images ({images.length}/{MAX_IMAGES})
        </label>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy || images.length >= MAX_IMAGES}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50"
          style={{ background: GOLD, color: FOREST }}
        >
          <Upload size={14} /> {busy ? "Uploading..." : "Add Images"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed rounded-md p-6 text-center text-sm text-gray-500"
             style={{ borderColor: GOLD }}>
          No images yet. The first uploaded image becomes the cover.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-2 flex-wrap">
              {images.map((img, idx) => (
                <SortableThumb
                  key={img.id}
                  image={img}
                  isCover={idx === 0}
                  onRemove={() => handleRemove(img)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <p className="text-xs text-gray-500">Drag the handle to reorder. First image is the cover.</p>
    </div>
  );
}
