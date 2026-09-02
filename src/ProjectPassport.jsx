import React from 'react';

export default function ProjectPassport({ items = [], compact = false }) {
  return (
    <dl className={`projectPassport${compact ? ' isCompact' : ''}`} aria-label="项目履历">
      {items.map(({ label, value }) => (
        <div key={`${label}-${value}`}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
