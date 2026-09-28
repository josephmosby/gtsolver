import { dominanceStrictVsWeak } from './dominanceStrictVsWeak'
import { nashVsPareto } from './nashVsPareto'
import type { Diagnostic } from './types'

export const diagnostics: Diagnostic[] = [nashVsPareto, dominanceStrictVsWeak]

export type { Diagnostic, DiagnosticContext } from './types'
