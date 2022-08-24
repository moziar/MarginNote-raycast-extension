import { Entry } from "fast-glob"
export interface Notebook {
  id: string
  title: string
  lastVisit: string
  type: 1 | 2
}

export type NotebookFilter = "all" | "mindmap" | "flashcard"
export interface SearchNotebookState {
  notebooks: Notebook[] | undefined
  loading: boolean
  error?: Error
}

export type Doc = Entry
export interface SearchDocState {
  docs: Doc[]
  loading: boolean
  error?: Error
}
