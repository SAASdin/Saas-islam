// ============================================================
// StreakBadge.tsx — Affichage streak + badges islamiques
// Pas de classement compétitif — encouragement individuel
// ============================================================

interface StreakBadgeProps {
  streak: number
  badges: string[]
  dueTotal: number
}

const STREAK_MESSAGES: Record<number, string> = {
  1:   'Premier jour — Bismillah ! 🌱',
  3:   '3 jours — Continue ! 💪',
  7:   'Une semaine — Masha\'Allah ! ⭐',
  14:  '2 semaines — Subhan Allah ! 🌟',
  30:  'Un mois — Hafiz en devenir ! 🏆',
  60:  'Deux mois — Remarquable ! 🌙',
  100: 'Centenaire — Alhamdulillah ! ✨',
}

function getStreakMessage(streak: number): string {
  const keys = Object.keys(STREAK_MESSAGES).map(Number).sort((a, b) => b - a)
  for (const k of keys) {
    if (streak >= k) return STREAK_MESSAGES[k]
  }
  return 'Commencez votre streak !'
}

export default function StreakBadge({ streak, badges, dueTotal }: StreakBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Streak */}
      {streak > 0 && (
        <div className="streak-badge">
          <span>🔥</span>
          <span>{streak} jour{streak > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Message motivant */}
      {streak > 0 && (
        <span className="text-xs text-slate-400">{getStreakMessage(streak)}</span>
      )}

      {/* Révisions dues */}
      {dueTotal > 0 && (
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: 'rgba(239,68,68,0.12)',
            border:     '1px solid rgba(239,68,68,0.25)',
            color:      '#ef4444',
          }}
        >
          <span>⏰</span>
          <span>{dueTotal} révision{dueTotal > 1 ? 's' : ''} en attente</span>
        </div>
      )}

      {/* Badges obtenus */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {badges.map(badge => (
            <span
              key={badge}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(212,175,55,0.12)',
                border:     '1px solid rgba(212,175,55,0.3)',
                color:      '#d4af37',
              }}
              title={`Badge obtenu : ${badge}`}
            >
              🏅 {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
