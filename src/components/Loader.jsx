/**
 * Loading indicators (requirement: "handle loading and error states").
 *
 * Two exports:
 *   <Loader />        a simple spinner with a label
 *   <CardSkeleton />  grey placeholder shaped like an EventCard, which
 *                     stops the layout from jumping when data arrives
 */

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <article className="card card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--image" />
      <div className="card__body">
        <div className="skeleton skeleton--line" style={{ width: '40%' }} />
        <div className="skeleton skeleton--line" style={{ width: '90%', height: 20 }} />
        <div className="skeleton skeleton--line" style={{ width: '60%' }} />
        <div className="skeleton skeleton--line" style={{ width: '75%' }} />
      </div>
    </article>
  )
}

/** A grid of skeleton cards — handy while the events list loads. */
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid--cards">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}
