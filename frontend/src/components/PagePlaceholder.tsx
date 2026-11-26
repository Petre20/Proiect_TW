export function PagePlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <main className="mx-auto grid max-w-3xl gap-3 p-6 lg:p-10">
      <h1 className="text-3xl">{title}</h1>
      <p className="text-muted-foreground">{note}</p>
      <div className="rounded-3xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
        Not built yet. Scaffold placeholder.
      </div>
    </main>
  )
}
