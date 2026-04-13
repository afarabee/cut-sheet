import { TargetsForm } from '@/components/settings/TargetsForm'

export default function Settings() {
  return (
    <div className="mx-auto max-w-lg p-4 pt-8">
      <h1 className="mb-6 text-xl font-bold text-foreground">Daily Targets</h1>
      <TargetsForm />
    </div>
  )
}
