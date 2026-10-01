import type { BuilderProject } from '../types/project'

export type StudioUser = {
  id: string
  name: string
  email?: string
}

export type StudioPostSummary = {
  itemId: number
  postId: string
  title: string
  modified: string
}

export type StudioPost = StudioPostSummary & {
  userId: string
  content: BuilderProject
}

export type CreateStudioPostInput = {
  userId: string
  title: string
  postId: string
  content: BuilderProject
}

export interface PostingBuilderRepository {
  listPosts(userId: string): Promise<StudioPostSummary[]>
  getPost(userId: string, postId: string): Promise<StudioPost | null>
  createPost(input: CreateStudioPostInput): Promise<StudioPost>
  updatePost(itemId: number, title: string, content: BuilderProject): Promise<void>
  deletePost(userId: string, postId: string): Promise<void>
}
