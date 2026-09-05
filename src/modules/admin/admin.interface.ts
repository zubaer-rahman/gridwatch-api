export interface IAdminUserQuery {
	search?: string;
	status?: "ACTIVE" | "INACTIVE";
	role?: "CUSTOMER" | "OPERATOR" | "ADMIN";
	page?: string;
	limit?: string;
}

export interface IAuditLogQuery {
	entity?: string;
	action?: string;
	page?: string;
	limit?: string;
}
