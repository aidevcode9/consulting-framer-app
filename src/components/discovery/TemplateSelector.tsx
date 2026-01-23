"use client";

import { useState } from "react";
import {
  Code,
  Heart,
  ShoppingCart,
  DollarSign,
  Factory,
  Briefcase,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { DISCOVERY_TEMPLATES, type DiscoveryTemplate } from "@/lib/discovery/templates";

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Heart,
  ShoppingCart,
  DollarSign,
  Factory,
  Briefcase,
};

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
  selectedTemplateId?: string;
}

export function TemplateSelector({ onSelect, selectedTemplateId }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<string | null>(selectedTemplateId || null);

  const handleSelect = (template: DiscoveryTemplate) => {
    setSelected(template.id);
    onSelect(template.id);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">Choose Your Industry</h2>
        </div>
        <p className="text-sm text-gray-500">
          Select an industry template to get tailored discovery questions for your client.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-3">
          {DISCOVERY_TEMPLATES.map((template) => {
            const IconComponent = iconMap[template.icon] || Briefcase;
            const isSelected = selected === template.id;

            return (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={`group flex items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-50 ring-2 ring-purple-500/20"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${template.color} text-white`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      isSelected ? "text-purple-700" : "text-gray-800"
                    }`}
                  >
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
                <ChevronRight
                  className={`h-5 w-5 transition-transform ${
                    isSelected
                      ? "translate-x-1 text-purple-500"
                      : "text-gray-300 group-hover:translate-x-1 group-hover:text-gray-400"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="border-t bg-gray-50 px-6 py-4">
          <p className="text-center text-sm text-gray-500">
            Template selected. Start answering questions to continue.
          </p>
        </div>
      )}
    </div>
  );
}
