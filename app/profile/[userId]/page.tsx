import UserProfilePage from "~/features/profile/pages/user-profile-page";

export default async function UserProfileRoute({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <UserProfilePage userId={userId} />;
}
