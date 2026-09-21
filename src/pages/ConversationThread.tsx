import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { db } from '../lib/db'
import { useAuth } from '../hooks/useAuth'
import type { Conversation, Message, VehicleListing } from '../lib/db/schema'

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface ThreadData {
  conversation: Conversation
  listing: VehicleListing | null
  listingImage: string | null
  otherPartyName: string
}

export default function ConversationThread() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user } = useAuth()

  const [thread, setThread] = useState<ThreadData | null | undefined>(undefined)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !conversationId) return
    let cancelled = false
    async function load() {
      const all = await db.listConversations(user!.uid)
      const conversation = all.find((c) => c.id === conversationId)
      if (!conversation) {
        if (!cancelled) setThread(null)
        return
      }
      const otherId = conversation.buyerId === user!.uid ? conversation.sellerId : conversation.buyerId
      const [listing, dealer, otherUser, msgs] = await Promise.all([
        db.getListing(conversation.listingId),
        db.getDealerProfile(otherId),
        db.getUser(otherId),
        db.listMessages(conversation.id),
      ])
      let listingImage: string | null = null
      if (listing) {
        const images = await db.listImages('listing', listing.id)
        if (images.length > 0) listingImage = await db.getImageUrl(images[0])
      }
      if (cancelled) return
      setThread({
        conversation,
        listing,
        listingImage,
        otherPartyName: dealer?.businessName ?? otherUser?.displayName ?? 'the other party',
      })
      setMessages(msgs)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user, conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!user || !thread || !body.trim()) return
    setSending(true)
    const message: Message = {
      id: `msg-${crypto.randomUUID()}`,
      conversationId: thread.conversation.id,
      senderId: user.uid,
      body: body.trim(),
      createdAt: Date.now(),
      readAt: null,
    }
    await db.sendMessage(message)
    setMessages((prev) => [...prev, message])
    setBody('')
    setSending(false)
  }

  if (thread === undefined) return null

  if (thread === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-space-sm px-space-md text-center min-h-[50vh]">
        <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
          <Icon name="chat_bubble" className="text-[28px]" />
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Conversation not found</h2>
        <Link
          to="/messages"
          className="mt-space-xs px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-label-md font-semibold"
        >
          Back to Messages
        </Link>
      </div>
    )
  }

  const { listing, listingImage, otherPartyName } = thread

  return (
    <div className="flex flex-col w-full lg:max-w-2xl lg:mx-auto min-h-[70vh]">
      {listing && (
        <Link
          to={`/listing/${listing.id}`}
          className="mx-gutter-sm mt-space-sm flex items-center gap-space-sm bg-surface-container-low rounded-xl p-space-sm shadow-sm shrink-0"
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-highest shrink-0">
            {listingImage && (
              <img src={listingImage} alt={listing.model} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-label-md text-label-md text-on-surface truncate">
              {listing.year} {listing.make} {listing.model}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {formatUsd(listing.priceCents)} • with {otherPartyName}
            </p>
          </div>
          <Icon name="chevron_right" className="text-outline text-[18px]" />
        </Link>
      )}

      <div className="flex-1 flex flex-col gap-space-sm px-gutter-sm py-space-md overflow-y-auto">
        {messages.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-space-lg">
            No messages yet — say hello to {otherPartyName}.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user?.uid
          return (
            <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-space-sm py-space-xs font-body-sm text-body-sm ${
                  mine
                    ? 'bg-primary-container text-on-primary-container rounded-br-sm'
                    : 'bg-surface-container-low text-on-surface rounded-bl-sm'
                }`}
              >
                {m.body}
              </div>
              <span className="font-label-sm text-label-sm text-outline mt-0.5 px-1">
                {formatTime(m.createdAt)}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-space-xs px-gutter-sm py-space-sm border-t border-outline-variant shrink-0"
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 h-11 px-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-full placeholder:text-outline focus:outline-none focus:bg-surface-container shadow-inner"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          aria-label="Send message"
          className="w-11 h-11 shrink-0 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm active:scale-95 transition-transform disabled:opacity-50"
        >
          <Icon name="send" className="text-[18px]" />
        </button>
      </form>
    </div>
  )
}
