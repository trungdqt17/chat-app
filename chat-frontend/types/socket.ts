export interface PendingRequest {
	resolve: (value: any) => void
	reject: (reason?: any) => void
}

export interface SocketRequest<T = any> {
	requestId: string
	eventName: string
	payload: T
}

export interface SocketResponse<T = any> {
	requestId: string
	data?: T
	error?: string
}

export type UpdateType = 'ADDED' | 'UPDATED' | 'DELETED' | 'FULL_REFRESH'

export interface UpdateEvent<T> {
	type: UpdateType
	data?: T
	id?: string
}
