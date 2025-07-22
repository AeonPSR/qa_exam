import Head from 'next/head';
import LoginForm from '../components/LoginForm';

export default function Home() {
  return (
    <div>
      <Head>
        <title>QA Login App</title>
        <meta name="description" content="QA School Project - Login Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <LoginForm />
      </main>
    </div>
  );
}
