interface Source {
  url: string;
  source_name: string | null;
  domain: string | null;
  published_at: string | null;
}

interface SourcesListProps {
  sources: Source[];
  max?: number;
}

export function SourcesList({ sources, max = 10 }: SourcesListProps) {
  const shown = sources.slice(0, max);

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
      {shown.map((src, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <span style={{ color: "var(--accent-blue)", fontSize: "12px", marginTop: "1px", flexShrink: 0 }}>↗</span>
          <div style={{ minWidth: 0 }}>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-hover-blue-soft"
              style={{
                color: "var(--accent-blue)",
                fontSize: "13px",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {src.source_name ?? src.domain ?? src.url}
            </a>
            {src.published_at && (
              <time style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                {new Date(src.published_at).toLocaleString()}
              </time>
            )}
          </div>
        </li>
      ))}
      {sources.length > max && (
        <li style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
          +{sources.length - max} more sources
        </li>
      )}
    </ul>
  );
}
