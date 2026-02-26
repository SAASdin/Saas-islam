export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="arabic-text text-slate-500 text-sm" dir="rtl" lang="ar">جارٍ التحميل…</p>
      </div>
    </div>
  )
}
