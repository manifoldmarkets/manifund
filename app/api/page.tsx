'use client'
import Link from 'next/link'
import React from 'react'

const apis = [
  {
    name: 'List projects',
    id: 'projects',
    path: '/api/v0/projects',
    description: 'Get a list of all public projects.',
    method: 'GET',
    params: [
      {
        name: 'limit',
        type: 'number',
        required: false,
        desc: 'Max projects to return.',
      },
      {
        name: 'offset',
        type: 'number',
        required: false,
        desc: 'How many to skip.',
      },
    ],
    response: `[
  {
    title: string,
    id: string,
    created_at: string,
    creator: string,
    // URL of the project is https://manifund.org/projects/{slug}
    slug: string,
    blurb: string,
    // Markdown description of the project
    description: string,
    stage: string,
    funding_goal: number,
    min_funding: number,
    type: string,
    profiles: {
      username: string,
      full_name: string
    },
    txns: [],
    bids: [],
    causes: [
      {
        title: string,
        slug: string
      }
    ]
  }
]`,
    curl: `curl https://manifund.org/api/v0/projects`,
  },
  {
    name: 'List comments',
    id: 'comments',
    path: '/api/v0/comments',
    description: 'Get a list of all public comments.',
    method: 'GET',
    params: [
      {
        name: 'projectId',
        type: 'string',
        required: false,
        desc: 'Filter by project.',
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        desc: 'Max comments to return.',
      },
      {
        name: 'offset',
        type: 'number',
        required: false,
        desc: 'How many to skip.',
      },
    ],
    response: `[
  {
    id: string,
    created_at: string,
    content: string,
    commenter: string,
    project: string,
    profiles: {
      username: string,
      full_name: string
    },
    projects: {
      title: string,
      slug: string
    }
  }
]`,
    curl: `curl https://manifund.org/api/v0/comments`,
  },
]

export default function ApiDocsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-56 border-r bg-white p-6 md:block">
        <div className="mb-8 flex items-center gap-2">
          <span className="text-lg tracking-tight text-orange-600">
            Manifund API
          </span>
        </div>
        <nav className="space-y-2">
          {apis.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="block w-full rounded px-3 py-2 text-left font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-600"
            >
              {a.name}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 py-10 md:ml-56 md:px-12 lg:px-24">
        <div className="max-w-2xl">
          <h1 className="mb-8 flex items-center gap-2 text-3xl tracking-tight text-orange-600">
            Manifund API
          </h1>
          <p className="mb-10 text-gray-600">
            Manifund makes all of our data public, for developers and LLMs
            alike. Our endpoints are open and require no authentication.
            <br />
            <br />
            Building something cool with this? Hop in our{' '}
            <Link
              href="https://discord.gg/ZGsDMWSA5Q"
              className="text-orange-600 underline"
            >
              Discord
            </Link>{' '}
            and let us know!
          </p>
          {apis.map((api) => (
            <section key={api.id} id={api.id} className="scroll-mt-24 py-24">
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  {api.name}
                </h2>
                <span className="mr-2 inline-block rounded bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600">
                  {api.method}
                </span>
                <span className="font-mono text-sm text-gray-700">
                  {api.path}
                </span>
              </div>
              <p className="mb-6 text-gray-600">{api.description}</p>
              <h3 className="mb-2 mt-6 font-semibold text-gray-900">
                Query Parameters
              </h3>
              <table className="mb-8 w-full overflow-hidden rounded border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Required</th>
                    <th className="p-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {api.params.map((param) => (
                    <tr key={param.name} className="border-t">
                      <td className="p-2 font-mono">{param.name}</td>
                      <td className="p-2">{param.type}</td>
                      <td className="p-2">{param.required ? 'Yes' : 'No'}</td>
                      <td className="p-2">{param.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="mb-2 font-semibold text-gray-900">Response</h3>
              <pre className="mb-8 overflow-x-auto rounded bg-gray-100 p-4 text-xs">
                <code>{api.response}</code>
              </pre>
              <div className="mb-2 text-xs font-semibold text-gray-500">
                cURL
              </div>
              <pre className="mb-8 overflow-x-auto rounded border border-orange-100 bg-orange-50 p-3 text-xs">
                <code>{api.curl}</code>
              </pre>
            </section>
          ))}
        </div>
      </main>

      {/* Code samples column removed for simplicity and to keep all content in the center */}
    </div>
  )
}
