import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { storyService } from "@/services/api/storyService";

/**
 * A photo field backed by an upload.
 *
 * Every photo on a wedding site used to be entered as a URL, which assumes
 * the couple has their pictures hosted somewhere already — almost nobody
 * does. Shared by the section forms and the list editors so there is one
 * upload behaviour rather than two that drift.
 */
const ImageField = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) => {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt={label || ""}
            className="h-36 w-full rounded-md object-cover border"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
            aria-label="Remove photo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <label
        className={`flex items-center justify-center gap-2 rounded-md border border-dashed px-3 py-3 text-sm cursor-pointer transition-colors ${
          isUploading ? "text-muted-foreground" : "text-muted-foreground hover:bg-muted/50"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {value ? "Replace photo" : "Choose a photo"}
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setIsUploading(true);
            try {
              const { url } = await storyService.uploadWishlistImage(file);
              onChange(url);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setIsUploading(false);
              // Clearing lets the same file be chosen again after a failure,
              // which the browser otherwise ignores as "no change".
              e.target.value = "";
            }
          }}
        />
      </label>
    </div>
  );
};

export default ImageField;
