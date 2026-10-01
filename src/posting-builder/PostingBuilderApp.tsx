import { useCallback, useEffect, useRef, useState } from 'react'
import { createEmptyProject } from './data/initialProject'
import PostingBuilderEditor, { type BuilderSaveState } from './PostingBuilderEditor'
import { PostDirectory } from './studio/PostDirectory'
import type { BuilderProject } from './types/project'
import type { PostingBuilderRepository, StudioPost, StudioPostSummary, StudioUser } from './studio/types'
import './styles.css'

export default function PostingBuilderApp({
  user,
  repository,
  onBackToSquare,
}: {
  user: StudioUser
  repository: PostingBuilderRepository
  onBackToSquare?: () => void
}) {
  const [posts, setPosts] = useState<StudioPostSummary[]>([])
  const [activePost, setActivePost] = useState<StudioPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<BuilderSaveState>('saved')
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const currentProjectRef = useRef<BuilderProject | null>(null)
  const lastSavedJsonRef = useRef('')

  const refreshPosts = useCallback(async () => {
    setLoading(true)
    try {
      setPosts(await repository.listPosts(user.id))
    } finally {
      setLoading(false)
    }
  }, [repository, user.id])

  useEffect(() => {
    refreshPosts().catch(error => console.error('[Posting Builder] 게시물 목록 조회 실패', error))
  }, [refreshPosts])

  useEffect(() => () => {
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
  }, [])

  const openPost = async (postId: string) => {
    setLoading(true)
    try {
      const post = await repository.getPost(user.id, postId)
      if (!post) {
        window.alert('게시물을 찾을 수 없습니다.')
        await refreshPosts()
        return
      }
      currentProjectRef.current = post.content
      lastSavedJsonRef.current = JSON.stringify(post.content)
      setSaveState('saved')
      setActivePost(post)
    } catch (error) {
      console.error(error)
      window.alert('게시물을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const createPost = async () => {
    setLoading(true)
    try {
      const project = createEmptyProject()
      const post = await repository.createPost({
        userId: user.id,
        title: project.title,
        postId: project.id,
        content: project,
      })
      currentProjectRef.current = project
      lastSavedJsonRef.current = JSON.stringify(project)
      setSaveState('saved')
      setActivePost(post)
    } catch (error) {
      console.error(error)
      window.alert('새 게시물을 만들지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (post: StudioPostSummary) => {
    const title = post.title || '제목 없는 게시물'
    const confirmed = window.confirm(
      `"${title}" 게시물을 삭제하시겠습니까?\n\n삭제 후 내 게시물 목록에서 제거됩니다.`
    )

    if (!confirmed) return

    setDeletingPostId(post.postId)
    try {
      await repository.deletePost(user.id, post.postId)
      setPosts(current => current.filter(item => item.postId !== post.postId))
    } catch (error) {
      console.error('[Posting Builder] 게시물 삭제 실패', error)
      window.alert('게시물을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setDeletingPostId(null)
    }
  }

  const saveNow = useCallback(async (post: StudioPost, project: BuilderProject) => {
    const serialized = JSON.stringify(project)
    if (serialized === lastSavedJsonRef.current) {
      setSaveState('saved')
      return
    }

    setSaveState('saving')
    try {
      await repository.updatePost(post.itemId, project.title, project)
      lastSavedJsonRef.current = serialized
      setSaveState('saved')
    } catch (error) {
      console.error('[Posting Builder] 자동 저장 실패', error)
      setSaveState('error')
    }
  }, [repository])

  const handleProjectChange = useCallback((project: BuilderProject) => {
    currentProjectRef.current = project
    if (!activePost) return

    const serialized = JSON.stringify(project)
    if (serialized === lastSavedJsonRef.current) return

    setSaveState('saving')
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null
      saveNow(activePost, project).catch(console.error)
    }, 1600)
  }, [activePost, saveNow])

  const backToDirectory = async () => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    if (activePost && currentProjectRef.current) {
      await saveNow(activePost, currentProjectRef.current)
    }

    setActivePost(null)
    currentProjectRef.current = null
    await refreshPosts()
  }

  return (
    <div className="posting-builder-root">
      {activePost ? (
        <PostingBuilderEditor
          key={activePost.postId}
          initialProject={activePost.content}
          onBack={() => { backToDirectory().catch(console.error) }}
          onProjectChange={handleProjectChange}
          saveState={saveState}
        />
      ) : (
        <PostDirectory
          user={user}
          posts={posts}
          loading={loading}
          deletingPostId={deletingPostId}
          onCreate={() => { createPost().catch(console.error) }}
          onOpen={postId => { openPost(postId).catch(console.error) }}
          onDelete={post => { deletePost(post).catch(console.error) }}
          onBackToSquare={onBackToSquare}
        />
      )}
    </div>
  )
}
