import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>超イカしたチャットアプリへようこそ</h1>
      <p>チャットを始めるには下のボタンをクリックしてください。</p>
      <Link href="/chat">
        <button style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          チャット画面へ移動
        </button>
      </Link>
    </main>
  )
}