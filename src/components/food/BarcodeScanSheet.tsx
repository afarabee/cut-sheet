import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FoodCard } from '@/components/food/FoodCard'
import { lookupBarcode } from '@/lib/openfoodfacts'
import { supabase } from '@/lib/supabase'
import { useCreateFood } from '@/hooks/useFoods'
import type { Food, FoodInput } from '@/types'

type ScanState =
  | { step: 'scanning' }
  | { step: 'looking-up'; barcode: string }
  | { step: 'found'; food: Food | (FoodInput & { barcode: string }); isLocal: boolean }
  | { step: 'not-found'; barcode: string }
  | { step: 'error'; message: string }

interface BarcodeScanSheetProps {
  /** Called with a Food that's been saved to the local library */
  onFound: (food: Food) => void
  /** Called when user chooses to create manually for an unfound barcode */
  onCreateManually: (barcode: string) => void
  onCancel: () => void
}

export function BarcodeScanSheet({ onFound, onCreateManually, onCancel }: BarcodeScanSheetProps) {
  const [state, setState] = useState<ScanState>({ step: 'scanning' })
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const hasScannedRef = useRef(false)
  const createFood = useCreateFood()

  useEffect(() => {
    if (state.step !== 'scanning') return

    let mounted = true
    hasScannedRef.current = false

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('scan-sheet-reader')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 120 },
            aspectRatio: 1.5,
          },
          async (decodedText) => {
            if (!mounted || hasScannedRef.current) return
            hasScannedRef.current = true

            try {
              await scanner.stop()
            } catch {
              // ignore
            }

            handleBarcode(decodedText)
          },
          () => {
            // ignore decode failures
          }
        )
      } catch {
        if (mounted) {
          setState({
            step: 'error',
            message: 'Camera access denied. Check your browser permissions.',
          })
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      scannerRef.current?.stop().catch(() => {})
      scannerRef.current = null
    }
  }, [state.step])

  const handleBarcode = async (barcode: string) => {
    setState({ step: 'looking-up', barcode })

    // Local DB first
    const { data: localFood } = await supabase
      .from('cut_foods')
      .select('*')
      .eq('barcode', barcode)
      .limit(1)
      .maybeSingle()

    if (localFood) {
      setState({ step: 'found', food: localFood as Food, isLocal: true })
      return
    }

    // Then Open Food Facts
    const offFood = await lookupBarcode(barcode)
    if (offFood) {
      setState({ step: 'found', food: offFood, isLocal: false })
      return
    }

    setState({ step: 'not-found', barcode })
  }

  const handleUse = async () => {
    if (state.step !== 'found') return

    // Already in local library
    if (state.isLocal) {
      onFound(state.food as Food)
      return
    }

    // From Open Food Facts — save to library first, then return
    try {
      const saved = await createFood.mutateAsync(state.food as FoodInput)
      toast.success(`${saved.name} saved to library`)
      onFound(saved)
    } catch {
      toast.error('Failed to save food')
    }
  }

  const resetScanner = () => {
    hasScannedRef.current = false
    setState({ step: 'scanning' })
  }

  return (
    <div className="fixed inset-0 z-[65] flex items-end" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-h-[90dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />

        <h3 className="mb-4 text-lg font-semibold text-foreground">Scan Barcode</h3>

        {/* Scanner */}
        {state.step === 'scanning' && (
          <div className="overflow-hidden rounded-xl border border-border">
            <div id="scan-sheet-reader" className="w-full" />
          </div>
        )}

        {/* Looking up */}
        {state.step === 'looking-up' && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Looking up {state.barcode}...
            </p>
          </div>
        )}

        {/* Found */}
        {state.step === 'found' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5">
              <p className="text-xs font-medium text-primary">
                {state.isLocal ? 'Found in your library' : 'Found on Open Food Facts'}
              </p>
            </div>

            <FoodCard food={state.food as Food} />

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleUse}
                disabled={createFood.isPending}
                className="h-11 w-full text-base font-semibold shadow-[0_0_16px_rgba(0,240,255,0.3)]"
              >
                {createFood.isPending ? 'Saving...' : state.isLocal ? 'Use This' : 'Save & Use'}
              </Button>
              <Button variant="outline" onClick={resetScanner} className="w-full">
                Scan Another
              </Button>
            </div>
          </div>
        )}

        {/* Not found */}
        {state.step === 'not-found' && (
          <div className="flex flex-col items-center py-8">
            <Camera className="h-9 w-9 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-foreground">Food not found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Barcode {state.barcode} isn't in any database
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button onClick={() => onCreateManually(state.barcode)}>
                Create Manually
              </Button>
              <Button variant="outline" onClick={resetScanner}>
                Scan Again
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {state.step === 'error' && (
          <div className="flex flex-col items-center py-8">
            <p className="text-sm text-destructive">{state.message}</p>
            <Button variant="outline" onClick={resetScanner} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={onCancel}
          className="mt-4 w-full text-muted-foreground"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
