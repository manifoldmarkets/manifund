import Image from 'next/image'

export default function Partners() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">
          Trusted by the world’s most innovative teams
        </h2>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          {/* Astral Codex Ten */}
          <Image
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
            // src="https://tailwindui.com/img/logos/158x48/transistor-logo-gray-900.svg"
            src="https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/avatars/86d6d90f-a4ef-4168-9f19-cb7d36fcb996/257f6f9f-4603-48e6-161e-bebca54b7fda"
            alt="Transistor"
            width={158}
            height={48}
          />
          {/* MATS */}
          <Image
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
            // src="https://tailwindui.com/img/logos/158x48/reform-logo-gray-900.svg"
            src="https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/avatars/86d6d90f-a4ef-4168-9f19-cb7d36fcb996/257f6f9f-4603-48e6-161e-bebca54b7fda"
            alt="Reform"
            width={158}
            height={48}
          />
          {/* EA Funds */}
          <Image
            className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
            // src="https://tailwindui.com/img/logos/158x48/tuple-logo-gray-900.svg"

            src="https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/avatars/86d6d90f-a4ef-4168-9f19-cb7d36fcb996/257f6f9f-4603-48e6-161e-bebca54b7fda"
            alt="Tuple"
            width={158}
            height={48}
          />
          {/* Apollo Research */}
          <Image
            className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
            // src="https://tailwindui.com/img/logos/158x48/savvycal-logo-gray-900.svg"
            src="https://fkousziwzbnkdkldjper.supabase.co/storage/v1/object/public/avatars/86d6d90f-a4ef-4168-9f19-cb7d36fcb996/257f6f9f-4603-48e6-161e-bebca54b7fda"
            alt="SavvyCal"
            width={158}
            height={48}
          />
          {/* ??? */}
          <Image
            className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
            src="https://tailwindui.com/img/logos/158x48/statamic-logo-gray-900.svg"
            alt="Statamic"
            width={158}
            height={48}
          />
        </div>
      </div>
    </div>
  )
}
