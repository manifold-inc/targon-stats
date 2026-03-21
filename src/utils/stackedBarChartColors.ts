/** Stacked bar payload (shared with BarChart and targets payout graph). */
export type StackedDataItem = {
  key: string;
  segments: Array<{ value: number; label?: string }>;
};

/** Same palette order as the stacked payout bar chart. */
export const STACKED_BAR_DEFAULT_COLORS = [
  "#52ABFF",
  "#58E8B5",
  "#FFC45B",
  "#FF815B",
  "#A78BFA",
  "#F472B6",
  "#34D399",
  "#FBBF24",
] as const;

export type StackedSegmentLabel = { segments: Array<{ label?: string }> };

export function buildLabelColorMapFromStackedData(
  data: StackedSegmentLabel[]
): Map<string, string> {
  const uniqueLabels: string[] = [];
  for (const item of data) {
    for (const seg of item.segments) {
      if (seg.label && !uniqueLabels.includes(seg.label)) {
        uniqueLabels.push(seg.label);
      }
    }
  }
  const map = new Map<string, string>();
  uniqueLabels.forEach((label, index) => {
    map.set(
      label,
      STACKED_BAR_DEFAULT_COLORS[index % STACKED_BAR_DEFAULT_COLORS.length]!
    );
  });
  return map;
}
