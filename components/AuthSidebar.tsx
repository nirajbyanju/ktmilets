'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

// Type for each slide
export interface SlideItem {
  image: StaticImageData; // <-- Use StaticImageData
  url: string;
}

// Props for the Slider
interface SliderProps {
  data: SlideItem[];
}

const Slider: React.FC<SliderProps> = ({ data }) => {
  return (
    <div className="flex flex-col space-y-6">
      {data.map((item, index) => (
        <Link key={index} href={item.url}>
          <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={item.image}  // StaticImageData works here
              alt={`slide-${index}`}
              fill
              className="object-cover"
            />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Slider;