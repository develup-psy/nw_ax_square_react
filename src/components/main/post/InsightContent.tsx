import type { CSSProperties } from 'react'
import { ArrowIcon } from '../../icons'
import { useAxSquare } from '../../../context/AxSquareContext'
import type { AxSquarePost } from '../../../services/sharepoint'
import { INSIGHT_LINKS } from '../../../constants/links'

type InsightFallback = AxSquarePost & { emoji: string; color: string }
type InsightStyle = CSSProperties & { '--insight-fallback-bg'?: string }

const FALLBACK_INSIGHTS: InsightFallback[] = [
  {
    id: -101,
    title: '셀렉터 오류 해결 노하우',
    section: 'INSIGHT',
    tag: '',
    summary: '요소를 찾지 못하거나 클릭이 실패할 때 Selector 범위와 주변 요소를 어떻게 잡아야 하는지 확인하세요.',
    href: INSIGHT_LINKS.selector,
    publishedAt: '',
    sortOrder: 1,
    isFeatured: false,
    isVisible: true,
    contentImage: '',
    emoji: '🖱️',
    color: '#FFF0F7',
  },
  {
    id: -102,
    title: 'Python이 안 된다면? 체크리스트',
    section: 'INSIGHT',
    tag: '',
    summary: 'Python 실행이 안 될 때 버전, 경로, 권한 등 먼저 확인해야 할 항목을 단계별로 확인하세요.',
    href: INSIGHT_LINKS.python,
    publishedAt: '',
    sortOrder: 2,
    isFeatured: false,
    isVisible: true,
    contentImage: '',
    emoji: '🐍',
    color: '#F0FDF4',
  },
  {
    id: -103,
    title: '재부팅 시간, 이렇게 챙기세요',
    section: 'INSIGHT',
    tag: '',
    summary: '정기 재부팅 일정과 재부팅 전후 Agent 실행 상태에서 무엇을 확인해야 하는지 확인하세요.',
    href: INSIGHT_LINKS.reboot,
    publishedAt: '',
    sortOrder: 3,
    isFeatured: false,
    isVisible: true,
    contentImage: '',
    emoji: '🔄',
    color: '#EFF6FF',
  },
  {
    id: -104,
    title: 'RPA 팀즈방 사용·반납 가이드',
    section: 'INSIGHT',
    tag: '',
    summary: 'RPA 팀즈방 사용과 반납 시 남겨야 할 내용, 운영자 간 공유해야 할 사항을 확인하세요.',
    href: INSIGHT_LINKS.teams,
    publishedAt: '',
    sortOrder: 4,
    isFeatured: false,
    isVisible: true,
    contentImage: '',
    emoji: '💬',
    color: '#FEF9C3',
  },
]

function InsightCard({ post, fallbackIndex }: { post: AxSquarePost; fallbackIndex: number }) {
  const fallback = FALLBACK_INSIGHTS[fallbackIndex % FALLBACK_INSIGHTS.length]
  const style: InsightStyle = { '--insight-fallback-bg': fallback.color }

  return (
    <a className="insight-card" href={post.href || '#'} target="_blank" rel="noreferrer" style={style}>
      <div className="insight-thumbnail"><span>{fallback.emoji}</span></div>
      <div className="insight-body">
        <div className="insight-title clamp-2" title={post.title}>{post.title}</div>
        <div className="insight-summary clamp-3" title={post.summary}>{post.summary}</div>
        <div className="insight-action">자세히 보기 <ArrowIcon /></div>
      </div>
    </a>
  )
}

export default function InsightContent() {
  const { getPostsBySection } = useAxSquare()
  const remote = [...getPostsBySection('INSIGHT')].sort((a, b) => a.sortOrder - b.sortOrder)
  const posts = remote.length ? remote : FALLBACK_INSIGHTS

  return (
    <div className="insight-content">
      <div className="content-section-heading">
        <span className="section-category section-category--insight">INSIGHT</span>
        <h3 className="content-section-title">자주 발생하는 오류와 운영 팁을 쉽게 확인하세요</h3>
      </div>

      <div className="insight-grid">
        {posts.slice(0, 8).map((post, index) => <InsightCard key={post.id} post={post} fallbackIndex={index} />)}
      </div>
    </div>
  )
}
