"use client";

import { useTransition } from "react";
import { CheckCircle2, Circle, Trash2, Mail } from "lucide-react";
import { toggleInquiryHandled, deleteInquiry } from "@/app/actions/inquiries";
import styles from "./page.module.css";

interface InquiryActionsProps {
  id: string;
  handled: boolean;
  email: string;
  name: string;
}

export default function InquiryActions({ id, handled, email, name }: InquiryActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleInquiryHandled(id, !handled);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete the inquiry from ${name}?`)) return;
    startTransition(async () => {
      await deleteInquiry(id);
    });
  };

  return (
    <div className={styles.actionsCell}>
      <a
        href={`mailto:${email}?subject=RE: Your Sultan Mauritius Inquiry`}
        className={styles.actionBtn}
        title="Reply via Email"
      >
        <Mail size={15} />
      </a>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`${styles.actionBtn} ${handled ? styles.handledBtn : styles.unhandledBtn}`}
        title={handled ? "Mark as unhandled" : "Mark as handled"}
      >
        {handled ? <CheckCircle2 size={15} /> : <Circle size={15} />}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className={`${styles.actionBtn} ${styles.deleteBtn}`}
        title="Delete inquiry"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
