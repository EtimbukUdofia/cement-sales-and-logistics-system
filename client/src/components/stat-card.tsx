import { Card } from "@/components/ui/card";
import * as React from "react";

interface StatCardProps {
  description: string;
  content: string;
  icon: React.ReactNode;
  iconBgClassName?: string;
}

export function StatCard({ description, content, icon, iconBgClassName }: StatCardProps) {
  return (
    <Card className="@container/card flex flex-row items-stretch p-0">
      <div className="flex flex-col flex-1 justify-between h-full pl-6 py-0">
        <div className="pt-0 pb-0">
          <span className="block text-muted-foreground text-sm pt-6">{description}</span>
        </div>
        <div className="mt-auto pb-6">
          <span className="block text-2xl font-bold tabular-nums">{content}</span>
        </div>
      </div>
      <div className="flex items-center justify-center pr-6">
        <span className={`flex items-center justify-center rounded-lg h-10 w-10 ${iconBgClassName ?? 'bg-primary/10 text-primary'}`}>{icon}</span>
      </div>
    </Card>
  );
}
