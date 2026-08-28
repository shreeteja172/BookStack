import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { RoleForm } from "@/components/role-form";
import { UsersIcon } from "@/components/icons";
import { requireLibrarian } from "@/lib/session";
import { getMembers } from "@/lib/library";

export const metadata: Metadata = {
  title: "Members · BookStack",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function MembersPage() {
  const user = await requireLibrarian();
  const members = await getMembers();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteNav email={user.email} librarian />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <UsersIcon className="h-7 w-7 text-brand" />
          Members
        </h1>
        <p className="mt-2 text-muted">{members.length} registered accounts.</p>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-bold">Name</th>
                <th className="px-5 py-3 font-bold">Email</th>
                <th className="px-5 py-3 font-bold">Role</th>
                <th className="px-5 py-3 font-bold">Books out</th>
                <th className="px-5 py-3 font-bold">Joined</th>
                <th className="px-5 py-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-medium">{member.name}</td>
                  <td className="px-5 py-3 text-muted">{member.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        member.role === "librarian"
                          ? "bg-brand text-white"
                          : "bg-sand text-brand"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">{member._count.loans}</td>
                  <td className="px-5 py-3 text-muted">{dateFormat.format(member.createdAt)}</td>
                  <td className="px-5 py-3">
                    <RoleForm
                      userId={member.id}
                      role={member.role}
                      disabled={member.id === user.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
