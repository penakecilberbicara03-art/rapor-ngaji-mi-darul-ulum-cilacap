-- ============================================================================
-- SKEMA DATABASE SUPABASE
-- Aplikasi: RAPOR NGAJI MADRASAH IBTIDAIYAH DARUL ULUM CILACAP
-- Petunjuk: Salin seluruh isi file ini dan jalankan di Supabase SQL Editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roodoh_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  nama_madrasah TEXT NOT NULL DEFAULT 'Madrasah Ibtidaiyah Darul Ulum Cilacap',
  alamat_madrasah TEXT NOT NULL DEFAULT '',
  tahun_ajaran TEXT NOT NULL DEFAULT '2026/2027',
  semester_aktif TEXT NOT NULL DEFAULT 'Ganjil',
  nama_kepala_madrasah TEXT NOT NULL DEFAULT '',
  nip_kepala_madrasah TEXT NOT NULL DEFAULT '',
  kota_rapor TEXT NOT NULL DEFAULT 'Cilacap',
  tanggal_rapor TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roodoh_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'guru')),
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL DEFAULT 'Guru Pembimbing Roodoh',
  assigned_classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roodoh_classes (
  id TEXT PRIMARY KEY,
  nama TEXT UNIQUE NOT NULL,
  tingkat INTEGER NOT NULL CHECK (tingkat BETWEEN 1 AND 6),
  guru_pembimbing TEXT NOT NULL,
  wali_kelas TEXT NOT NULL DEFAULT '-',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roodoh_students (
  id TEXT PRIMARY KEY,
  nisn TEXT NOT NULL,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
  guru_pembimbing TEXT NOT NULL,
  nama_wali TEXT NOT NULL DEFAULT '-',
  juz30_tuntas_baseline BOOLEAN NOT NULL DEFAULT FALSE,
  catatan_semester JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.roodoh_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.roodoh_students(id) ON DELETE CASCADE,
  tanggal TEXT NOT NULL,
  hari TEXT NOT NULL,
  waktu_sesi TEXT NOT NULL DEFAULT 'Ba''da Dzuhur',
  semester TEXT NOT NULL,
  tahun_ajaran TEXT NOT NULL,
  kehadiran TEXT NOT NULL CHECK (kehadiran IN ('Hadir', 'Izin', 'Sakit', 'Alfa')),
  bacaan JSONB,
  hafalan JSONB,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_roodoh_students_kelas ON public.roodoh_students (kelas);
CREATE INDEX IF NOT EXISTS idx_roodoh_students_nisn ON public.roodoh_students (nisn);
CREATE INDEX IF NOT EXISTS idx_roodoh_sessions_student_id ON public.roodoh_sessions (student_id);
CREATE INDEX IF NOT EXISTS idx_roodoh_sessions_tanggal ON public.roodoh_sessions (tanggal DESC);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.roodoh_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roodoh_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roodoh_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roodoh_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roodoh_sessions ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses awal agar aplikasi langsung terhubung dengan Publishable Key.
-- Disarankan memperketat kebijakan ini setelah menerapkan Supabase Auth.
DROP POLICY IF EXISTS "Akses penuh settings" ON public.roodoh_settings;
CREATE POLICY "Akses penuh settings" ON public.roodoh_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Akses penuh users" ON public.roodoh_users;
CREATE POLICY "Akses penuh users" ON public.roodoh_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Akses penuh classes" ON public.roodoh_classes;
CREATE POLICY "Akses penuh classes" ON public.roodoh_classes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Akses penuh students" ON public.roodoh_students;
CREATE POLICY "Akses penuh students" ON public.roodoh_students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Akses penuh sessions" ON public.roodoh_sessions;
CREATE POLICY "Akses penuh sessions" ON public.roodoh_sessions FOR ALL USING (true) WITH CHECK (true);
