import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ReviewPage } from '../../pages/ReviewPage'
import { ProgressProvider } from '../../persistence/progressStore'

function renderReviewPage() {
  return render(
    <MemoryRouter>
      <ProgressProvider>
        <ReviewPage />
      </ProgressProvider>
    </MemoryRouter>,
  )
}

describe('ReviewPage', () => {
  it('renders a full session of 10 questions with a submit control', () => {
    renderReviewPage()
    expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })
})
