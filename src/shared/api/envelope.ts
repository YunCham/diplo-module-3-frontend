export interface ApiError {
  field: string | null
  message: string
}

export interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T | null
  errors: ApiError[]
  timestamp: string
  path: string
}
