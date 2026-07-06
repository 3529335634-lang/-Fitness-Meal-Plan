type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="px-5 pb-4 pt-6">
      <div className="text-sm text-zinc-500">Fit Diet MVP</div>
      <h1 className="mt-1 text-2xl font-semibold tracking-normal text-zinc-950">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm leading-6 text-zinc-500">{subtitle}</p> : null}
    </header>
  );
}
