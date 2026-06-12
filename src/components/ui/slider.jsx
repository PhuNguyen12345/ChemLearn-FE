"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) {
  const _values = React.useMemo(() =>
    Array.isArray(value)
      ? value
      : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max], [value, defaultValue, min, max])

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}>
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-slate-200 data-horizontal:h-2 data-horizontal:w-full data-vertical:h-full data-vertical:w-2">
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-blue-500 select-none data-horizontal:h-full data-vertical:w-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block size-5 shrink-0 rounded-full border border-blue-500 bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] select-none hover:ring-3 focus-visible:ring-3 focus-visible:outline-none active:ring-4 active:ring-blue-200 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider }
