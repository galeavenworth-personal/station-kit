/**
 * Shared types for the Yardkit supervisor
 */

export type LinePhase = 'claim' | 'prep' | 'execute' | 'gates' | 'close';

export type LineStatus =
	| 'ready'
	| 'claimed'
	| 'in_progress'
	| 'completed'
	| 'failed';

export interface RunResult {
	runId: string;
	taskId: string;
	status: 'success' | 'failed';
	phase: LinePhase;
	startTime: Date;
	endTime: Date;
	exitCode: number;
	events: RunEvent[];
	error?: string;
}

export interface RunEvent {
	timestamp: Date;
	phase: LinePhase;
	event: string;
	data?: Record<string, unknown>;
}

export interface WorkspaceInfo {
	path: string;
	type: 'worktree' | 'clone' | 'container';
	runId: string;
	taskId: string;
}

export interface LockInfo {
	taskId: string;
	runId: string;
	pid: number;
	hostname: string;
	timestamp: Date;
}
