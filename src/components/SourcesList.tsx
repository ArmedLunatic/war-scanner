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
    <ul className="space-y-1">
      {shown.map((src, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className="text-gray-400 mt-0.5">↗</span>
          <div className="min-w-0">
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate block"
            >
              {src.source_name ?? src.domain ?? src.url}
            </a>
            {src.published_at && (
              <time className="text-xs text-gray-400">
                {new Date(src.published_at).toLocaleString()}
              </time>
            )}
          </div>
        </li>
      ))}
      {sources.length > max && (
        <li className="text-xs text-gray-400">
          +{sources.length - max} more sources
        </li>
      )}
    </ul>
  );
}
