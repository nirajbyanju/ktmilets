import { useState } from "react";
import Image from "next/image";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCamera,
} from "react-icons/hi";
import { ImPlay2 } from "react-icons/im";
import {
  AiOutlineFullscreen,
} from "react-icons/ai";
import { FaRegHeart } from "react-icons/fa";
import { MdAddCircleOutline } from "react-icons/md";
import img6 from '@/public/images/image6.png';
import img4 from '@/public/images/image4.png';
import img5 from '@/public/images/image5.png';
import img7 from '@/public/images/image7.png';
import img8 from '@/public/images/image8.png';
import img9 from '@/public/images/image9.png';
import img10 from '@/public/images/image10.png';
import img11 from '@/public/images/image2.png';

const properties = [
  {
    id: 'SR8601',
    price: "3 Crore 10 Lakh",
    title: "Land for sale at Suryabinayak",
    location: "Suryabinayak | Thapa Banquet",
    images: [img6, img4, img5, img7],
  },
   {
    id: 'SR8601',
    price: "3 Crore 10 Lakh",
    title: "Land for sale at Suryabinayak",
    location: "Suryabinayak | Thapa Banquet",
    images: [img6, img4, img5, img7],
  },
  // others...
];

{properties.map((property) => {
  const [current, setCurrent] = useState(0);
  const total = property.images.length;

  const nextImage = () =>
    setCurrent((prev) => (prev + 1) % total);

  const prevImage = () =>
    setCurrent((prev) => (prev - 1 + total) % total);

  return (
    <div
      key={property.id}
      className="bg-white rounded-xl shadow-lg overflow-hidden group"
    >
      {/* IMAGE AREA */}
      <div className="relative">

        <Image
          src={property.images[current]}
          alt={property.title}
          width={600}
          height={400}
          className="rounded-lg object-cover"
        />

        {/* PROPERTY ID */}
        <div className="absolute top-4 left-0 bg-white text-red-600 font-bold px-3 py-1">
          Property ID: {property.id}
        </div>

        {/* SLIDER BUTTONS */}
        <button
          onClick={prevImage}
          className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
          <HiChevronLeft size={22} />
        </button>

        <button
          onClick={nextImage}
          className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
          <HiChevronRight size={22} />
        </button>

        {/* TOP RIGHT ICONS (ON HOVER) */}
        <div className="absolute top-4 right-3 flex gap-3 opacity-0 group-hover:opacity-100 transition">
          <span className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded text-white text-sm">
            <HiOutlineCamera /> {total}
          </span>
          <span className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded text-white text-sm">
            <ImPlay2 /> 1
          </span>
        </div>

        {/* BOTTOM RIGHT ICONS (ON HOVER) */}
        <div className="absolute bottom-3 right-3 flex gap-3 opacity-0 group-hover:opacity-100 transition text-white text-xl">
          <AiOutlineFullscreen />
          <FaRegHeart />
          <MdAddCircleOutline />
        </div>

        {/* PRICE */}
        <div className="absolute bottom-3 left-0 text-red-600 font-bold px-3 py-1 text-2xl">
          {property.price}
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-green-900">
          {property.title}
        </h3>
        <p className="text-gray-600">{property.location}</p>
      </div>
    </div>
  );
})}
