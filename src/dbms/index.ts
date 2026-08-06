// Registry for the DBMS placement module. Add a topic file under ./topics and
// register it here — ordering, unit grouping and prev/next all follow from `num`.

import { createModule } from '../content/module';

import dbmsBasics from './topics/dbmsBasics';
import dbmsArchitecture from './topics/dbmsArchitecture';
import dataModels from './topics/dataModels';
import erModel from './topics/erModel';
import eerModel from './topics/eerModel';
import erToRelational from './topics/erToRelational';
import relationalModel from './topics/relationalModel';
import integrityConstraints from './topics/integrityConstraints';
import relationalAlgebra from './topics/relationalAlgebra';
import relationalCalculus from './topics/relationalCalculus';
import functionalDependencies from './topics/functionalDependencies';
import normalForms from './topics/normalForms';
import higherNormalForms from './topics/higherNormalForms';
import transactionsAcid from './topics/transactionsAcid';
import schedulesSerializability from './topics/schedulesSerializability';
import concurrencyControl from './topics/concurrencyControl';
import deadlocks from './topics/deadlocks';
import isolationLevels from './topics/isolationLevels';
import recovery from './topics/recovery';
import fileOrganization from './topics/fileOrganization';
import indexing from './topics/indexing';
import bTrees from './topics/bTrees';
import hashing from './topics/hashing';
import queryProcessing from './topics/queryProcessing';
import nosqlCap from './topics/nosqlCap';

export const dbmsModule = createModule({
  key: 'dbms',
  nav: 'DBMS',
  eyebrow: 'Placement prep, visualized',
  title: 'DBMS for Interviews',
  back: '← DBMS module',
  intro: ({ topics, hours }) =>
    `${topics} topics covering the complete DBMS syllabus that campus and off-campus interviews actually ask — ` +
    `written in plain English, every concept drawn as a diagram, and each topic closing with the questions ` +
    `interviewers repeat. About ${hours} hours end to end.`,
  topics: [
    dbmsBasics,
    dbmsArchitecture,
    dataModels,
    erModel,
    eerModel,
    erToRelational,
    relationalModel,
    integrityConstraints,
    relationalAlgebra,
    relationalCalculus,
    functionalDependencies,
    normalForms,
    higherNormalForms,
    transactionsAcid,
    schedulesSerializability,
    concurrencyControl,
    deadlocks,
    isolationLevels,
    recovery,
    fileOrganization,
    indexing,
    bTrees,
    hashing,
    queryProcessing,
    nosqlCap,
  ],
});

export const dbmsTopics = dbmsModule.topics;
