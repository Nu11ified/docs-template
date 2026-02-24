interface VersionPickerProps {
  versions: Array<{ label: string; path: string }>;
  currentVersion: string;
}

export function VersionPicker({ versions, currentVersion }: VersionPickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPath = e.target.value;
    if (selectedPath !== currentVersion) {
      window.location.href = `/docs/${selectedPath}/`;
    }
  };

  return (
    <select
      value={currentVersion}
      onChange={handleChange}
      aria-label="Select documentation version"
      className="hidden sm:inline-flex items-center rounded-md border border-[var(--site-text)]/10 bg-[var(--site-surface)] px-2 py-1 text-xs font-medium text-[var(--site-text)] hover:border-[var(--site-text)]/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)]/40"
    >
      {versions.map((v) => (
        <option key={v.path} value={v.path}>
          {v.label}
        </option>
      ))}
    </select>
  );
}
