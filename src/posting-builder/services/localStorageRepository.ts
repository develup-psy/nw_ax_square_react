import type { BuilderProject } from '../types/project'
import type { CreateStudioPostInput, PostingBuilderRepository, StudioPost, StudioPostSummary } from '../studio/types'

const STORAGE_KEY = 'nw-ax-square-posting-builder-posts-v1'

type StoredPost = StudioPost

function readAll(): StoredPost[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredPost[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(posts: StoredPost[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

function nextItemId(posts: StoredPost[]) {
  return posts.reduce((max, post) => Math.max(max, post.itemId), 0) + 1
}

export function createLocalStorageRepository(): PostingBuilderRepository {
  return {
    async listPosts(userId: string): Promise<StudioPostSummary[]> {
      return readAll()
        .filter(post => post.userId === userId)
        .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
        .map(post => ({
          itemId: post.itemId,
          postId: post.postId,
          title: post.title,
          modified: post.modified,
        }))
    },

    async getPost(userId: string, postId: string): Promise<StudioPost | null> {
      const post = readAll().find(item => item.userId === userId && item.postId === postId)
      return post ?? null
    },

    async createPost(input: CreateStudioPostInput): Promise<StudioPost> {
      const posts = readAll()
      const now = new Date().toISOString()
      const post: StudioPost = {
        itemId: nextItemId(posts),
        postId: input.postId,
        userId: input.userId,
        title: input.title,
        content: input.content,
        modified: now,
      }
      writeAll([...posts, post])
      return post
    },

    async updatePost(itemId: number, title: string, content: BuilderProject): Promise<void> {
      const posts = readAll()
      const index = posts.findIndex(post => post.itemId === itemId)
      if (index === -1) throw new Error('저장할 게시물을 찾지 못했습니다.')
      posts[index] = {
        ...posts[index],
        title,
        content,
        modified: new Date().toISOString(),
      }
      writeAll(posts)
    },

    async deletePost(userId: string, postId: string): Promise<void> {
      const posts = readAll()
      const nextPosts = posts.filter(post => !(post.userId === userId && post.postId === postId))
      if (nextPosts.length === posts.length) {
        throw new Error('삭제할 게시물을 찾지 못했습니다.')
      }
      writeAll(nextPosts)
    },
  }
}
