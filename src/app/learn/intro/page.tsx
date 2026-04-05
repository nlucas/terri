import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { IntroPage } from '@/components/intro/IntroPage';

export default async function IntroRoute() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <IntroPage />;
}
