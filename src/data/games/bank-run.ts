import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

export const game: GameDefinition = {
  id: 'bank-run',
  title: 'Bank Run',
  shortDescription:
    'Two depositors hold funds in a bank whose reserves can only cover one early withdrawal in full. Simplified into a sequential game — Depositor A moves first and Depositor B observes before deciding — to ask whether observability can prevent a self-fulfilling run.',
  concepts: ['backward-induction'],
  representation: {
    kind: 'extensive-form',
    players: ['Depositor A', 'Depositor B'],
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'decision',
        player: 'Depositor A',
        actions: [
          { label: 'Withdraw', targetNodeId: 'b-after-withdraw' },
          { label: 'Wait', targetNodeId: 'b-after-wait' },
        ],
      },
      'b-after-withdraw': {
        id: 'b-after-withdraw',
        type: 'decision',
        player: 'Depositor B',
        actions: [
          { label: 'Withdraw', targetNodeId: 'both-withdraw' },
          { label: 'Wait', targetNodeId: 'a-out-b-wiped' },
        ],
      },
      'b-after-wait': {
        id: 'b-after-wait',
        type: 'decision',
        player: 'Depositor B',
        actions: [
          { label: 'Withdraw', targetNodeId: 'b-out-a-wiped' },
          { label: 'Wait', targetNodeId: 'both-wait' },
        ],
      },
      'both-withdraw': { id: 'both-withdraw', type: 'terminal', payoffs: { 'Depositor A': 1, 'Depositor B': 1 } },
      'a-out-b-wiped': { id: 'a-out-b-wiped', type: 'terminal', payoffs: { 'Depositor A': 2, 'Depositor B': 0 } },
      'b-out-a-wiped': { id: 'b-out-a-wiped', type: 'terminal', payoffs: { 'Depositor A': 0, 'Depositor B': 2 } },
      'both-wait': { id: 'both-wait', type: 'terminal', payoffs: { 'Depositor A': 3, 'Depositor B': 3 } },
    },
  },
}

export const questions: Question[] = [
  {
    id: 'bankrun-b-after-withdraw',
    gameId: game.id,
    type: 'node-decision',
    prompt: 'If Depositor A withdraws early, what should Depositor B do?',
    concept: 'backward-induction',
    locator: { kind: 'node', nodeId: 'b-after-withdraw' },
    answer: { kind: 'action', correct: 'Withdraw' },
    misconceptions: [],
    explanation:
      "Once A has already pulled out, the bank's reserves are gone — waiting nets B only 0, while also withdrawing immediately nets 1. B should join the run.",
  },
  {
    id: 'bankrun-b-after-wait',
    gameId: game.id,
    type: 'node-decision',
    prompt: 'If Depositor A waits, what should Depositor B do?',
    concept: 'backward-induction',
    locator: { kind: 'node', nodeId: 'b-after-wait' },
    answer: { kind: 'action', correct: 'Wait' },
    misconceptions: [],
    explanation:
      "With A's deposit still in the bank, waiting yields B the full patient payoff of 3, versus 2 for withdrawing early. There's no reason to panic if the other depositor hasn't.",
  },
  {
    id: 'bankrun-a-decision',
    gameId: game.id,
    type: 'node-decision',
    prompt: "Anticipating Depositor B's best response either way, what should Depositor A do first?",
    concept: 'backward-induction',
    locator: { kind: 'node', nodeId: 'root' },
    answer: { kind: 'action', correct: 'Wait' },
    misconceptions: [],
    explanation:
      'Withdrawing early triggers B to also withdraw (both get 1), but waiting leads B to wait too (both get 3) — so waiting is strictly better for A. Because B can observe A\'s choice before acting, the sequential structure lets both depositors reach the run-free outcome, unlike a simultaneous-move version where uncertainty about the other\'s action can create a self-fulfilling panic.',
  },
]
