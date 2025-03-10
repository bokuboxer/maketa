/**
 * Generated by orval v7.5.0 🍺
 * Do not edit manually.
 * FastAPI
 * OpenAPI spec version: 0.1.0
 */
import type { BeliefLabelExplanation } from "./beliefLabelExplanation";
import type { BeliefLabelEvidence } from "./beliefLabelEvidence";
import type { BeliefLabelDisputation } from "./beliefLabelDisputation";
import type { BeliefLabelNewPerspective } from "./beliefLabelNewPerspective";

export interface BeliefLabel {
	id: number;
	description: string;
	type: string;
	explanation?: BeliefLabelExplanation;
	evidence?: BeliefLabelEvidence;
	disputation?: BeliefLabelDisputation;
	new_perspective?: BeliefLabelNewPerspective;
}
