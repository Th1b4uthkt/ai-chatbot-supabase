import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { NewPartnerForm } from "./NewPartnerForm";

export default function NewPartnerPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" asChild className="size-9 rounded-full shadow-sm">
          <Link href="/dashboard/partners">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Add Partner</h1>
      </div>
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-0.5 shadow-xl">
        <NewPartnerForm />
      </div>
    </div>
  );
} 