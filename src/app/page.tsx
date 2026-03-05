import ApplicationForm from '@/components/ApplicationForm';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: 'max(5rem, env(safe-area-inset-top, 5rem))', paddingBottom: '4rem' }}>
      <ApplicationForm />
    </main>
  );
}
