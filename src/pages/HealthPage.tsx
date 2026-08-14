import { useState } from 'react'
import { healthApi } from '../shared/api'
import { Button } from '../shared/components/Button'

export function HealthPage() {
  const [status, setStatus] = useState<{ database: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await healthApi.check()
      setStatus(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Health Check</h1>
      <div className="bg-white dark:bg-brand-deep/30 rounded-xl border border-gray-200 dark:border-brand-deep/50 p-6 max-w-md">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Verificar el estado del servicio</p>
        <Button onClick={checkHealth} isLoading={loading}>Verificar</Button>

        {status && (
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status.database === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Base de datos: {status.database === 'up' ? 'Operativa' : 'Caída'}
            </span>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>
        )}
      </div>
    </div>
  )
}
