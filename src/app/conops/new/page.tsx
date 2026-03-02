import { requireUser } from "@/lib/auth";
import { ConopWorkbench } from "@/components/conop-workbench";

export default async function NewConopPage() {
  await requireUser();
  return <ConopWorkbench />;
}
