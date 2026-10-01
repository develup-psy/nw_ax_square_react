import { ArrowIcon } from '../../icons'
import { useAxSquare } from '../../../context/AxSquareContext'
import type { AxSquarePost } from '../../../services/sharepoint'
import taskRegistrationImage from '../../../assets/images/task-registration.png'
import handoverImage from '../../../assets/images/handover.png'
import { INFORMATION_LINKS } from '../../../constants/links'

const TASK_INFORMATION: AxSquarePost = {
  id: -1,
  title: '이제 과제 등록부터 현황을 실시간으로 확인하세요.',
  section: 'INFORMATION',
  tag: '과제 등록',
  summary: '과제를 이제 쉽고 간편하게 JIRA로 등록하고 실시간으로 어디까지 진행했는지를 확인하세요.',
  href: INFORMATION_LINKS.taskRegistration,
  publishedAt: '',
  sortOrder: 1,
  isFeatured: true,
  isVisible: true,
  contentImage: '',
}

const HANDOVER_INFORMATION: AxSquarePost = {
  id: -2,
  title: '과제 인수 인계는 이렇게 하세요',
  section: 'INFORMATION',
  tag: '과제 인수인계',
  summary: '공동 운영으로 전환하기 전에 인수인계 진행 순서와 반드시 확인해야 할 체크리스트를 한 번에 확인하세요.',
  href: INFORMATION_LINKS.handover,
  publishedAt: '',
  sortOrder: 2,
  isFeatured: true,
  isVisible: true,
  contentImage: '',
}

const FALLBACK_ADDITIONAL_INFORMATION: AxSquarePost[] = [
  {
    id: -3,
    title: '운영에 필요한 자료를 한 곳에서 확인하세요',
    section: 'INFORMATION',
    tag: '자료',
    summary: '교육 자료, 워크샵 자료, 공통 가이드처럼 업무 중 다시 찾게 되는 운영 자료를 한 곳에서 확인하세요.',
    href: INFORMATION_LINKS.resources,
    publishedAt: '',
    sortOrder: 1,
    isFeatured: false,
    isVisible: true,
    contentImage: '',
  },
  {
    id: -4,
    title: '운영 정책과 준수사항을 확인하세요',
    section: 'INFORMATION',
    tag: '운영 정책',
    summary: 'Agent 개발·운영 시 지켜야 할 표준 운영 원칙과 계정, 환경, 운영 관련 주요 준수사항을 확인하세요.',
    href: INFORMATION_LINKS.policy,
    publishedAt: '',
    sortOrder: 2,
    isFeatured: false,
    isVisible: true,
    contentImage: '',
  },
  {
    id: -5,
    title: '막히는 내용은 FAQ에서 먼저 찾아보세요',
    section: 'INFORMATION',
    tag: 'FAQ',
    summary: '신청 방법, 운영 중 자주 발생하는 문의, 일정·스케줄 등 반복적으로 헷갈리는 내용을 빠르게 확인하세요.',
    href: INFORMATION_LINKS.faq,
    publishedAt: '',
    sortOrder: 3,
    isFeatured: false,
    isVisible: true,
    contentImage: '',
  },
]

const FEATURE_GUIDES = {
  task: [
    '신규 과제를 어디에서, 어떤 정보로 등록해야 하는지 확인할 수 있습니다.',
    '접수·검토·개발 등 현재 과제가 어느 단계까지 진행됐는지 확인할 수 있습니다.',
    '처리 현황을 확인한 뒤 필요한 후속 요청이나 운영 준비로 바로 이어갈 수 있습니다.',
  ],
  handover: [
    '공동 운영 전환 전에 준비해야 할 문서와 운영 정보를 확인할 수 있습니다.',
    '인수인계 신청 → 내용 확인 → 미팅 → 공동 운영 전환까지 진행 순서를 확인할 수 있습니다.',
    '계정·환경·스케줄·예외처리 등 빠뜨리기 쉬운 항목을 체크리스트로 점검할 수 있습니다.',
  ],
}

function resolveAdditionalInformation(posts: AxSquarePost[]): AxSquarePost[] {
  const additionalPosts = posts
    .filter(post => !post.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 3)

  return additionalPosts.length ? additionalPosts : FALLBACK_ADDITIONAL_INFORMATION
}

function FeaturedInformation({ post, type }: { post: AxSquarePost; type: 'task' | 'handover' }) {
  const guideItems = FEATURE_GUIDES[type]
  const imageSrc = type === 'task' ? taskRegistrationImage : handoverImage

  return (
    <article className="information-feature-card">
      <div className="information-feature">
        <div className="information-image-wrap">
          <img className="information-image" src={imageSrc} alt={post.title} />
        </div>

        <div className="information-copy">
          <h3 className="information-title clamp-2" title={post.title}>{post.title}</h3>
          <p className="information-summary clamp-3" title={post.summary}>{post.summary}</p>

          <div className="information-guide-box">
            <div className="information-guide-label">여기서 확인할 수 있어요</div>
            <ul className="information-guide-list">
              {guideItems.map(item => <li key={item} className="clamp-2" title={item}>{item}</li>)}
            </ul>
          </div>

          <a className="primary-detail-link" href={post.href} target="_blank" rel="noreferrer">
            자세히 보기 <ArrowIcon />
          </a>
        </div>
      </div>
    </article>
  )
}

function AdditionalInformation({ post }: { post: AxSquarePost }) {
  return (
    <a className="additional-info-card" href={post.href || '#'} target="_blank" rel="noreferrer">
      {post.tag && <div className="additional-info-tag clamp-1">{post.tag}</div>}
      <div className="additional-info-title clamp-2" title={post.title}>{post.title}</div>
      <div className="additional-info-summary clamp-3" title={post.summary}>{post.summary}</div>
      <div className="additional-info-action">더보기 →</div>
    </a>
  )
}

export default function InformationContent() {
  const { getPostsBySection } = useAxSquare()
  const additional = resolveAdditionalInformation(getPostsBySection('INFORMATION'))

  return (
    <div className="information-content">
      <div className="information-journey-intro">
        <strong>처음 들어오셨다면 이 순서로 확인해보세요.</strong>
        <span>신규 과제 등록 → 진행 현황 확인 → 공동 운영 전환까지, 전담자가 자주 찾는 정보를 업무 흐름에 맞춰 정리했습니다.</span>
      </div>

      <div className="information-journey-steps" aria-label="운영 업무 주요 흐름">
        <span><b>1</b> 신규 과제 등록</span>
        <span className="information-journey-arrow">→</span>
        <span><b>2</b> 진행 현황 확인</span>
        <span className="information-journey-arrow">→</span>
        <span><b>3</b> 공동 운영 전환</span>
      </div>

      <div className="information-primary-list">
        <FeaturedInformation post={TASK_INFORMATION} type="task" />
        <FeaturedInformation post={HANDOVER_INFORMATION} type="handover" />
      </div>

      <div className="additional-info-section">
        <h3 className="additional-info-heading">함께 확인하면 좋은 운영 정보</h3>
        <div className="additional-info-grid">
          {additional.map(post => <AdditionalInformation key={post.id} post={post} />)}
        </div>
      </div>
    </div>
  )
}
