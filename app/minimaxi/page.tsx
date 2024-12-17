import Maxifund from '../maxi/page'
import Minifund from '../mini/page'
import { ReactCompareSlider } from 'react-compare-slider'
import Link from 'next/link'
import { SiteLink } from '@/components/site-link'

export default function MiniMaxi() {
  return (
    <div>
      {/* Banner across the top to note what this is */}
      <div className="mb-2 w-full bg-orange-100 p-2 text-center text-sm font-light">
        minifund vs MAXIFUND - A/B test our homepage! (vs{' '}
        <SiteLink className="text-gray-500" href="/projects">
          original
        </SiteLink>
        )
      </div>

      <ReactCompareSlider
        onlyHandleDraggable
        itemOne={<Minifund />}
        itemTwo={<Maxifund />}
      />
    </div>
  )
}
