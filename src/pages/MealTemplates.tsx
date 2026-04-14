import { useState } from 'react'
import { Plus, BookmarkX } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TemplateCard } from '@/components/templates/TemplateCard'
import { UseTemplateSheet } from '@/components/templates/UseTemplateSheet'
import { CreateTemplateSheet } from '@/components/templates/CreateTemplateSheet'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useMealTemplates, useDeleteTemplate } from '@/hooks/useMealTemplates'
import type { MealTemplate } from '@/types'

export default function MealTemplates() {
  const { data: templates, isLoading } = useMealTemplates()
  const deleteTemplate = useDeleteTemplate()
  const [usingTemplate, setUsingTemplate] = useState<MealTemplate | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<MealTemplate | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="mx-auto max-w-lg p-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Meal Templates</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-muted-foreground">Loading...</p>
      ) : !templates?.length ? (
        <div className="py-12 text-center">
          <BookmarkX className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No templates yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Save a meal from the dashboard, or create one from scratch
          </p>
          <Button variant="outline" onClick={() => setShowCreate(true)} className="mt-4">
            Create Template
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {templates.map((t) => (
            <div key={t.id} className="group relative">
              <TemplateCard
                template={t}
                onUse={() => setUsingTemplate(t)}
              />
              <button
                type="button"
                onClick={() => setDeletingTemplate(t)}
                className="absolute right-2 top-2 hidden rounded p-1 text-destructive hover:bg-destructive/10 group-hover:block"
              >
                <BookmarkX className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {usingTemplate && (
        <UseTemplateSheet
          template={usingTemplate}
          onDone={() => setUsingTemplate(null)}
          onCancel={() => setUsingTemplate(null)}
        />
      )}

      {showCreate && (
        <CreateTemplateSheet
          onDone={() => setShowCreate(false)}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {deletingTemplate && (
        <ConfirmDialog
          title="Delete template?"
          message={`Remove "${deletingTemplate.name}"? This won't affect any logged meals.`}
          onConfirm={() => {
            deleteTemplate.mutate(deletingTemplate.id, {
              onSuccess: () => {
                toast.success(`${deletingTemplate.name} deleted`)
                setDeletingTemplate(null)
              },
            })
          }}
          onCancel={() => setDeletingTemplate(null)}
          isPending={deleteTemplate.isPending}
        />
      )}
    </div>
  )
}
