import { isAdmin } from "@/lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";
import pageStyles from "../page.module.css";

export default function AdminSettingsPage() {
  if (!isAdmin()) return null;

  return (
    <div>
      <h1 className={pageStyles.title}>Settings</h1>
      <div className={pageStyles.section} style={{ maxWidth: 360 }}>
        <h2 className={pageStyles.sectionTitle}>Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
