import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchProductImages, ProductImage } from "@/lib/productImages";

export function useProductImages(productId: string | undefined) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      setImages(await fetchProductImages(productId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    refresh();

    const channel = supabase
      .channel(`product_images:${productId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_images", filter: `product_id=eq.${productId}` },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return { images, setImages, loading, refresh };
}
