import ModuleCards from '../components/ModuleCards';
import { moduleStats } from '../content/module';
import { CORE_MODULES } from '../content/registry';

export default function CorePage() {
  const totals = CORE_MODULES.reduce(
    (a, { mod }) => {
      const s = moduleStats(mod);
      return { topics: a.topics + s.topics, hours: a.hours + s.hours };
    },
    { topics: 0, hours: 0 }
  );

  return (
    <>
      <div className="viz-header">
        <div className="eyebrow">Placement prep, visualized</div>
        <h1 className="page-title">Core Subjects</h1>
        <p className="serif desc">
          The three theory subjects every campus and off-campus interview draws from — {totals.topics} topics in
          all, roughly {totals.hours} hours end to end. Written in plain English, every concept drawn as a diagram,
          and each topic closing with the questions interviewers actually repeat.
        </p>
      </div>

      <ModuleCards links={CORE_MODULES} />

      <div className="panel serif" style={{ color: 'var(--ink-soft)' }}>
        <b style={{ color: 'var(--ink)' }}>Where to start.</b> If interviews are close, do DBMS and OOP first —
        they come up in almost every round, and OOP doubles as design-round preparation. OS pays off most for
        product companies and anywhere systems questions appear. Each module opens with free topics, so you can read
        before committing.
      </div>
    </>
  );
}
