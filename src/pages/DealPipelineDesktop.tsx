import DealerDesktopShell from '../components/DealerDesktopShell'
import DealPipeline from './DealPipeline'

export default function DealPipelineDesktop() {
  return (
    <DealerDesktopShell activeNavId="deal-pipeline">
      <div className="max-w-[1000px] mx-auto">
        <DealPipeline />
      </div>
    </DealerDesktopShell>
  )
}
