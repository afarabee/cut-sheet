-- Cut Sheet tables (shared Supabase project with cut_ prefix)

CREATE TABLE cut_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  serving_size numeric,
  serving_unit text,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  total_sugars_g numeric,
  source text NOT NULL DEFAULT 'custom',
  usda_fdc_id text,
  barcode text,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cut_log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid REFERENCES cut_foods(id) ON DELETE SET NULL,
  food_name text NOT NULL,
  serving_qty numeric,
  serving_size numeric,
  serving_unit text,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  total_sugars_g numeric,
  meal_type text NOT NULL DEFAULT 'snack',
  entry_method text NOT NULL DEFAULT 'manual',
  logged_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cut_daily_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  total_sugars_g numeric,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(effective_date)
);

CREATE TABLE cut_meal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cut_meal_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES cut_meal_templates(id) ON DELETE CASCADE,
  food_id uuid NOT NULL REFERENCES cut_foods(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  serving_qty numeric,
  serving_size numeric,
  serving_unit text,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  total_sugars_g numeric,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_cut_log_entries_date ON cut_log_entries(logged_at);
CREATE INDEX idx_cut_log_entries_food ON cut_log_entries(food_id);
CREATE INDEX idx_cut_foods_name ON cut_foods(name);
CREATE INDEX idx_cut_foods_barcode ON cut_foods(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_cut_foods_favorite ON cut_foods(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_cut_daily_targets_date ON cut_daily_targets(effective_date);
CREATE INDEX idx_cut_meal_template_items_template ON cut_meal_template_items(template_id);

ALTER TABLE cut_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE cut_log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cut_daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cut_meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cut_meal_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on cut_foods" ON cut_foods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cut_log_entries" ON cut_log_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cut_daily_targets" ON cut_daily_targets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cut_meal_templates" ON cut_meal_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cut_meal_template_items" ON cut_meal_template_items FOR ALL USING (true) WITH CHECK (true);
