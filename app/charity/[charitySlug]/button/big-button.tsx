'use client'
import clsx from 'clsx'
import styles from './styles.module.css'
import useSound from 'use-sound'

export function BigButton() {
  const [playBite] = useSound('/sfx/bite.mp3', { volume: 0.25 })

  return (
    <button
      className={clsx(styles.bigbutton, 'w-full')}
      onMouseDown={() => {
        console.log('clicked')
        playBite()
      }}
      onMouseUp={() => {
        console.log('click up')
        playBite()
      }}
    ></button>
  )
}
