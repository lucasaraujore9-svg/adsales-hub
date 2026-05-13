import { redirect } from "next/navigation";

export const metadata = { title: "Redes sociais · AdSales Hub" };

export default function SocialSettingsRedirect() {
  redirect("/social/contas");
}
