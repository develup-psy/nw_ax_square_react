import * as React from 'react'
import { FileText, Plus, Sparkles, Trash2 } from 'lucide-react'
import type { StudioPostSummary, StudioUser } from './types'

import postingBuilderIcon
  from '../../assets/images/nw_ax_icon.svg';

function formatModified(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function PostDirectory({
  user,
  posts,
  loading,
  deletingPostId,
  onCreate,
  onOpen,
  onDelete,
  onBackToSquare,
}: {
  user: StudioUser
  posts: StudioPostSummary[]
  loading: boolean
  deletingPostId?: string | null
  onCreate: () => void
  onOpen: (postId: string) => void
  onDelete: (post: StudioPostSummary) => void
  onBackToSquare?: () => void
}) {
  return (
    <div className="studio-directory">
      <header className="studio-directory-header">
        <div className="studio-directory-brand">
          <img
                src={postingBuilderIcon}
                alt=""
                className="brand-mark"
              />
          <div>
            <strong>NW AX Square Studio</strong>
            <span>POSTING BUILDER</span>
          </div>
        </div>
        {onBackToSquare ? (
          <button className="studio-directory-back" type="button" onClick={onBackToSquare}>운영스퀘어로 돌아가기</button>
        ) : null}+
      </header>

      <main className="studio-directory-main">
        <div className="studio-directory-hero">
          <div>
            <span className="studio-directory-eyebrow">MY POSTS</span>
            <h1>{user.name}님, 어떤 게시물을 작성하시겠어요?</h1>
            <p>작성 중인 게시물을 이어서 수정하거나 새로운 게시물을 만들어보세요.</p>
          </div>
          <button className="studio-create-button" type="button" onClick={onCreate} disabled={loading}>
            <Plus size={17} /> 새 게시물
          </button>
        </div>

        <section className="studio-post-section">
          <div className="studio-post-section-heading">
            <h2>내 게시물</h2>
            <span>{posts.length}개</span>
          </div>

          {loading ? (
            <div className="studio-directory-state">게시물을 불러오는 중입니다.</div>
          ) : posts.length === 0 ? (
            <div className="studio-empty-state">
              <div className="studio-empty-icon"><FileText size={28} /></div>
              <strong>아직 작성한 게시물이 없습니다.</strong>
              <p>필요한 섹션을 조합해 첫 게시물을 만들어보세요.</p>
              <button type="button" onClick={onCreate}><Plus size={16} /> 새 게시물 만들기</button>
            </div>
          ) : (
            <div className="studio-post-grid">
              {posts.map(post => {
                const isDeleting = deletingPostId === post.postId

                return (
                  <article className="studio-post-card" key={post.postId}>
                    <button
                      className="studio-post-card-open"
                      type="button"
                      onClick={() => onOpen(post.postId)}
                      disabled={isDeleting}
                    >
                      <div className="studio-post-card-preview">
                        <FileText size={28} />
                      </div>
                      <div className="studio-post-card-body">
                        <strong title={post.title}>{post.title || '제목 없는 게시물'}</strong>
                        <span>마지막 수정 {formatModified(post.modified)}</span>
                      </div>
                    </button>

                    <button
                      className="studio-post-delete-button"
                      type="button"
                      aria-label={`${post.title || '제목 없는 게시물'} 삭제`}
                      title="게시물 삭제"
                      disabled={isDeleting}
                      onClick={(event) => {
                        event.stopPropagation()
                        onDelete(post)
                      }}
                    >
                      <Trash2 size={15} />
                      <span>{isDeleting ? '삭제 중' : '삭제'}</span>
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
