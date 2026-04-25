import { IntroPage } from '@/components/intro/IntroPage';

// The intro module is pure curriculum content — no auth needed.
// Middleware will have ensured a session by the time the user logs
// their first bottle from the intro flow.
export default function IntroRoute() {
  return <IntroPage />;
}
