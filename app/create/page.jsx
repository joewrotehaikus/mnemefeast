import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";
import Create from "./Create";

export default async function CreatePage() {
    const user = await useUser({ token: cookies().get("token")?.value });
    if (!user) return redirect("/login");

    return <Create />;
}
