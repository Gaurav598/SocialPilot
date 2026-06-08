import { CommandCenter } from "@/components/os/command-center";
import { getCommandCenterSnapshot } from "@/lib/social-os/data/command-center";
import { auth } from "@clerk/nextjs/server";

export default async function CommandCenterPage() {
  const { userId } = await auth();
  const snapshot = getCommandCenterSnapshot(userId ?? "anonymous");

  return <CommandCenter initialSnapshot={snapshot} />;
}
