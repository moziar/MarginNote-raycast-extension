export interface Notebook {
  id: string
  title: string
  tags: string[]
  created: Date
  lastVisit: Date
}

export interface State {
  notebooks: Notebook[]
  loading: boolean
  error?: Error
}
