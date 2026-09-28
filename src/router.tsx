import { HashRouter, Route, Routes } from 'react-router-dom'
import { GamePage } from './pages/GamePage'
import { HomePage } from './pages/HomePage'
import { QuizPage } from './pages/QuizPage'
import { ReviewPage } from './pages/ReviewPage'

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/quiz/:gameId" element={<QuizPage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </HashRouter>
  )
}
