import { supabase } from "@/lib/supabase"; // adjust to your existing client path
import { v4 as uuidv4 } from "uuid";

export const BUCKET = "product-images";
export const MAX_IMAGES = 5;

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
  storage_path?: string | null;
}

const pathFromUrl = (url: string): string | null => {
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.substring(i + marker.length);
};

export async function fetchProductImages(productId: string) {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProductImage[];
}

export async function uploadProductImage(productId: string, file: File, displayOrder: number) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${productId}/${uuidv4()}.${ext}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: pub.publicUrl,
      display_order: displayOrder,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ProductImage;
}

export async function deleteProductImage(image: ProductImage) {
  const path = pathFromUrl(image.image_url);
  if (path) {
    await supabase.storage.from(BUCKET).remove([path]);
  }
  const { error } = await supabase.from("product_images").delete().eq("id", image.id);
  if (error) throw error;
}

export async function reorderProductImages(images: ProductImage[]) {
  // Update each row's display_order based on array position
  const updates = images.map((img, idx) =>
    supabase.from("product_images").update({ display_order: idx }).eq("id", img.id)
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
