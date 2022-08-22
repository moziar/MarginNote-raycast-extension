export interface Notebook {
  id: string
  title: string
  lastVisit: string
}

export interface State {
  notebooks: Notebook[]
  loading: boolean
  error?: Error
}
