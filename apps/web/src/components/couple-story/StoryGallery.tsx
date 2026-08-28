import { useScrollScene } from "@/hooks/useScrollScene";

/**
 * The photo gallery, laid out and animated according to the theme.
 *
 * A couple's photographs are the best thing on their site, so this is the
 * biggest lever a template has — bigger than palette or type. Rather than
 * every theme showing the same masonry, each picks a treatment whose layout
 * and motion match its character.
 *
 * Every treatment degrades sensibly when there are only a few photos: a
 * horizontal marquee built from two pictures is worse than a plain grid, so
 * those fall back rather than being shown half-empty.
 */

export type GalleryStyle = "marquee" | "stack" | "drift" | "mosaic" | "alternating";

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string | null;
}

interface StoryGalleryProps {
  images: GalleryImage[];
  style: GalleryStyle;
  /** Theme classes: rounding on frames, and the hover transform. */
  imageClass: string;
  hoverClass: string;
  /** The theme's reveal animation, used by treatments without a scene. */
  revealClass?: string;
}

/** Below this a treatment cannot read as intended and falls back. */
const MIN_FOR: Record<GalleryStyle, number> = {
  marquee: 4,
  stack: 2,
  drift: 5,
  mosaic: 4,
  alternating: 2,
};

const Frame = ({
  image,
  imageClass,
  hoverClass,
  className = "",
}: {
  image: GalleryImage;
  imageClass: string;
  hoverClass: string;
  className?: string;
}) => (
  <figure className={`relative group overflow-hidden ${imageClass} ${className}`}>
    <img
      src={image.url}
      alt={image.caption || "Wedding photograph"}
      loading="lazy"
      className={`w-full h-full object-cover ${hoverClass}`}
    />
    {image.caption && (
      <figcaption className="absolute inset-x-0 bottom-0 p-4 md:p-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-sm md:text-base drop-shadow">{image.caption}</p>
      </figcaption>
    )}
  </figure>
);

/** Photographs travel sideways while the page scrolls down. */
const Marquee = ({ images, imageClass, hoverClass }: Omit<StoryGalleryProps, "style">) => {
  const ref = useScrollScene<HTMLDivElement>();
  return (
    <div ref={ref} className="scene gallery-marquee">
      <div className="gallery-marquee-stage">
        <div className="gallery-marquee-track">
          {images.map((image) => (
            <Frame
              key={image.id}
              image={image}
              imageClass={imageClass}
              hoverClass={hoverClass}
              className="gallery-marquee-item"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/** One photograph at a time, uncropping as it crosses the screen. */
const StackItem = ({
  image,
  imageClass,
  hoverClass,
}: {
  image: GalleryImage;
  imageClass: string;
  hoverClass: string;
}) => {
  // Its own scene, so the crop follows this photograph rather than the page.
  const ref = useScrollScene<HTMLDivElement>();
  return (
    <div ref={ref} className={`scene gallery-stack-item ${imageClass}`}>
      <img
        src={image.url}
        alt={image.caption || "Wedding photograph"}
        loading="lazy"
        className={hoverClass}
      />
      {image.caption && (
        <p className="mt-4 text-sm opacity-70 text-center">{image.caption}</p>
      )}
    </div>
  );
};

/** Columns moving at different rates, so the wall has depth. */
const Drift = ({ images, imageClass, hoverClass }: Omit<StoryGalleryProps, "style">) => {
  const ref = useScrollScene<HTMLDivElement>();
  const columns: GalleryImage[][] = [[], [], []];
  images.forEach((img, i) => columns[i % 3].push(img));

  return (
    <div ref={ref} className="scene gallery-drift">
      {columns.map((col, i) => (
        <div key={i} className="gallery-drift-col">
          {col.map((image) => (
            <Frame key={image.id} image={image} imageClass={imageClass} hoverClass={hoverClass} />
          ))}
        </div>
      ))}
    </div>
  );
};

/** Frames offset left and right down the page as the reader passes. */
const Alternating = ({ images, imageClass, hoverClass }: Omit<StoryGalleryProps, "style">) => (
  <div className="gallery-alt">
    {images.map((image) => (
      <AlternatingItem
        key={image.id}
        image={image}
        imageClass={imageClass}
        hoverClass={hoverClass}
      />
    ))}
  </div>
);

const AlternatingItem = ({
  image,
  imageClass,
  hoverClass,
}: {
  image: GalleryImage;
  imageClass: string;
  hoverClass: string;
}) => {
  const ref = useScrollScene<HTMLDivElement>();
  return (
    <div ref={ref} className="scene gallery-alt-item">
      <Frame image={image} imageClass={imageClass} hoverClass={hoverClass} />
    </div>
  );
};

const StoryGallery = ({ images, style, imageClass, hoverClass, revealClass = "" }: StoryGalleryProps) => {
  if (images.length === 0) return null;

  // Not enough photographs for the intended treatment: a marquee of two, or
  // a three-column drift of four, reads as a mistake rather than a choice.
  const effective: GalleryStyle =
    images.length < MIN_FOR[style] ? "mosaic" : style;

  if (effective === "marquee") {
    return <Marquee images={images} imageClass={imageClass} hoverClass={hoverClass} />;
  }

  if (effective === "stack") {
    return (
      <div className="gallery-stack max-w-3xl mx-auto">
        {images.map((image) => (
          <StackItem key={image.id} image={image} imageClass={imageClass} hoverClass={hoverClass} />
        ))}
      </div>
    );
  }

  if (effective === "drift") {
    return <Drift images={images} imageClass={imageClass} hoverClass={hoverClass} />;
  }

  if (effective === "alternating") {
    return <Alternating images={images} imageClass={imageClass} hoverClass={hoverClass} />;
  }

  return (
    <div className="gallery-mosaic max-w-7xl mx-auto">
      {images.map((image, i) => (
        <div
          key={image.id}
          data-reveal
          // Staggered so tiles arrive in sequence rather than together.
          // Capped so a large gallery does not trail for seconds.
          data-reveal-delay={Math.min(i, 7) * 70}
          className={revealClass}
        >
          <Frame image={image} imageClass={imageClass} hoverClass={hoverClass} />
        </div>
      ))}
    </div>
  );
};

export default StoryGallery;
