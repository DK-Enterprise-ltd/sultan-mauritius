import { isAdmin } from "@/lib/auth";
import { getBulkDiscountPercent } from "@/lib/pricing";
import ChangePasswordForm from "./ChangePasswordForm";
import BulkDiscountForm from "./BulkDiscountForm";
import pageStyles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (!isAdmin()) return null;

  const bulkDiscountPercent = await getBulkDiscountPercent();

  return (
    <div>
      <h1 className={pageStyles.title}>Settings</h1>
      <div className={pageStyles.section} style={{ maxWidth: 360 }}>
        <h2 className={pageStyles.sectionTitle}>Change password</h2>
        <ChangePasswordForm />
      </div>
      <div className={pageStyles.section} style={{ maxWidth: 360 }}>
        <h2 className={pageStyles.sectionTitle}>Bulk discount</h2>
        <BulkDiscountForm currentPercent={bulkDiscountPercent.toString()} />
      </div>
    </div>
  );
}
