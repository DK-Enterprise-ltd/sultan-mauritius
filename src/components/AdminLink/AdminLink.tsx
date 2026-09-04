"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./AdminLink.module.css";

export default function AdminLink() {
  return (
    <Link href="/admin" className={styles.link}>
      <motion.span className={styles.inner} whileHover="hover" initial="rest" animate="rest">
        Admin
        <motion.span
          aria-hidden
          className={styles.arrow}
          variants={{ rest: { x: 0 }, hover: { x: 4 } }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          →
        </motion.span>
      </motion.span>
    </Link>
  );
}
