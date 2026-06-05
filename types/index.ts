export type UserRole = 'user' | 'producer' | 'admin';
export type UserStatus =
	| 'pending'
	| 'approved'
	| 'rejected';
export type NomineeStatus =
	| 'pending'
	| 'approved'
	| 'rejected';

export interface User {
	id: string;
	name: string | null;
	email: string;
	password_hash?: string | null;
	role: UserRole;
	status: UserStatus;
	created_at: Date;
}

export interface ApprovedEmail {
	id: number;
	email: string;
	created_at: Date;
}

export interface Category {
	id: number;
	name: string;
	description: string | null;
	is_active: boolean;
	created_at: Date;
}

export interface Nominee {
	id: number;
	name: string;
	category_id: number;
	user_id: string | null;
	status: NomineeStatus;
	image_url: string | null;
	description?: string | null;
	site_url?: string | null;
	video_url?: string | null;
	what_we_made?: string | null;
	created_at: Date;
}

export interface Vote {
	id: number;
	user_id: string;
	category_id: number;
	nominee_id: number;
	created_at: Date;
}

export interface NomineeWithVotes extends Nominee {
	vote_count: number;
	rank: number;
}

export interface CategoryLeaderboard {
	category: Category;
	nominees: NomineeWithVotes[];
}

export interface DashboardStats {
	total_votes: number;
	active_categories: number;
	approved_users: number;
	pending_users: number;
}
