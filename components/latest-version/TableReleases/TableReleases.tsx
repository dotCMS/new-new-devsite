import { type FC } from 'react'

import { type TTableReleases } from './types'
import { useCurrentRelease } from '@/hooks/useCurrentRelease'

export const TableReleases: FC<{  }> = () => {

    const isLts = false
    const data = useCurrentRelease().data?.releases;
    console.log("data", data)
  if (!Array.isArray(data) || data.length === 0) return <>No data</>
  return (
    <div className="mx-auto py-[2em]">
      <h2 className="mb-[1em] text-2xl font-bold">Latest Versions of dotCMS</h2>
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse">
          <thead>
            <tr>
              <th>Release Type</th>
              <th>Version</th>
              <th>Docker Image</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((row: TTableReleases, index: number) => (
              <tr
                key={index}
                className="nx-m-0 nx-border-t nx-border-gray-300 nx-p-0 dark:nx-border-gray-600 even:nx-bg-gray-100 even:dark:nx-bg-gray-600/20"
              >
                {isLts && (
                  <td className="nx-m-0 nx-border nx-border-gray-300 nx-px-4 nx-py-2 dark:nx-border-gray-600">LTS</td>
                )}
                {!isLts && (
                  <td className="nx-m-0 nx-border nx-border-gray-300 nx-px-4 nx-py-2 dark:nx-border-gray-600">
                    Current
                  </td>
                )}
                {row?.minor && (
                  <td className="nx-m-0 nx-border nx-border-gray-300 nx-px-4 nx-py-2 dark:nx-border-gray-600">
                    <h3 id={row?.minor}>{row?.minor}</h3>
                  </td>
                )}
                {row?.dockerImage && (
                  <td className="nx-m-0 nx-border nx-border-gray-300 nx-px-4 nx-py-2 dark:nx-border-gray-600 flex">
                    
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
