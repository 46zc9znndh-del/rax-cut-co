"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminPhotoField, FieldLabel } from "@/components/admin/admin-shell";

type ProductPhotosEditorProps = {
  photos: string[];
  library: string[];
  onChange: (photos: string[]) => void;
  onUploaded: (url: string) => void;
};

function swapItems<T>(items: T[], indexA: number, indexB: number) {
  const next = [...items];
  [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
  return next;
}

export function ProductPhotosEditor({
  photos,
  library,
  onChange,
  onUploaded,
}: ProductPhotosEditorProps) {
  function addPhoto() {
    const nextImage =
      library.find((image) => !photos.includes(image)) ?? library[0] ?? photos[0];
    if (!nextImage) return;
    onChange([...photos, nextImage]);
  }

  function updatePhoto(index: number, url: string) {
    const next = [...photos];
    next[index] = url;
    onChange(next);
  }

  function removePhoto(index: number) {
    if (photos.length <= 1) return;
    onChange(photos.filter((_, i) => i !== index));
  }

  function movePhoto(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    onChange(swapItems(photos, index, target));
  }

  function setAsMain(index: number) {
    if (index === 0) return;
    const next = [...photos];
    const [photo] = next.splice(index, 1);
    next.unshift(photo);
    onChange(next);
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <FieldLabel>Photos</FieldLabel>
        <Button type="button" variant="dark" size="sm" onClick={addPhoto}>
          + Add
        </Button>
      </div>

      <div className="divide-y divide-white/10 rounded-md border border-white/10">
        {photos.map((photo, index) => {
          const isMain = index === 0;

          return (
            <div
              key={`${photo}-${index}`}
              className={cn("flex flex-wrap items-center gap-2 p-2", isMain && "bg-rax-ember/5")}
            >
              <span
                className={cn(
                  "w-14 shrink-0 text-center font-display text-[10px] tracking-[0.12em] uppercase",
                  isMain ? "text-rax-ember" : "text-white/50"
                )}
              >
                {isMain ? "Main" : `#${index + 1}`}
              </span>

              <div className="min-w-0 flex-1">
                <AdminPhotoField
                  value={photo}
                  images={library}
                  isMain={isMain}
                  onChange={(value) => updatePhoto(index, value)}
                  onUploaded={onUploaded}
                  canDelete={photos.length > 1}
                  onDelete={() => removePhoto(index)}
                />
              </div>

              <div className="flex shrink-0 gap-1">
                {!isMain ? (
                  <Button
                    type="button"
                    variant="dark"
                    size="sm"
                    className="px-2 text-[10px]"
                    onClick={() => setAsMain(index)}
                  >
                    Main
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="dark"
                  size="sm"
                  className="px-2"
                  disabled={index === 0}
                  onClick={() => movePhoto(index, -1)}
                  title="Move up"
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="dark"
                  size="sm"
                  className="px-2"
                  disabled={index === photos.length - 1}
                  onClick={() => movePhoto(index, 1)}
                  title="Move down"
                >
                  ↓
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
