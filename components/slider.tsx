import Slider, { SliderProps } from 'rc-slider'
import 'rc-slider/assets/index.css'
import clsx from 'clsx'

export function MySlider(props: SliderProps<number | number[]>) {
  const { marks, ...rest } = props
  return (
    <Slider
      min={0}
      max={100}
      marks={marks}
      className={clsx(
        'mx-2 mt-3 mb-10 !h-1 [&>.rc-slider-rail]:bg-gray-200 appearance-none',
        '[&>.rc-slider-handle]:bg-orange-500 [&>.rc-slider-track]:bg-orange-500'
      )}
      railStyle={{ height: 4, top: 4 }}
      trackStyle={{ height: 4, top: 4 }}
      handleStyle={{
        height: 24,
        width: 24,
        opacity: 1,
        border: 'none',
        boxShadow: 'none',
        top: -0.5,
      }}
      {...rest}    />
  )
}
