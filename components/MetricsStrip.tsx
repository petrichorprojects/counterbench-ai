type Metric = {
  value: string;
  label: string;
};

export function MetricsStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="cb-metricsStrip" aria-label="Product metrics">
      <div className="container">
        <dl className="cb-metricsStrip__grid">
          {metrics.map((m) => (
            <div key={m.label} className="cb-metric">
              <dt className="cb-metric__value">{m.value}</dt>
              <dd className="cb-metric__label">{m.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

