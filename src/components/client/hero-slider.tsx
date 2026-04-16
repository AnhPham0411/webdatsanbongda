"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export const HeroSlider = () => {
  const t = useTranslations("HeroSlider");
  const [current, setCurrent] = useState(0);

  // Danh sách ảnh mẫu và nội dung đã được dịch
  const SLIDES = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200",
      title: t("slide1.title"),
      subtitle: t("slide1.subtitle"),
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1200",
      title: t("slide2.title"),
      subtitle: t("slide2.subtitle"),
    },
    {
      id: 3,
      image: "/images/friendly-connection.png",
      title: t("slide3.title"),
      subtitle: t("slide3.subtitle"),
    },
  ];

  // Tự động chuyển slide sau 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {/* Ảnh nền - Đã khôi phục */}
          <div className="relative w-full h-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Lớp phủ tối để text dễ đọc hơn */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Nội dung Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-20 space-y-4 pt-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-lg">
              {slide.title}
            </h1>
            <p className="text-lg md:text-xl font-light max-w-2xl drop-shadow-md text-slate-100">
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Nút điều hướng */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 text-white hover:bg-white/20 hover:text-white rounded-full h-12 w-12 hidden md:flex"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 text-white hover:bg-white/20 hover:text-white rounded-full h-12 w-12 hidden md:flex"
        onClick={nextSlide}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Dots indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              index === current ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
};