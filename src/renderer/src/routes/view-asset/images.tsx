import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { Asset } from "@shared/types";

export function Images({ asset }: { asset: Asset }): React.JSX.Element {
  return (
    <div className="flex w-full justify-center">
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={16}
        slidesPerView={1}
        className="aspect-video w-full max-w-2xl"
      >
        {asset.images.map((image, index) => (
          <SwiperSlide key={`${image}-${index}`} className="flex items-center justify-center">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black">
              <img
                src={image}
                alt={`${asset.title} preview ${index + 1}`}
                className="h-full w-full object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
