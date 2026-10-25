import React from 'react';
import { useParams } from 'react-router-dom';

import * as contents from '../panels/systemic_design/index.js';

export default function SystemicDesignContents (props) {
    const {name} = useParams();

    // TODO: lazy loading つかいたいな。
    // https://qiita.com/kakken1988/items/9f14480c8a9f0abf7b3b
    if ('CONNECTOR'===name)
        return <contents.Connector/>;

    if ('SOCIAL_ECOSYSTEM'===name) return <contents.SocialEcosystem/>;
    if ('CONTEXTUAL_VARIATIONS'===name) return <contents.ContextualVariations/>;
    if ('VALUE_PROPOSITION'===name) return <contents.ValueProposition/>;
    if ('SYSTEMS_MAP'===name) return <contents.SystemsMap/>;
    if ('STAKEHOLDER_DIMENSIONS'===name)return <contents.StakeholderDimensions/>;
    if ('THREE_HORIZONS'===name) return <contents.ThreeHorizons/>;
    if ('ITERATIVE_INQUIRY'===name) return <contents.IterativeInquiry/>;
    if ('ACTORS_MAP'===name) return <contents.ActorsMap/>;
    if ('NICHE_DISCOVERY'===name) return <contents.NicheDiscovery/>;
    if ('RICH_CONTEXT'===name) return <contents.RichContext/>;
    if ('RESEARCH_QUESTIONS'===name) return <contents.ResearchQuestions/>;
    if ('CONTEXTUAL_INTERVIEW'===name)return <contents.ContextualInterview/>;
    if ('ACTANTS_MAP'===name) return <contents.ActantsMap/>;
    if ('MULTICAPITALS_SYSTEMS_MAP'===name) return <contents.MulticapitalsSystemsMap/>;
    if ('INFLUENCE_MAP'===name) return <contents.InfluenceMap/>;
    if ('STORY_LOOP_DIAGRAM'===name) return <contents.StoryLoopDiagram/>;
    if ('FUTURE_STATE_SCENARIOS'===name) return <contents.FutureStateScenarios/>;
    if ('INTERVENTION_STRATEGY'===name) return <contents.InterventionStrategy/>;
    if ('THEORY_OF_SYSTEMS_CHANGE_AND_ACTION'===name) return <contents.TheoryOfSystemsChangeAndAction/>;
    if ('PROCESS_ENNEAGRAM'===name) return <contents.ProcessEnneagram/>;
    if ('CHANGE_READINESS'===name) return <contents.ChangeReadiness/>;
    if ('ECOSYSTEM_GOVERNANCE'===name) return <contents.EcosystemGovernance/>;
    if ('ADAPTIVE_CYCLE_STRATEGY'===name)        return <contents.AdaptiveCycleStrategy/>;
    if ('COLLABORATION_MODEL'===name) return <contents.CollaborationModel/>;
    if ('ROADMAP_FOR_TRANSITION_BY_DESIGN'===name) return <contents.RoadmapForTransitionByDesign/>;
    if ('STAKEHOLDER_MOBILISATION'===name) return <contents.StakeholderMobilisation/>;

   return null;
}
