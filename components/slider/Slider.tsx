"use client";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./slider.scss";

import Link from "next/link";
import Image from "next/image";

type SliderProps = {
  data: {
    image: string;
    url: string;
  }[];
};

const Slider: React.FC<SliderProps> = ({ data }) => {
  return (
    <div>
      <Carousel
        className="relative w-full flex flex-row justify-center"
        infiniteLoop
        emulateTouch
        showArrows={false}
        interval={5000}
        showThumbs={false}
        showStatus={false}
        autoPlay
      >
        {data.map((item, index) => (
          <Link href={item.url} key={index} className="w-full">
            <div className="relative w-full h-[400px] overflow-hidden rounded-lg group">
              <Image
                src={item.image}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover scale-110 transition-transform duration-500 group-hover:scale-125"
                priority={index === 0}
              />
            </div>
          </Link>
        ))}
      </Carousel>
    </div>
  );
};

export default Slider;
