import { useEffect, useMemo, useRef, useState } from 'react'
import { useAxSquare } from '../../context/AxSquareContext'
import type { AxSquarePost } from '../../services/sharepoint'

function formatDate(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10).replace(/-/g, '.')

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function getPublishedTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function HotNoticePlaceholder({ post }: { post: AxSquarePost }) {
  return (
    <div className="hot-notice-placeholder">
      <div className="hot-notice-placeholder-label">REACT TEST</div>
      <strong>{post.title}</strong>
      <p>
        실제 SharePoint에서는 <code>content_image</code>에 등록된 Posting Builder 게시물 이미지가 이 영역에 표시됩니다.
        이 테스트 영역은 실제 게시물처럼 길게 만들어 내부 스크롤 동작을 확인하도록 구성했습니다.
      </p>
      {Array.from({ length: 9 }).map((_, index) => (
        <div className="hot-notice-placeholder-section" key={index}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <div>
            <b>게시물 콘텐츠 영역</b>
            <p>팝업 전체 높이는 고정되고, 이 콘텐츠 영역만 세로로 스크롤됩니다.</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HotNoticePopup() {
  const { isLoaded, getPostsBySection } = useAxSquare()
  const notices = useMemo(
    () => [...getPostsBySection('HOT_NOTICE')].sort((a, b) => getPublishedTime(b.publishedAt) - getPublishedTime(a.publishedAt)),
    [getPostsBySection],
  )

  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const openedOnceRef = useRef(false)

  useEffect(() => {
    if (!isLoaded || notices.length === 0 || openedOnceRef.current) return
    openedOnceRef.current = true
    setCurrentIndex(0)
    setIsOpen(true)
  }, [isLoaded, notices.length])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
      if (event.key === 'ArrowLeft' && notices.length > 1) {
        setCurrentIndex(index => (index - 1 + notices.length) % notices.length)
      }
      if (event.key === 'ArrowRight' && notices.length > 1) {
        setCurrentIndex(index => (index + 1) % notices.length)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, notices.length])

  if (!isOpen || notices.length === 0) return null

  const current = notices[currentIndex]
  const move = (direction: -1 | 1) => {
    setCurrentIndex(index => (index + direction + notices.length) % notices.length)
  }

  return (
    <div className="hot-notice-overlay" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) setIsOpen(false)
    }}>
      <section className="hot-notice-dialog" role="dialog" aria-modal="true" aria-labelledby="hot-notice-title">
        <header className="hot-notice-header">
          <div className="hot-notice-heading-copy">
            <div className="hot-notice-meta">
              {current.tag && <span className="hot-notice-tag">{current.tag}</span>}
              {current.publishedAt && <span className="hot-notice-date">{formatDate(current.publishedAt)}</span>}
            </div>
            <h2 id="hot-notice-title" title={current.title}>{current.title}</h2>
          </div>

          <button className="hot-notice-close" type="button" onClick={() => setIsOpen(false)} aria-label="공지 팝업 닫기">×</button>
        </header>

        <div className="hot-notice-scroll-area">
          {current.contentImage ? (
            <img className="hot-notice-content-image" src={current.contentImage} alt={current.title} />
          ) : (
            <HotNoticePlaceholder post={current} />
          )}
        </div>

        <footer className="hot-notice-footer">
          <button className="hot-notice-nav-button" type="button" onClick={() => move(-1)} disabled={notices.length <= 1} aria-label="이전 공지">←</button>

          <div className="hot-notice-pages" aria-label="공지 페이지 선택">
            {notices.map((notice, index) => (
              <button
                key={notice.id}
                type="button"
                className={`hot-notice-page${index === currentIndex ? ' is-active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`${index + 1}번 공지`}
                aria-current={index === currentIndex ? 'true' : undefined}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button className="hot-notice-nav-button" type="button" onClick={() => move(1)} disabled={notices.length <= 1} aria-label="다음 공지">→</button>
        </footer>
      </section>
    </div>
  )
}
