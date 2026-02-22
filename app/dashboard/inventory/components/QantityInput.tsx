"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { label: string; value: string };

type QuantityInputProps = {
  label?: string;
  required?: boolean;
  error?: string;
  unitValue: string;
  onUnitChange: (val: string) => void;
  unitOptions: Option[];
} & React.ComponentProps<typeof Input>;

export function QuantityInput({
  label,
  required,
  error,
  unitValue,
  onUnitChange,
  unitOptions,
  className,
  ...props
}: QuantityInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      <div className="flex">
        <Input
          className={cn(
            "rounded-r-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            error && "border-destructive focus-visible:border-destructive",
            className,
          )}
          {...props}
        />
        <Select value={unitValue} onValueChange={onUnitChange}>
          <SelectTrigger
            className={cn(
              "w-24 rounded-l-none border-l-0",
              error && "border-destructive",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
