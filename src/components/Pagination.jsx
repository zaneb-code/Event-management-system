/**
 * Pagination for the events list.
 *
 * Note on the Ticketmaster API: it refuses requests where
 * (page + 1) * size > 1000, so we cap the page count accordingly
 * instead of letting the user click into an error.
 */

export default function Pagination({ page, totalPages, size, onPageChange }) {
  const maxAllowedPages = Math.floor(1000 / size)
  const safeTotal = Math.min(totalPages, maxAllowedPages)

  if (safeTotal <= 1) return null

  const current = page + 1 // the API is zero-based, humans are not

  // Build a short window of page numbers around the current page.
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  const end = Math.min(safeTotal, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)

  const pages = []
  for (let i = start; i <= end; i += 1) pages.push(i)

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        ← Prev
      </button>

      <ul className="pagination__pages">
        {start > 1 && (
          <>
            <li>
              <button className="pagination__num" onClick={() => onPageChange(0)}>
                1
              </button>
            </li>
            {start > 2 && <li className="pagination__dots">…</li>}
          </>
        )}

        {pages.map((p) => (
          <li key={p}>
            <button
              className={`pagination__num ${p === current ? 'pagination__num--active' : ''}`}
              onClick={() => onPageChange(p - 1)}
              aria-current={p === current ? 'page' : undefined}
            >
              {p}
            </button>
          </li>
        ))}

        {end < safeTotal && (
          <>
            {end < safeTotal - 1 && <li className="pagination__dots">…</li>}
            <li>
              <button className="pagination__num" onClick={() => onPageChange(safeTotal - 1)}>
                {safeTotal}
              </button>
            </li>
          </>
        )}
      </ul>

      <button
        className="pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={current >= safeTotal}
      >
        Next →
      </button>
    </nav>
  )
}
