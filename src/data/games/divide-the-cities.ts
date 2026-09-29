import { pick } from '../../engine/random'
import type { RNG } from '../../engine/random'
import type { GameDefinition, ScenarioGame } from '../../types/game'
import type { Question } from '../../types/question'

const GAME_ID = 'divide-the-cities'

interface Variant {
  cityList: string
  focalOption: string
  focalExplanation: string
}

const VARIANTS: Variant[] = [
  {
    cityList: 'New York, Boston, Miami, Los Angeles, San Francisco, Seattle',
    focalOption: '{New York, Boston, Miami} vs. {Los Angeles, San Francisco, Seattle} — East Coast vs. West Coast',
    focalExplanation:
      'East Coast vs. West Coast is the focal point: it\'s the grouping that feels obviously salient to nearly everyone.',
  },
  {
    cityList: 'Minneapolis, Chicago, Boston, Houston, Miami, Atlanta',
    focalOption: '{Minneapolis, Chicago, Boston} vs. {Houston, Miami, Atlanta} — North vs. South',
    focalExplanation: 'North vs. South is the focal point: it\'s the grouping that feels obviously salient to nearly everyone.',
  },
  {
    cityList: 'San Francisco, New York, Miami, Denver, Dallas, Nashville',
    focalOption: '{San Francisco, New York, Miami} vs. {Denver, Dallas, Nashville} — Coastal vs. Inland',
    focalExplanation: 'Coastal vs. Inland is the focal point: it\'s the grouping that feels obviously salient to nearly everyone.',
  },
]

export function generateInstance(rng: RNG = Math.random): { game: GameDefinition; questions: Question[] } {
  const variant = pick(rng, VARIANTS)

  const representation: ScenarioGame = {
    kind: 'scenario',
    players: ['You', 'Partner'],
    setupText: `You and a partner are each shown this list of six US cities: ${variant.cityList}. Independently and without communicating, you must each split the list into two groups of three. You win only if your grouping exactly matches your partner's.`,
  }

  const game: GameDefinition = {
    id: GAME_ID,
    title: "Schelling's Divide the Cities",
    shortDescription:
      "You and a partner must each independently split a list of cities into two groups. You win only if your split exactly matches your partner's — but you can't communicate. Success depends on finding the grouping that feels obviously \"right\" to both of you.",
    concepts: ['focal-points'],
    representation,
  }

  const questions: Question[] = [
    {
      id: 'dividecities-focal-split',
      gameId: GAME_ID,
      type: 'focal-point-prediction',
      prompt: 'Which split are you and your partner most likely to converge on, without communicating?',
      concept: 'focal-points',
      locator: { kind: 'none' },
      answer: {
        kind: 'multiple-choice',
        options: [
          variant.focalOption,
          'First three alphabetically vs. last three alphabetically',
          'Cities with longer names vs. cities with shorter names',
          'A coin-flip 3-3 split — any grouping is equally likely',
        ],
        correctIndex: 0,
      },
      misconceptions: [],
      explanation: `There's no formally "correct" split in a pure coordination game — any 3-3 grouping is an equilibrium if both players happen to pick it. But ${variant.focalExplanation} so uncoordinated players converge on it far more often than chance would predict. This is Schelling's key insight — coordination is often solved by shared cultural intuition about what feels "obviously right," not by formal reasoning.`,
    },
    {
      id: 'dividecities-no-focal-point',
      gameId: GAME_ID,
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
        "Focal points only help when salience actually exists. Remove the obvious grouping structure and there's no shared cue left to coordinate on — success rates in real experiments drop toward what you'd expect from random guessing. This is the flip side of Schelling's insight: focal points are a property of the specific situation, not a guarantee that coordination games are always easy to solve.",
    },
  ]

  return { game, questions }
}
