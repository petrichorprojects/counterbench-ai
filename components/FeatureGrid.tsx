type Feature = {
  title: string;
  description: string;
  meta?: string;
};

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <dl className="cb-featureGrid" aria-label="Key capabilities">
      {features.map((f) => (
        <div key={f.title} className="cb-feature">
          <dt className="cb-feature__title">{f.title}</dt>
          <dd className="cb-feature__desc">{f.description}</dd>
          {f.meta ? <dd className="cb-feature__meta">{f.meta}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
