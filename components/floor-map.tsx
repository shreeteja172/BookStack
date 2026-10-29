type Copy = {
  id: string;
  barcode: string;
  floor: string;
  shelf: string;
  row: string;
  status: string;
};

const DEFAULT_SHELVES = ["A", "B", "C", "D", "E", "F"];
const SHELF_WIDTH = 150;
const SHELF_HEIGHT = 34;
const COLUMNS = 3;

export function FloorMap({ copies }: { copies: Copy[] }) {
  const floors = [...new Set(copies.map((copy) => copy.floor))].sort();

  if (floors.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-4">
      {floors.map((floor) => (
        <FloorPlan key={floor} floor={floor} copies={copies.filter((copy) => copy.floor === floor)} />
      ))}
      <div className="flex flex-wrap gap-4 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-brand" /> On shelf
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-ember" /> Out or held
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-line" /> Other titles
        </span>
      </div>
    </div>
  );
}

function FloorPlan({ floor, copies }: { floor: string; copies: Copy[] }) {
  const shelves = [...new Set([...DEFAULT_SHELVES, ...copies.map((copy) => copy.shelf)])].sort();
  const rowCount = Math.max(6, ...copies.map((copy) => Number(copy.row) || 0));
  const gridRows = Math.ceil(shelves.length / COLUMNS);
  const width = 40 + COLUMNS * SHELF_WIDTH + (COLUMNS - 1) * 30 + 40;
  const height = 70 + gridRows * (SHELF_HEIGHT + 46) + 30;
  const segment = SHELF_WIDTH / rowCount;
  const firstAvailable = copies.find((copy) => copy.status === "available");

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-canvas p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold">Floor {floor}</span>
        <span className="text-muted">
          {copies.length} cop{copies.length === 1 ? "y" : "ies"} here
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={`Map of floor ${floor}`}>
        <rect x="4" y="4" width={width - 8} height={height - 8} rx="14" fill="none" stroke="var(--color-line)" strokeWidth="2" />
        <rect x={width / 2 - 40} y={height - 10} width="80" height="8" rx="3" fill="var(--color-brand)" />
        <text x={width / 2} y={height - 18} textAnchor="middle" fontSize="11" fill="var(--color-muted)">
          Entrance
        </text>
        <text x="24" y="34" fontSize="11" fill="var(--color-muted)">
          Rows run left to right, 1 to {rowCount}
        </text>

        {shelves.map((shelf, index) => {
          const column = index % COLUMNS;
          const line = Math.floor(index / COLUMNS);
          const x = 40 + column * (SHELF_WIDTH + 30);
          const y = 60 + line * (SHELF_HEIGHT + 46);
          const here = copies.filter((copy) => copy.shelf === shelf);

          return (
            <g key={shelf}>
              <text x={x} y={y - 8} fontSize="12" fontWeight="700" fill={here.length > 0 ? "var(--color-ink)" : "var(--color-muted)"}>
                Shelf {shelf}
              </text>
              {Array.from({ length: rowCount }, (_, rowIndex) => {
                const rowCopies = here.filter((copy) => Number(copy.row) === rowIndex + 1);
                const fill =
                  rowCopies.length === 0
                    ? "var(--color-line)"
                    : rowCopies.some((copy) => copy.status === "available")
                      ? "var(--color-brand)"
                      : "var(--color-ember)";

                return (
                  <rect
                    key={rowIndex}
                    x={x + rowIndex * segment + 1}
                    y={y}
                    width={segment - 2}
                    height={SHELF_HEIGHT}
                    rx="4"
                    fill={fill}
                  >
                    <title>
                      {rowCopies.length > 0
                        ? `Shelf ${shelf}, row ${rowIndex + 1}: ${rowCopies.map((copy) => copy.barcode).join(", ")}`
                        : `Shelf ${shelf}, row ${rowIndex + 1}`}
                    </title>
                  </rect>
                );
              })}
              {firstAvailable && firstAvailable.shelf === shelf ? (
                <g>
                  <circle
                    className="pin-pulse"
                    cx={x + (Number(firstAvailable.row) - 0.5) * segment}
                    cy={y + SHELF_HEIGHT / 2}
                    r="6"
                    fill="var(--color-brand-light)"
                  />
                  <circle
                    cx={x + (Number(firstAvailable.row) - 0.5) * segment}
                    cy={y + SHELF_HEIGHT / 2}
                    r="5"
                    fill="#fff"
                  />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
