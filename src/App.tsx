import { ProgressProvider } from './persistence/progressStore'
import { AppRouter } from './router'

function App() {
  return (
    <ProgressProvider>
      <main className="app-shell">
        <AppRouter />
      </main>
    </ProgressProvider>
  )
}

export default App
