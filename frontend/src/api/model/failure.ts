/**
 * Generated by orval v7.5.0 🍺
 * Do not edit manually.
 * FastAPI
 * OpenAPI spec version: 0.1.0
 */
import type { FailureConclusion } from './failureConclusion';
import type { Element } from './element';

export interface Failure {
  id: number;
  description: string;
  self_score: number;
  created_at: string;
  conclusion: FailureConclusion;
  elements: Element[];
}
