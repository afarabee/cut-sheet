import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { ArrowLeft, Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FoodCard } from '@/components/food/FoodCard'
import { PortionSheet } from '@/components/log/PortionSheet'
import { lookupBarcode } from '@/lib/openfoodfacts'
import { supabase } from '@/lib/supabase'
import { useCreateFood } from '@/hooks/useFoods'
import { useAddLogEntry } from '@/hooks/useLogEntries'
import { getDefaultMealType } from '@/lib/constants'
import type { Food, FoodInput } from '@/types'

type ScanState =
  | { step: 'scanning' }
  | { step: 'looking-up'; barcode: string }
  | { step: 'found'; food: Food | (FoodInput & { barcode: string }); isLocal: boolean }
  | { step: 'not-found'; barcode: string }
  | { step: 'error'; message: string }

export default function BarcodeScan() {
  const navigate = useNavigate()
  const [state, setState] = useState<ScanState>({ step: 'scanning' })
  const [showPortionSheet, setShowPortionSheet] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasScannedRef = useRef(false)

  const createFood = useCreateFood()
  const addLogEntry = useAddLogEntry()

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (state.step !== 'scanning') return

    let mounted = true
    hasScannedRef.current = false

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('barcode-reader')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            if (!mounted || hasScannedRef.current) return
            hasScannedRef.current = true

            try {
              await scanner.stop()
            } catch {
              // ignore stop errors
            }

            handleBarcode(decodedText)
          },
          () => {
            // ignore scan failures (no barcode in frame)
          }
        )
      } catch (err) {
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

    // Check local DB first
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

    // Try Open Food Facts
    const offFood = await lookupBarcode(barcode)
    if (offFood) {
      setState({ step: 'found', food: offFood, isLocal: false })
      return
    }

    setState({ step: 'not-found', barcode })
  }

  const handleLog = async (servings: number) => {
    if (state.step !== 'found') return

    let foodId: string | null = null
    let food = state.food

    // If it's from Open Food Facts (not local), save to DB first
    if (!state.isLocal) {
      try {
        const saved = await createFood.mutateAsync(food as FoodInput)
        foodId = saved.id
        food = saved
      } catch {
        toast.error('Failed to save food')
        return
      }
    } else {
      foodId = (food as Food).id
    }

    addLogEntry.mutate(
      {
        food_id: foodId,
        food_name: food.name!,
        serving_qty: servings,
        serving_size: food.serving_size,
        serving_unit: food.serving_unit,
        calories: Math.round((food.calories ?? 0) * servings),
        fat_g: Math.round((food.fat_g ?? 0) * servings * 10) / 10,
        carbs_g: Math.round((food.carbs_g ?? 0) * servings * 10) / 10,
        protein_g: Math.round((food.protein_g ?? 0) * servings * 10) / 10,
        fiber_g: Math.round((food.fiber_g ?? 0) * servings * 10) / 10,
        total_sugars_g: Math.round((food.total_sugars_g ?? 0) * servings * 10) / 10,
        meal_type: getDefaultMealType(),
        entry_method: 'barcode',
        logged_at: today,
      },
      {
        onSuccess: () => {
          toast.success(`${food.name} logged`)
          navigate('/')
        },
        onError: () => {
          toast.error('Failed to log food')
        },
      }
    )
  }

  const handleSaveToLibrary = async () => {
    if (state.step !== 'found' || state.isLocal) return

    createFood.mutate(state.food as FoodInput, {
      onSuccess: (saved) => {
        toast.success(`${saved.name} saved to library`)
        setState({ step: 'found', food: saved, isLocal: true })
      },
      onError: () => {
        toast.error('Failed to save food')
      },
    })
  }

  const resetScanner = () => {
    hasScannedRef.current = false
    setState({ step: 'scanning' })
  }

  return (
    <div className="mx-auto max-w-lg p-4 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Scan Barcode</h1>
      </div>

      {/* Scanner viewport */}
      {state.step === 'scanning' && (
        <div
          ref={containerRef}
          className="overflow-hidden rounded-xl border border-border"
        >
          <div id="barcode-reader" className="w-full" />
        </div>
      )}

      {/* Looking up */}
      {state.step === 'looking-up' && (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Looking up barcode {state.barcode}...
          </p>
        </div>
      )}

      {/* Found */}
      {state.step === 'found' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-medium text-primary">
              {state.isLocal ? 'Found in your library' : 'Found on Open Food Facts'}
            </p>
          </div>

          <FoodCard food={state.food as Food} />

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => setShowPortionSheet(true)}
              className="h-11 w-full text-base font-semibold shadow-[0_0_16px_rgba(0,240,255,0.3)]"
            >
              Log This Food
            </Button>
            {!state.isLocal && (
              <Button
                variant="outline"
                onClick={handleSaveToLibrary}
                disabled={createFood.isPending}
                className="w-full"
              >
                {createFood.isPending ? 'Saving...' : 'Save to Library'}
              </Button>
            )}
            <Button variant="ghost" onClick={resetScanner} className="w-full text-muted-foreground">
              Scan Another
            </Button>
          </div>
        </div>
      )}

      {/* Not found */}
      {state.step === 'not-found' && (
        <div className="flex flex-col items-center py-12">
          <Camera className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-foreground">Food not found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Barcode {state.barcode} isn't in our databases
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={resetScanner}>
              Scan Again
            </Button>
            <Button
              onClick={() =>
                navigate('/log/custom', { state: { initialBarcode: state.barcode } })
              }
            >
              Create Manually
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {state.step === 'error' && (
        <div className="flex flex-col items-center py-12">
          <p className="text-sm text-destructive">{state.message}</p>
          <Button variant="outline" onClick={resetScanner} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {/* Portion sheet for logging */}
      {showPortionSheet && state.step === 'found' && (
        <PortionSheet
          food={state.food as Food}
          onConfirm={handleLog}
          onCancel={() => setShowPortionSheet(false)}
          isPending={addLogEntry.isPending || createFood.isPending}
        />
      )}
    </div>
  )
}
