import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'
import ApiKeyNotice from '../components/ApiKeyNotice'

import {
  fetchCategories,
  setFilters,
  selectCategories,
  selectCategoriesStatus,
  selectCategoriesError,
} from '../store/slices/eventsSlice'
import { hasApiKey } from '../api/ticketmaster'


const DECOR = {
  Music: { emoji: '🎵' },
  Sports: { emoji: '🏟' },
  'Arts & Theatre': { emoji: '🎭' },
  Film: { emoji: '🎬' },
  Miscellaneous: { emoji: '✨' },
}

export default function Categories() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const categories = useSelector(selectCategories)
  const status = useSelector(selectCategoriesStatus)
  const error = useSelector(selectCategoriesError)

  useEffect(() => {
    if (status === 'idle' && hasApiKey) {
      dispatch(fetchCategories())
    }
  }, [status, dispatch])

  function openCategory(name) {
    dispatch(setFilters({ classificationName: name, keyword: '', city: '' }))
    navigate('/events')
  }

  return (
    <div className="container section">
      <header className="page-head">
        <h1 className="page-title">Browse by category</h1>
        <p className="page-sub">
          Categories (Ticketmaster calls them “segments”) come straight from the Discovery API.
        </p>
      </header>

      <ApiKeyNotice />

      {status === 'loading' && <Loader label="Loading categories…" />}

      {status === 'failed' && (
        <ErrorMessage message={error} onRetry={() => dispatch(fetchCategories())} />
      )}

      {status === 'succeeded' && (
        <div className="grid grid--categories">
          {categories.map((category) => {
            const decor = DECOR[category.name] ?? { emoji: '🎟', hue: 260 }

            return (
              <button
                key={category.id}
                className="category-card"
                onClick={() => openCategory(category.name)}
              >
                <span className="category-card__emoji" aria-hidden="true">
                  {decor.emoji}
                </span>
                <h2 className="category-card__name">{category.name}</h2>

                {category.genres.length > 0 && (
                  <p className="category-card__genres">{category.genres.join(' · ')}</p>
                )}

                <span className="category-card__cta">Explore events →</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
