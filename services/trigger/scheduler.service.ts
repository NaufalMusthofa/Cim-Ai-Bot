import { processDueFollowups } from "@/services/trigger/followup.service";

export async function runFollowupScheduler() {
  return processDueFollowups();
}
