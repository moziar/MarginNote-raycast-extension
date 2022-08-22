export interface Notebook {
  id: string
  title: string
  lastVisit: string
  type: 1 | 2
}

export type NotebookFilter = "all" | "mindmap" | "flashcard"
export interface State {
  notebooks: Notebook[]
  loading: boolean
  error?: Error
}
