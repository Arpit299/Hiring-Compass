
/**
 * Subtle animated background effects used across the app.
 * - Decorative only (aria-hidden)
 * - Respects prefers-reduced-motion
 */
import '../styles/backgrounds.css';

export default function BackgroundEffects({ variant = 'subtle' }: { variant?: 'subtle' | 'bold' }) {
  const variantClass = variant === 'bold' ? 'bg-variant-bold' : 'bg-variant-subtle';
  return (
    <div aria-hidden className={`fixed inset-0 pointer-events-none -z-10 ${variantClass}`}>
      <div className="absolute inset-0 overflow-hidden">
        {/* Radial gradient blobs */}
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="g1" cx="30%" cy="20%">
              <stop offset="0%" stopColor="#071129" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#071129" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blobA" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blobB" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#g1)" />

          <g className="reduced-motion-hide">
            <circle cx="420" cy="160" r="300" fill="url(#blobA)"></circle>
            <circle cx="1200" cy="280" r="260" fill="url(#blobB)"></circle>
          </g>
        </svg>
      </div>

      {/* Animated grid overlay */}
      <div className="absolute inset-0 bg-grid-overlay reduced-motion-hide">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gridFade" x1="0" x2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="url(#gridFade)" strokeWidth="0.6">
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`v-${i}`} x1={(i * 60).toString()} y1="0" x2={(i * 60).toString()} y2="800" />
            ))}
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={(i * 60).toString()} x2="1200" y2={(i * 60).toString()} />
            ))}
          </g>
        </svg>
      </div>

      {/* Styles are now in src/styles/backgrounds.css */}
    </div>
  );
}
