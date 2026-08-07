// Registry for the System Design placement module. Add a topic file under
// ./topics and register it here — ordering, unit grouping and prev/next all
// follow from `num`.

import { createModule } from '../content/module';

import verticalVsHorizontal from './topics/verticalVsHorizontal';
import latencyVsThroughput from './topics/latencyVsThroughput';
import availabilitySlaSloSli from './topics/availabilitySlaSloSli';
import capTheorem from './topics/capTheorem';
import consistencyModels from './topics/consistencyModels';
import loadBalancing from './topics/loadBalancing';
import reverseVsForwardProxy from './topics/reverseVsForwardProxy';
import apiGateway from './topics/apiGateway';
import cdn from './topics/cdn';
import dnsBasics from './topics/dnsBasics';
import rateLimitingThrottling from './topics/rateLimitingThrottling';
import sqlVsNosql from './topics/sqlVsNosql';
import indexing from './topics/indexing';
import replication from './topics/replication';
import sharding from './topics/sharding';
import consistentHashing from './topics/consistentHashing';
import cachingStrategies from './topics/cachingStrategies';
import acidTransactions from './topics/acidTransactions';
import messageQueues from './topics/messageQueues';
import pubSub from './topics/pubSub';
import eventDrivenArchitecture from './topics/eventDrivenArchitecture';
import webhooksVsPolling from './topics/webhooksVsPolling';
import monolithVsMicroservices from './topics/monolithVsMicroservices';
import serviceDiscovery from './topics/serviceDiscovery';
import circuitBreaker from './topics/circuitBreaker';
import idempotency from './topics/idempotency';
import faultTolerance from './topics/faultTolerance';
import observability from './topics/observability';
import encapsulation from './topics/encapsulation';
import abstraction from './topics/abstraction';
import inheritance from './topics/inheritance';
import polymorphism from './topics/polymorphism';
import compositionOverInheritance from './topics/compositionOverInheritance';
import interfaceVsAbstractClass from './topics/interfaceVsAbstractClass';
import singleResponsibility from './topics/singleResponsibility';
import openClosed from './topics/openClosed';
import liskovSubstitution from './topics/liskovSubstitution';
import interfaceSegregation from './topics/interfaceSegregation';
import dependencyInversion from './topics/dependencyInversion';
import singleton from './topics/singleton';
import factory from './topics/factory';
import builder from './topics/builder';
import observer from './topics/observer';
import strategy from './topics/strategy';
import decorator from './topics/decorator';
import adapter from './topics/adapter';
import state from './topics/state';
import threadsProcesses from './topics/threadsProcesses';
import locksMutexSemaphore from './topics/locksMutexSemaphore';
import raceConditionsDeadlocks from './topics/raceConditionsDeadlocks';
import producerConsumer from './topics/producerConsumer';
import classDiagrams from './topics/classDiagrams';
import sequenceDiagrams from './topics/sequenceDiagrams';
import associationAggregationComposition from './topics/associationAggregationComposition';
import sdRevision from './topics/sdRevision';

export const sdModule = createModule({
  key: 'sd',
  nav: 'System Design',
  eyebrow: 'HLD + LLD, visualized',
  title: 'System Design for Interviews',
  back: '← System Design module',
  intro: ({ topics, hours }) =>
    `${topics} topics covering the complete HLD + LLD field manual freshers actually get asked — ` +
    `every concept opens with a plain-English analogy before the technical explanation, a concrete example, and ` +
    `the trade-off to watch for. About ${hours} hours end to end, closing with two fully worked interview problems.`,
  topics: [
    verticalVsHorizontal,
    latencyVsThroughput,
    availabilitySlaSloSli,
    capTheorem,
    consistencyModels,
    loadBalancing,
    reverseVsForwardProxy,
    apiGateway,
    cdn,
    dnsBasics,
    rateLimitingThrottling,
    sqlVsNosql,
    indexing,
    replication,
    sharding,
    consistentHashing,
    cachingStrategies,
    acidTransactions,
    messageQueues,
    pubSub,
    eventDrivenArchitecture,
    webhooksVsPolling,
    monolithVsMicroservices,
    serviceDiscovery,
    circuitBreaker,
    idempotency,
    faultTolerance,
    observability,
    encapsulation,
    abstraction,
    inheritance,
    polymorphism,
    compositionOverInheritance,
    interfaceVsAbstractClass,
    singleResponsibility,
    openClosed,
    liskovSubstitution,
    interfaceSegregation,
    dependencyInversion,
    singleton,
    factory,
    builder,
    observer,
    strategy,
    decorator,
    adapter,
    state,
    threadsProcesses,
    locksMutexSemaphore,
    raceConditionsDeadlocks,
    producerConsumer,
    classDiagrams,
    sequenceDiagrams,
    associationAggregationComposition,
    sdRevision,
  ],
});

export const sdTopics = sdModule.topics;
