type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="px-5 pb-4 pt-6">
      <div className="inline-flex rounded-lg bg-lime-100 px-2.5 py-1 text-xs font-semibold text-lime-800">
        Fit Diet MVP
      </div>
      <h1 className="mt-3 text-2xl font-semibold tracking-normal text-zinc-950">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm leading-6 text-zinc-500">{subtitle}</p> : null}
    </header>
  );
}
