import { createFileRoute } from '@tanstack/react-router'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Sidebar } from '../components/sidebar'
import { WebhookDetailHeader } from '../components/webhook-detail-header'
import { SectionTile } from '../components/section-title'
import { SectionDataTable } from '../components/section-data-table'
import { CodeBlock } from '../components/ui/code-block'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const overviewData = [
    {key: 'Method', value: 'POST'},
    {key: 'URL', value: '/webhook'},
    {key: 'Headers', value: 'Content-Type: application/json'},
    {key: 'Body', value: '{"message": "Hello World"}'}
  ]
  return (
    <div className="h-screen bg-zinc-900">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15} maxSize={40}>
          <Sidebar />
        </Panel>

        <PanelResizeHandle className="w-px bg-zinc-700 hover:bg-zinc-600 transition-colors duration-150" />

        <Panel defaultSize={80} minSize={40}>
          <div className='flex h-full flex-col'>
                <WebhookDetailHeader />
            <div className='flex-1 overflow-y-auto'>
              <div className='space-y-6 p-6'>
                <div className='space-y-4'>
                  <SectionTile>Request Overview</SectionTile>
                <SectionDataTable data={overviewData} />
                </div>
                <div className='space-y-4'>
                  <SectionTile>Query Parameters</SectionTile>
                <SectionDataTable data={overviewData} />
                </div>
                <div className='space-y-4'>
                  <SectionTile>Headers</SectionTile>
                <SectionDataTable data={overviewData} />
                </div>
                <div className='space-y-4'>
                  <SectionTile>Request Body</SectionTile>
                <CodeBlock code={JSON.stringify(overviewData,null,2)} />
                </div>
                <div/>
              </div>
            </div>
          </div>

        </Panel>
      </PanelGroup>
    </div>
  )
}
