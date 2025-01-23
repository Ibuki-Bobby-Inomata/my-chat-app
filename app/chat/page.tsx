"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

type Message = {
    id: string
    content: string
    user_name: string
    created_at: string
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [userName, setUserName] = useState("")

    useEffect(() => {
        // ページ表示時にDBから既存メッセージを取得
        fetchMessages()

        // INSERT / UPDATE / DELETE 全てをリアルタイム購読して、
        // 何らかの変更があれば最新メッセージ一覧を再取得する
        const channel = supabase
            .channel("chat-messages")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "messages" },
                () => {
                    // 変化があったら即時再取得
                    fetchMessages()
                }
            )
            .subscribe()

        // アンマウント時にチャンネル購読を解除
        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // メッセージ一覧を取得
    async function fetchMessages() {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: true }) // 古い順→新しい順

        if (error) {
            console.error("fetchMessages error:", error)
            return
        }
        if (data) {
            setMessages(data as Message[])
        }
    }

    // 新規メッセージをINSERT
    async function handleSendMessage() {
        // userNameやnewMessageが空なら送信しない
        if (!userName.trim() || !newMessage.trim()) return

        const { error } = await supabase.from("messages").insert({
            content: newMessage,
            user_name: userName,
        })

        if (error) {
            console.error("insert error:", error)
        } else {
            setNewMessage("") // 送信成功時、入力欄をクリア
        }
    }

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>

            <div>
                <Link href="/">
                    <button style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
                        HOME
                    </button>
                </Link>
            </div>

            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                チャットタイムライン
            </h1>

            {/*--- チャット履歴表示 ---*/}
            <div
                style={{
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "1rem",
                    height: "400px",
                    overflowY: "auto",
                    marginBottom: "1rem",
                }}
            >
                {messages.map((msg) => (
                    <div key={msg.id} style={{ marginBottom: "1rem" }}>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>
                            <strong>{msg.user_name}</strong> /{" "}
                            {new Date(msg.created_at).toLocaleString()}
                        </div>
                        <div style={{ fontSize: "1rem" }}>{msg.content}</div>
                    </div>
                ))}
            </div>

            {/*--- ユーザー名入力 ---*/}
            <div style={{ marginBottom: "0.5rem" }}>
                <input
                    type="text"
                    placeholder="ユーザー名"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "0.5rem",
                        marginBottom: "0.5rem",
                        boxSizing: "border-box",
                    }}
                />
            </div>

            {/*--- メッセージ入力 & 送信ボタン ---*/}
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <textarea
                    rows={2}
                    placeholder="メッセージを入力..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "0.5rem",
                        resize: "none",
                        boxSizing: "border-box",
                    }}
                />
                <button
                    onClick={handleSendMessage}
                    style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                >
                    送信
                </button>
            </div>
        </div>
    )
}