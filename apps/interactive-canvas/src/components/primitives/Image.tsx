import React from "react";

export type ImageProps = {
  src?: string;
  alt?: string;
  fit?: "cover" | "contain";
  radius?: number;
};

export default function Image({
  src = "https://picsum.photos/600/400",
  alt = "Image",
  fit = "cover",
  radius = 14,
}: ImageProps) {
  return (
    <div className="w-full h-full overflow-hidden" style={{ borderRadius: radius }}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full"
        style={{ objectFit: fit }}
        draggable={false}
      />
    </div>
  );
}
