import type { CSSProperties, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownProps = {
  value: string;
  className?: string;
  inline?: boolean;
  style?: CSSProperties;
};

const LEGACY_LINE_COLOR_MARKER = /(^|\n)(\s*(?:(?:#{1,6}|>|[-*+])\s+|\d+\.\s+)?)(\{#[0-9A-Fa-f]{6}\}\s*)/g;
const INLINE_COLOR_HREF = /^#text-color-([0-9A-Fa-f]{6})$/;

/**
 * v5/v6의 "현재 줄 색상" 문법은 렌더링 시 제거합니다.
 * v9의 부분 색상도 안전한 Markdown anchor 문법을 유지하되, Inspector에서 marker를 직접 관리합니다.
 * [선택한 글자](#text-color-FF2E98) 로 저장합니다.
 */
function stripLegacyLineColorMarkers(value: string) {
  return value.replace(LEGACY_LINE_COLOR_MARKER, '$1$2');
}

function StyledAnchor({ href, children }: { href?: string; children?: ReactNode }) {
  const match = href?.match(INLINE_COLOR_HREF);
  if (match) {
    return (
      <span
        className="markdown-inline-color"
        style={{ '--inline-color': `#${match[1]}` } as CSSProperties}
      >
        {children}
      </span>
    );
  }
  return <a href={href}>{children}</a>;
}

export function Markdown({ value, className = '', inline = false, style }: MarkdownProps) {
  if (!value) return null;

  const components = inline
    ? {
        p: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
        h1: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
        h2: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
        h3: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
        li: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
        ul: ({ children }: { children?: ReactNode }) => <>{children}</>,
        ol: ({ children }: { children?: ReactNode }) => <>{children}</>,
        a: StyledAnchor,
      }
    : { a: StyledAnchor };

  return (
    <div className={`markdown ${className}`} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {stripLegacyLineColorMarkers(value)}
      </ReactMarkdown>
    </div>
  );
}
