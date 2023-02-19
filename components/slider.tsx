import Slider, { SliderProps } from 'rc-slider'
import 'rc-slider/assets/index.css'
import clsx from 'clsx'

export default function MySlider(props: SliderProps<number | number[]>) {
  const { marks, ...rest } = props
  return (
    <Slider
      min={0}
      max={100}
      marks={marks}
      className={clsx(
        ' mt-3 mb-10 mx-2 !h-1 [&>.rc-slider-rail]:bg-gray-200 w-11/12',
        '[&>.rc-slider-track]:bg-indigo-700 [&>.rc-slider-handle]:bg-indigo-500'
      )}
      railStyle={{ height: 4, top: 4, left: 0 }}
      trackStyle={{ height: 4, top: 4 }}
      handleStyle={{
        height: 24,
        width: 24,
        opacity: 1,
        border: 'none',
        boxShadow: 'none',
        top: -0.5,
      }}
      {...rest}
    />
  )
}
