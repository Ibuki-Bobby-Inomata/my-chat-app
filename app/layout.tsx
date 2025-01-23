export const metadata = {
  title: 'チャットアプリ',
  description: 'Next.js + Supabaseで作るリアルタイムチャット',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  )
}