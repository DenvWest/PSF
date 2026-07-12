import { redirect } from "next/navigation";

// "Vandaag" komt in plak 4; tot dan opent /admin direct de partnerlijst.
export default function DeskHomePage() {
  redirect("/admin/partners");
}
