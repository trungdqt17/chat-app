'use client'

import styles from './page.module.css'
import React, { useEffect, useState, useRef } from 'react'
import {
	QueryClient,
	QueryClientProvider,
	useQueryClient,
	useQuery,
	useMutation,
	UseQueryOptions,
	QueryKey,
	keepPreviousData,
} from '@tanstack/react-query'
import { initializeSocket, socketRequest, registerListener } from './socket'
import { useSocketStore } from '@/store/socketStore'

export type UpdateHandler<TData, TUpdate> = (
	updateData: TUpdate,
	currentData: TData | undefined,
	queryClient: ReturnType<typeof useQueryClient>
) => void

export interface UseSocketQueryOptions<TData, TPayload, TUpdate> {
	queryKey: QueryKey
	fetchEvent: string
	fetchPayload?: TPayload
	updateEvent?: string
	updateHandler?: UpdateHandler<TData, TUpdate>
	options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {	
			staleTime: 24 * 60 * 60 * 1000, // 24 hours
			gcTime: 1 * 60 * 60 * 1000, // 1 hour
			placeholderData:  keepPreviousData
		}
	}
})

function useSocketQuery<TData, TPayload, TUpdate>({
	queryKey,
	fetchEvent,
	updateEvent,
	fetchPayload,
	updateHandler,
	options,
}: UseSocketQueryOptions<TData, TPayload, TUpdate>) {
	const queryClient = useQueryClient()
	const status = useSocketStore((state) => state.status)
	// Register listener for real-time updates
	useEffect(() => {
		if (!updateEvent || status !== 'connected') return

		const defaultUpdateHandler = (newData: TUpdate) => {
			queryClient.setQueryData<TData>(queryKey, newData as unknown as TData)
		}

		const handler = updateHandler || defaultUpdateHandler

		// Register the listener and get the cleanup function
		const unsubscribe = registerListener<TUpdate>(updateEvent, (data) => {
			console.log('listener', data);
			
			handler(data, queryClient.getQueryData<TData>(queryKey), queryClient)
		})

		return unsubscribe
	}, [queryKey, updateEvent, queryClient, updateHandler, status])

	// The query itself
	return useQuery<TData, Error>({
		queryKey,
		queryFn: () => socketRequest<TData, TPayload>(fetchEvent, fetchPayload),
		enabled: status === 'connected',
		...options,
	})
}

function useSendMessage() {
	return useMutation({
		mutationFn: (msg: string) => socketRequest('sendMessage', { message: msg }),
	})
}

function ChatDemo() {
	const [input, setInput] = useState('')
	const { data: messages = [] } = useSocketQuery<string[], {}, string>({
		queryKey: ['chat'],
		fetchEvent: 'getMessages',
		updateEvent: 'newMessage', // Custom update handler for fine-grained control
		updateHandler: (newData, currentData = [], queryClient) => {
			queryClient.setQueryData<string[]>(['chat'], [...currentData, newData])
		}
	})
	const sendMessage = useSendMessage()
	const handleSend = (e: React.FormEvent) => {
		e.preventDefault()
		if (input.trim()) {
			sendMessage.mutate(input)
			setInput('')
		}
	}

	useEffect(() => {
		initializeSocket()
	}, [])

	return (
		<div style={{ border: '1px solid #ccc', padding: 16, marginTop: 32 }}>
			<h2>Chat Demo (Socket.IO + TanStack Query)</h2>
			<div style={{ minHeight: 100, marginBottom: 8 }}>
				{messages.map((msg: string, idx: number) => (
					<div key={idx}>{msg}</div>
				))}
			</div>
			<form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type a message..."
					style={{ flex: 1 }}
				/>
				<button type="submit">Send</button>
			</form>
		</div>
	)
}

export default function Home() {
	return (
		<QueryClientProvider client={queryClient}>
			<div className={styles.page}>
				<main className={styles.main}>
					<ChatDemo />
				</main>
			</div>
		</QueryClientProvider>
	)
}
