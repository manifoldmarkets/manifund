// not in use

// import { RadioGroup } from '@headlessui/react'
// import clsx from 'clsx'
// import { Row } from './layout/row'

// export function HorizontalRadioGroup(props: {
//   value: string
//   onChange: (value: string) => void
//   options: { [key: string]: string }
//   wide?: boolean
// }) {
//   const { value, onChange, options, wide } = props
//   return (
//     <RadioGroup
//       value={value}
//       onChange={onChange}
//       className={clsx('rounded-md shadow-sm', wide ? 'w-full' : 'max-w-fit')}
//     >
//       <Row
//         className={clsx(
//           'rounded-md border border-gray-300 bg-white p-2',
//           wide ? 'w-full justify-between' : ''
//         )}
//       >
//         {Object.entries(options).map(([type, label]) => (
//           <RadioGroup.Option
//             key={type}
//             value={type}
//             className={({ checked }) =>
//               clsx(
//                 'cursor-pointer focus:outline-none',
//                 checked
//                   ? 'bg-orange-500 text-white hover:bg-orange-600'
//                   : 'bg-white text-gray-900',
//                 'flex items-center justify-center rounded-md px-3 py-3 text-sm font-semibold'
//               )
//             }
//           >
//             <RadioGroup.Label as="span">{label}</RadioGroup.Label>
//           </RadioGroup.Option>
//         ))}
//       </Row>
//     </RadioGroup>
//   )
// }


//   // tailwind.config.js
//   module.exports = {
//     // ...
//     plugins: [
//       // ...
//       require('@tailwindcss/forms'),
//     ],
//   }
//   ```
// */


export default function Checkbox() {
    return (
        <fieldset>
            <legend className="sr-only">Notifications</legend>
            <div className="space-y-5">
                <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input
                            id="comments"
                            aria-describedby="comments-description"
                            name="comments"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="comments" className="font-medium text-gray-900">
                            Comments
                        </label>
                        <p id="comments-description" className="text-gray-500">
                            Get notified when someones posts a comment on a posting.
                        </p>
                    </div>
                </div>
                <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input
                            id="candidates"
                            aria-describedby="candidates-description"
                            name="candidates"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="candidates" className="font-medium text-gray-900">
                            Candidates
                        </label>
                        <p id="candidates-description" className="text-gray-500">
                            Get notified when a candidate applies for a job.
                        </p>
                    </div>
                </div>
                <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input
                            id="offers"
                            aria-describedby="offers-description"
                            name="offers"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="offers" className="font-medium text-gray-900">
                            Offers
                        </label>
                        <p id="offers-description" className="text-gray-500">
                            Get notified when a candidate accepts or rejects an offer.
                        </p>
                    </div>
                </div>
            </div>
        </fieldset>
    )
}
