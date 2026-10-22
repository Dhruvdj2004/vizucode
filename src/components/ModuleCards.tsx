import { Link } from 'react-router-dom';
import { moduleStats } from '../content/module';
import type { ModuleLink } from '../content/registry';
import { EmojiIcon } from './Icon';

/**
 * A responsive grid of module entry-point cards. Topic counts are derived from
 * each registry, so the copy can never drift from the content that exists.
 */
export default function ModuleCards({ links }: { links: ModuleLink[] }) {
  return (
    <div className="mod-row">
      {links.map(({ mod, icon, tint }) => {
        const s = moduleStats(mod);
        return (
          <Link key={mod.key} to={`/${mod.key}`} className={`panel mod-cta ${tint}`}>
            <span className="mod-cta-icon" aria-hidden>
              <EmojiIcon emoji={icon} size={22} />
            </span>
            <span className="mod-cta-body">
              <span className="mod-cta-title">{mod.title}</span>
              <span className="mod-cta-meta mono">
                {s.topics} topics · ~{s.hours} h{s.free > 0 && ` · ${s.free} free`}
              </span>
            </span>
            <span className="mod-cta-go" aria-hidden>
              →
            </span>
          </Link>
        );
      })}
    </div>
  );
}
