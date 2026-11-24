import { redirect } from "next/navigation";

export default function AdminAlreadySubmittedRedirect() {
  redirect("/admin/submissions");
}
