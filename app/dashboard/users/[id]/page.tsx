import { redirect } from 'next/navigation';

export default async function UserPage({
  params,
}: {
  params: { id: string };
}) {
  // Next.js 15 requires awaiting params
  const { id } = await params;
  
  // Rediriger vers la page de visualisation
  redirect(`/dashboard/users/${id}/view`);
} 