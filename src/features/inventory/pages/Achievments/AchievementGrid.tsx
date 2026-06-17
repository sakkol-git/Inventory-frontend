import { ProductCard } from "@/components/ui/ProductCard";
import type { Achievement } from "@/shared/types/index";
import { Award, Users } from "lucide-react";
import { formatDisplayDate } from "@/features/inventory/pages/chemical/useChemicalsView"; // reusable formatter

interface AchievementGridProps {
  items: Achievement[];
  onManageAssignments: (a: Achievement) => void;
  onEdit: (a: Achievement) => void;
  onDelete: (a: Achievement) => void;
  onNavigate: (id: number) => void;
}

export const AchievementGrid = ({
  items,
  onManageAssignments,
  onEdit,
  onDelete,
  onNavigate,
}: AchievementGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
    {items.map((achievement) => (
      <AchievementCard
        key={achievement.id}
        item={achievement}
        onManageAssignments={onManageAssignments}
        onEdit={onEdit}
        onDelete={onDelete}
        onNavigate={onNavigate}
      />
    ))}
  </div>
);

const AchievementCard = ({
  item,
  onManageAssignments,
  onEdit,
  onDelete,
  onNavigate,
}: {
  item: Achievement;
  onManageAssignments: (a: Achievement) => void;
  onEdit: (a: Achievement) => void;
  onDelete: (a: Achievement) => void;
  onNavigate: (id: number) => void;
}) => {
  return (
    <ProductCard
      image={item.image || undefined}
      fallbackImage={
        <>
          <Award className="h-16 w-16 transition-transform duration-200 group-hover:scale-110 text-primary" strokeWidth={1.2} />
        </>
      }
      title={item.achievement_name}
      subtitle={item.description || "No description"}
      id={`#${item.id}`}
      statusBadge={
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-secondary text-secondary-foreground">
          {item.criteria?.type}: {item.criteria?.value}
        </span>
      }
      meta={[
        { icon: Users, value: `${item.assigned_user_ids?.length || 0} assigned` },
      ]}
      onClick={() => onNavigate(item.id)}
      onEdit={() => onEdit(item)}
      onDelete={() => onDelete(item)}
      className="aspect-square"
      imageBackgroundColor="bg-primary/5 border-primary/20"
      customActions={[
        {
          label: "Manage Assignments",
          icon: <Users className="mr-2 h-4 w-4" />,
          onClick: () => onManageAssignments(item),
        }
      ]}
    />
  );
};
