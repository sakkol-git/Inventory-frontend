import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreAchievementPayload } from "@/shared/types/schemas";
import type { UseFormReturn } from "react-hook-form";

type AchievementFormFieldsProps = {
  form: UseFormReturn<StoreAchievementPayload>;
};

export const AchievementFormFields = ({ form }: AchievementFormFieldsProps) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="achievement-name">Name *</Label>
        <Input id="achievement-name" {...register("achievement_name")} />
        {errors.achievement_name?.message ? (
          <p className="text-xs text-destructive">{errors.achievement_name.message}</p>
        ) : null}
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <Input {...register("description")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Criteria Type *</Label>
          <Input {...register("criteria_type")} placeholder="e.g. borrows_count" />
          {errors.criteria_type?.message ? (
            <p className="text-xs text-destructive">{errors.criteria_type.message}</p>
          ) : null}
        </div>
        <div className="space-y-1">
          <Label>Criteria Value *</Label>
          <Input type="number" {...register("criteria_value", { valueAsNumber: true })} />
          {errors.criteria_value?.message ? (
            <p className="text-xs text-destructive">{errors.criteria_value.message}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-1">
        <Label>Icon (emoji or code)</Label>
        <Input {...register("icon")} placeholder="🏆" />
      </div>
    </>
  );
};