"use client"
import { Col } from "@/components/layout/col";
import { Row } from "@/components/layout/row";
import { Project } from "@/db/project";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { Result } from "./page";

export function ResultsTable(props: {resultsMap: {[k: string]: Result | null} , projects: Project[]}){
    const {resultsMap, projects} = props
    return         (<Col className="mt-5 divide-y divide-gray-200">
    <div className="grid grid-cols-7 gap-2 py-2 text-sm text-gray-600">
      <p className="col-span-3">Project</p>
      <Row>Inside
        <button>
          <ChevronUpIcon className="h-3 w-3" />
        </button>
      </Row>
      <Row>Outside
        <button>
          <ChevronUpIcon className="h-3 w-3" />
        </button>
      </Row>
      <p>Conf</p>
      <Row>Overall
        <button>
          <ChevronUpIcon className="h-3 w-3" />
        </button>
      </Row>
    </div>
    {projects.map((project) => {
      if (!!resultsMap[project.id]) {
        return (<ResultRow key={project.id} project={project} result={resultsMap[project.id] as Result} />)
      }
    })}
  </Col>)
}

function ResultRow(props: {
  project: Project
  result: Result
}) {
  const { result, project } = props
  
  return (
    <div className="grid grid-cols-7 gap-4 py-2 text-sm">
      <Link
        className="line-clamp-1 col-span-3 hover:underline"
        href={`/projects/${project.slug}`}
      >
        {project.title}
      </Link>
      <p>{Math.round(result.insideScore * 10) / 10}</p>
      <p>
        {isNaN(result.outsideScore)
          ? 'N/A'
          : Math.round(result.outsideScore * 10) / 10}
      </p>
      <p>{result.confidence}</p>
      <p className="font-bold">
        {Math.round(result.overallScore * 10) / 10}
      </p>
    </div>
  )
}