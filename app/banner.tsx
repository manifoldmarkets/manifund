'use client'
import { IconButton } from '@/components/button'
import { SiteLink } from '@/components/site-link'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

export function CompleteProfileBanner() {
  return (
    <div className="relative isolate -mx-2 mb-6 flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <svg
        viewBox="0 0 577 310"
        aria-hidden="true"
        className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 w-[36.0625rem] -translate-y-1/2 transform-gpu blur-2xl"
      >
        <path
          id="a906133b-f855-4023-a54c-38d70c72fe9c"
          fill="url(#be47b6c9-9c22-49b2-a209-168b52fa0ada)"
          fillOpacity=".3"
          d="m142.787 168.697-75.331 62.132L.016 88.702l142.771 79.995 135.671-111.9c-16.495 64.083-23.088 173.257 82.496 97.291C492.935 59.13 494.936-54.366 549.339 30.385c43.523 67.8 24.892 159.548 10.136 196.946l-128.493-95.28-36.628 177.599-251.567-140.953Z"
        />
        <defs>
          <linearGradient
            id="be47b6c9-9c22-49b2-a209-168b52fa0ada"
            x1="614.778"
            x2="-42.453"
            y1="26.617"
            y2="96.115"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f97316" />
            <stop offset={1} stopColor="#f43f5e" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        viewBox="0 0 577 310"
        aria-hidden="true"
        className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 w-[36.0625rem] -translate-y-1/2 transform-gpu blur-2xl"
      >
        <use href="#a906133b-f855-4023-a54c-38d70c72fe9c" />
      </svg>
      <p className="w-full text-center text-sm leading-6 text-gray-900">
        <SiteLink href="/edit-profile">
          <strong className="font-semibold">TO DO</strong>
          <svg
            viewBox="0 0 2 2"
            className="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>
          Complete your profile &nbsp;
          <span aria-hidden="true">&rarr;</span>
        </SiteLink>
      </p>
    </div>
  )
}

export function ACXFundBanner() {
  const [show, setShow] = useState(true)
  if (!show) return null
  return (
    <div className="relative isolate -mx-2 mb-6 flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <svg
        viewBox="0 0 577 310"
        aria-hidden="true"
        className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 w-[36.0625rem] -translate-y-1/2 transform-gpu blur-2xl"
      >
        <path
          id="a906133b-f855-4023-a54c-38d70c72fe9c"
          fill="url(#be47b6c9-9c22-49b2-a209-168b52fa0ada)"
          fillOpacity=".3"
          d="m142.787 168.697-75.331 62.132L.016 88.702l142.771 79.995 135.671-111.9c-16.495 64.083-23.088 173.257 82.496 97.291C492.935 59.13 494.936-54.366 549.339 30.385c43.523 67.8 24.892 159.548 10.136 196.946l-128.493-95.28-36.628 177.599-251.567-140.953Z"
        />
        <defs>
          <linearGradient
            id="be47b6c9-9c22-49b2-a209-168b52fa0ada"
            x1="614.778"
            x2="-42.453"
            y1="26.617"
            y2="96.115"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4f46e5" />
            <stop offset={1} stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        viewBox="0 0 577 310"
        aria-hidden="true"
        className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 w-[36.0625rem] -translate-y-1/2 transform-gpu blur-2xl"
      >
        <use href="#a906133b-f855-4023-a54c-38d70c72fe9c" />
      </svg>
      <p className="w-full text-center text-sm leading-6 text-gray-900">
        <SiteLink href="/funds/acx-grants-2024" onClick={() => setShow(false)}>
          Donate to the ACX Grants 2024 Fund &nbsp;
          <span aria-hidden="true">&rarr;</span>
        </SiteLink>
      </p>
      <IconButton
        className="absolute right-2 top-1"
        onClick={() => setShow(false)}
      >
        <XMarkIcon className="h-4 w-4 stroke-2 text-gray-500" />
      </IconButton>
    </div>
  )
}
