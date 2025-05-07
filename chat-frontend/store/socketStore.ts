import { create } from 'zustand'
import { Socket } from 'socket.io-client'

export type SocketStatus = 'connecting' | 'connected' | 'disconnected'

interface SocketState {
	socket: Socket | null
	status: SocketStatus
	setSocket: (socket: Socket) => void
	setStatus: (status: SocketStatus) => void
	clearSocket: () => void
}

export const useSocketStore = create<SocketState>((set) => ({
	socket: null,
	status: 'disconnected',
	setSocket: (socket) => set({ socket, status: 'connected' }),
	clearSocket: () => set({ socket: null, status: 'disconnected' }),
	setStatus: (status) => set({ status }),
}))
