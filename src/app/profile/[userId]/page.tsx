import ProfileClient from './ProfileClient';

export default async function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  return <ProfileClient userId={params.userId} />;
}