import Maxifund from '../maxi/page'
import Minifund from '../mini/page'
import { ReactCompareSlider } from 'react-compare-slider'

export default function MiniMaxi() {
  return (
    <div>
      {/* Banner across the top to note what this is */}
      <div className="mb-2 w-full bg-gray-200 p-2 text-center text-sm font-light">
        minifund or MAXIFUND - which should we use?
      </div>

      <ReactCompareSlider
        onlyHandleDraggable
        // @ts-expect-error Server Component
        itemOne={<Minifund />}
        // @ts-expect-error Server Component
        itemTwo={<Maxifund />}
      />
    </div>
  )
}
