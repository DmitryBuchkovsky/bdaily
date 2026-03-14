import cron from "node-cron";
import type { ActionItemService } from "../services/action-item.service.js";

export function startCronJobs(actionItemService: ActionItemService): void {
  cron.schedule("0 9 * * *", async () => {
    try {
      const count = await actionItemService.processReminders();
      console.log(`[cron] Sent ${count} action item reminders`);
    } catch (err) {
      console.error("[cron] Failed to process reminders:", err);
    }
  });
}
