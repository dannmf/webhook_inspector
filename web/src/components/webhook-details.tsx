import { useSuspenseQuery } from "@tanstack/react-query"
import { webhookDetailsSchema } from "../http/schemas/webhooks"
import { WebhookDetailHeader } from "./webhook-detail-header"
import { SectionTile } from "./section-title"
import { SectionDataTable } from "./section-data-table"
import { CodeBlock } from "./ui/code-block"

interface WebhookDetailsProps {
  id: string
}

export function WebhookDetails({ id }: WebhookDetailsProps) {
  const { data } = useSuspenseQuery({
    queryKey: ['webhook', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/api/webhooks/${id}`)
      const data = await response.json()

      console.log('Response data:', data)
      console.log('Response status:', response.status)

      return webhookDetailsSchema.parse(data)
    }
  })

  const overviewData = [
    { key: 'Method', value: data.method },
    { key: 'StatusCode', value: String(data.statusCode) },
    { key: 'Content-Type', value: data.contentType || 'application/json' },
    { key: 'Content-Length', value: `${data.contentLength || 0} bytes` }

  ]

  const headers = Object.entries(data.headers).map(([key, value]) => {
    return { key: key, value: String(value)}
  })

  const queryParams = Object.entries(data.queryParams || {}).map(([key, value]) => {
    return { key: key, value: String(value)}
  })

  return(
    <div className='flex h-full flex-col'>
          <WebhookDetailHeader
              method={data.method}
              ip={data.ip}
              pathname={data.pathname}
              createdAt={data.createdAt}
          />
      <div className='flex-1 overflow-y-auto'>
        <div className='space-y-6 p-6'>
          <div className='space-y-4'>
            < SectionTile>Request Overview</SectionTile>
          <SectionDataTable data={overviewData} />
          </div>
          {queryParams.length > 0 && (
            <div className='space-y-4'>
              <SectionTile>Query Parameters</SectionTile>
            <SectionDataTable data={queryParams} />
            </div>
          )}
          <div className='space-y-4'>
            <SectionTile>Headers</SectionTile>
          <SectionDataTable data={headers} />
          </div>
          {!!data.body && (
            <div className='space-y-4'>
              <SectionTile>Request Body</SectionTile>
            <CodeBlock code={data.body} />
            </div>
          )}
          <div/>
        </div>
      </div>
    </div>

  )
}
