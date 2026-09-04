import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware wrappers around next/link and next/navigation. Use these
// instead of the plain next/* versions anywhere under [locale].
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
