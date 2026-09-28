import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

export const game: GameDefinition = {
  id: 'divide-the-cities',
  title: "Schelling's Divide the Cities",
  shortDescription:
    "You and a partner must each independently split a list of cities into two groups. You win only if your split exactly matches your partner's — but you can't communicate. Success depends on finding the grouping that feels obviously \"right\" to both of you.",
  concepts: ['focal-points'],
  representation: {
    kind: 'scenario',
    players: ['You', 'Partner'],
    setupText:
      'You and a partner are each shown this list of six US cities: New York, Boston, Miami, Los Angeles, San Francisco, Seattle. Independently and without communicating, you must each split the list into two groups of three. You win only if your grouping exactly matches your partner\'s.',
  },
}

export const questions: Question[] = [
  {
    id: 'dividecities-focal-split',
    gameId: game.id,
    type: 'focal-point-prediction',
    prompt: 'Which split are you and your partner most likely to converge on, without communicating?',
    concept: 'focal-points',
    locator: { kind: 'none' },
    answer: {
      kind: 'multiple-choice',
      options: [
        '{New York, Boston, Miami} vs. {Los Angeles, San Francisco, Seattle} — East Coast vs. West Coast',
        'First three alphabetically vs. last three alphabetically',
        'Cities with longer names vs. cities with shorter names',
        'A coin-flip 3-3 split — any grouping is equally likely',
      ],
      correctIndex: 0,
    },
    misconceptions: [],
    explanation:
      'There\'s no formally "correct" split in a pure coordination game — any 3-3 grouping is an equilibrium if both players happen to pick it. But East Coast vs. West Coast is the focal point: it\'s the grouping that feels obviously salient to nearly everyone, so uncoordinated players converge on it far more often than chance would predict. This is Schelling\'s key insight — coordination is often solved by shared cultural intuition about what feels "obviously right," not by formal reasoning.',
  },
  {
    id: 'dividecities-no-focal-point',
    gameId: game.id,
    type: 'focal-point-prediction',
    prompt:
      'Now imagine the list is six similarly-sized midwestern cities with no obvious natural grouping (say, by population, industry, or geography). What happens to your odds of matching your partner?',
    concept: 'focal-points',
    locator: { kind: 'none' },
    answer: {
      kind: 'multiple-choice',
      options: [
        'Coordination becomes much harder — without a salient split, success is close to chance',
        'Players still reliably converge on some split, since symmetry guarantees it',
        'The game turns into one with a dominant strategy',
        "It doesn't matter — focal points aren't necessary for coordination games",
      ],
      correctIndex: 0,
    },
    misconceptions: [],
    explanation:
      "Focal points only help when salience actually exists. Remove the obvious East/West structure and there's no shared cue left to coordinate on — success rates in real experiments drop toward what you'd expect from random guessing. This is the flip side of Schelling's insight: focal points are a property of the specific situation, not a guarantee that coordination games are always easy to solve.",
  },
]
