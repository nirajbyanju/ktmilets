import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { TbBuildingEstate } from 'react-icons/tb';

import Pokhara from '@/public/images/image8.png';
import Itahari from '@/public/images/image2.png';
import kathmandu from '@/public/home/destination/kathmandu.jpg';
import chitwan from '@/public/home/destination/chitwan.jpg';
import Biratnagar from '@/public/home/destination/biratnagar.jpg';
import Butwal from '@/public/home/destination/butwal.jpg';
import Hetauda from '@/public/home/destination/hetauda.jpg';
import Ilam from '@/public/home/destination/Ilam.jpg';

const destinations: Array<{
  name: string;
  path: string;
  image: StaticImageData;
  alt: string;
  colSpan: string;
  rowSpan: string;
}> = [
  {
    name: 'Kathmandu Valley',
    path: '/properties-list?location=Kathmandu',
    image: kathmandu,
    alt: 'Properties and neighborhoods in Kathmandu Valley',
    colSpan: 'col-span-3',
    rowSpan: 'row-span-3',
  },
  {
    name: 'Chitwan',
    path: '/properties-list?location=Chitwan',
    image: chitwan,
    alt: 'Real estate listings in Chitwan',
    colSpan: 'col-span-3',
    rowSpan: 'row-span-2',
  },
  {
    name: 'Biratnagar',
    path: '/properties-list?location=Biratnagar',
    image: Biratnagar,
    alt: 'Property opportunities in Biratnagar',
    colSpan: 'col-span-3',
    rowSpan: 'row-span-3',
  },
  {
    name: 'Butwal',
    path: '/properties-list?location=Butwal',
    image: Butwal,
    alt: 'Residential and commercial property in Butwal',
    colSpan: 'col-span-3',
    rowSpan: 'row-span-2',
  },
  {
    name: 'Hetauda',
    path: '/properties-list?location=Hetauda',
    image: Hetauda,
    alt: 'Explore homes and land in Hetauda',
    colSpan: 'col-span-3',
    rowSpan: 'row-span-3',
  },
  {
    name: 'Itahari',
    path: '/properties-list?location=Itahari',
    image: Itahari,
    alt: 'Curated listings in Itahari',
    colSpan: 'col-span-3',
    rowSpan: 'row-span-3',
  },
  {
    name: 'Ilam',
    path: '/properties-list?location=Ilam',
    image: Ilam,
    alt: 'Property search results in Ilam',
    colSpan: 'col-span-3',
    rowSpan: 'row-span-2',
  },
  {
    name: 'Pokhara',
    path: '/properties-list?location=Pokhara',
    image: Pokhara,
    alt: 'Find property in Pokhara',
    colSpan: 'col-span-3',
    rowSpan: 'row-span-2',
  },
];

export default function TopDestinations() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl text-opsh-primary">
            Top <span className="text-opsh-primary">Destinations</span>
          </h2>
          <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-opsh-primary" />
          <p className="text-lg text-opsh-primary">
            Explore properties in Nepal&apos;s most sought-after locations with premium amenities
          </p>
        </div>

        <div className="grid auto-rows-[100px] grid-cols-2 gap-4 md:grid-cols-12">
          {destinations.map((destination) => (
            <div
              key={destination.name}
              className={`relative overflow-hidden rounded group ${destination.colSpan} ${destination.rowSpan}`}
            >
              <Link href={destination.path} aria-label={`Browse properties in ${destination.name}`}>
                <Image
                  src={destination.image}
                  alt={destination.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 z-[1] p-[10px]">
                  <div className="h-full w-full bg-white/0 transition-all duration-500 group-hover:bg-white" />
                </div>
                <div className="absolute inset-0 z-[2] flex translate-y-[5px] flex-col items-center justify-center opacity-0 transition-all delay-150 duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-opsh-primary">{destination.name}</h3>
                    <p className="flex gap-1 text-sm text-gray-700">
                      <TbBuildingEstate />
                      24 Properties
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
