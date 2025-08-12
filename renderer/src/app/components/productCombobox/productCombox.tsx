// components/ProductComboBox.tsx
"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  products: { label: string; value: string }[];
  error?: string;
  disabled?: boolean;
}

export function ProductComboBox({
  value,
  onChange,
  products,
  error,
  disabled,
}: ProductComboBoxProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              error ? "border-red-500" : "border-gray-300"
            )}
            disabled={disabled}
          >
            {value
              ? products.find((p) => p.value === value)?.label
              : "Sélectionner un produit"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Rechercher..." />
            <CommandEmpty>Aucun produit trouvé</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.value}
                  value={product.value}
                  onSelect={() => {
                    onChange(product.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {product.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
