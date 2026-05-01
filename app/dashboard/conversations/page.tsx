import { redirect } from "next/navigation";

export default async function ConversationsAliasPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const requestedContactId = Array.isArray(searchParams.contact) ? searchParams.contact[0] : searchParams.contact;

  if (requestedContactId) {
    redirect(`/dashboard/chat-history?contact=${requestedContactId}`);
  }

  redirect("/dashboard/chat-history");
}
