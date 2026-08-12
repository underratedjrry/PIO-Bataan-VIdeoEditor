import { redirect } from "next/navigation";

// proxy.ts already sends unauthenticated visitors to /login, so reaching
// this page means we have a session - just land on the task list.
export default function Home() {
  redirect("/tasks");
}
