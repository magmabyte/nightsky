export const CATEGORIES = [
  { value: "painting", label: "Painting", icon: "🖌️" },
  { value: "power-tools", label: "Power Tools", icon: "🔌" },
  { value: "hand-tools", label: "Hand Tools", icon: "🔧" },
  { value: "gardening", label: "Gardening", icon: "🌱" },
  { value: "cleaning", label: "Cleaning", icon: "🧹" },
  { value: "moving", label: "Moving & Lifting", icon: "📦" },
  { value: "kitchen", label: "Kitchen", icon: "🍳" },
  { value: "electronics", label: "Electronics", icon: "💡" },
  { value: "sports", label: "Sports & Outdoors", icon: "⚽" },
  { value: "other", label: "Other", icon: "🔩" },
] as const;

export function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getCategoryIcon(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.icon ?? "🔩";
}
