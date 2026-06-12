import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { StoreAchievementPayload } from "@/shared/types/schemas";
import type { UseFormReturn } from "react-hook-form";

type AchievementFormFieldsProps = {
  form: UseFormReturn<StoreAchievementPayload>;
};

export const AchievementFormFields = ({ form }: AchievementFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="achievement_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input {...field} value={(field.value as string) || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="criteria_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Criteria Type *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. borrows_count" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="criteria_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Criteria Value *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="image_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Icon or Image URL</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://... or emoji" value={(field.value as string) || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};