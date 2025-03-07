
import { StoryImage } from "./StoryEditor";

interface ImageGalleryProps {
  images: StoryImage[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <h3 className="text-xl font-medium mb-4">Our Moments</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((image) => (
          <div key={image.id} className="border rounded-md overflow-hidden shadow-sm">
            <img
              src={image.url}
              alt={image.caption || "Story image"}
              className="w-full h-48 object-cover"
            />
            {image.caption && (
              <p className="text-sm p-2 text-center bg-gray-50">{image.caption}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
