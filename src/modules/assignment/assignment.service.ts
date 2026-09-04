import { OutageStatus, Prisma, Role } from "@prisma/client";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import type { RequestUser } from "../../middlewares/auth.js";
import AppError from "../../utils/AppError.js";
import type {
	IAssignmentFilterRequest,
	ICreateAssignmentPayload,
} from "./assignment.interface.js";

const createAssignment = async (
	payload: ICreateAssignmentPayload,
	actorId: string,
) => {
	// 1. Verify Operator
	const operator = await prisma.user.findUnique({
		where: { id: payload.operatorId, deletedAt: null },
		select: { id: true, name: true, role: true, isActive: true, zoneId: true },
	});

	if (!operator) {
		throw new AppError(httpStatus.NOT_FOUND, "Operator not found");
	}

	if (operator.role !== Role.OPERATOR) {
		throw new AppError(httpStatus.BAD_REQUEST, "User is not an Operator");
	}

	if (!operator.isActive) {
		throw new AppError(httpStatus.BAD_REQUEST, "Operator account is inactive");
	}

	// 2. Verify Outage
	const outage = await prisma.outage.findUnique({
		where: { id: payload.outageId, deletedAt: null },
		include: {
			area: {
				include: {
					feeder: {
						include: {
							substation: true,
						},
					},
				},
			},
		},
	});

	if (!outage) {
		throw new AppError(httpStatus.NOT_FOUND, "Outage not found");
	}

	if (
		outage.status === OutageStatus.RESTORED ||
		outage.status === OutageStatus.CLOSED
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Cannot assign operator to an outage that is already restored or closed",
		);
	}

	// 3. Ensure Operator belongs to the correct Zone if restricted
	const outageZoneId = outage.area.feeder.substation.zoneId;
	if (operator.zoneId && operator.zoneId !== outageZoneId) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Operator is assigned to a different distribution zone",
		);
	}

	// 4. Check for duplicate assignment
	const existingAssignment = await prisma.assignment.findFirst({
		where: {
			operatorId: payload.operatorId,
			outageId: payload.outageId,
		},
	});

	if (existingAssignment) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Operator is already assigned to this Outage",
		);
	}

	// 5. Atomic Transaction: Create Assignment, Advance Outage status, and log Audit
	return await prisma.$transaction(async (tx) => {
		const assignment = await tx.assignment.create({
			data: payload,
			include: {
				operator: {
					select: {
						id: true,
						name: true,
						email: true,
						contactNumber: true,
						zone: { select: { id: true, name: true } },
					},
				},
				outage: {
					select: {
						id: true,
						status: true,
						priority: true,
						area: { select: { id: true, name: true } },
					},
				},
			},
		});

		let newStatus = outage.status;
		if (
			outage.status === OutageStatus.REPORTED ||
			outage.status === OutageStatus.ACKNOWLEDGED
		) {
			newStatus = OutageStatus.ASSIGNED;
			await tx.outage.update({
				where: { id: outage.id },
				data: { status: OutageStatus.ASSIGNED },
			});
		}

		await tx.auditLog.create({
			data: {
				actorId,
				action: "OPERATOR_ASSIGNED",
				entity: "Outage",
				entityId: outage.id,
				previousData: { status: outage.status },
				newData: {
					status: newStatus,
					operatorId: operator.id,
					assignmentId: assignment.id,
				},
			},
		});

		// Reflect the new status in the returned payload
		assignment.outage.status = newStatus;

		return assignment;
	});
};

const getAllAssignments = async (
	filters: IAssignmentFilterRequest,
	_user: RequestUser,
) => {
	const whereConditions: Prisma.AssignmentWhereInput = {};

	if (filters.operatorId) {
		whereConditions.operatorId = filters.operatorId;
	}

	if (filters.outageId) {
		whereConditions.outageId = filters.outageId;
	}

	return await prisma.assignment.findMany({
		where: whereConditions,
		include: {
			operator: {
				select: {
					id: true,
					name: true,
					email: true,
					contactNumber: true,
					zone: { select: { id: true, name: true } },
				},
			},
			outage: {
				select: {
					id: true,
					status: true,
					priority: true,
					area: { select: { id: true, name: true } },
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
};

const getAssignmentById = async (id: string) => {
	const assignment = await prisma.assignment.findUnique({
		where: { id },
		include: {
			operator: {
				select: {
					id: true,
					name: true,
					email: true,
					contactNumber: true,
					zone: { select: { id: true, name: true } },
				},
			},
			outage: {
				select: {
					id: true,
					status: true,
					priority: true,
					area: {
						select: {
							id: true,
							name: true,
							feeder: {
								select: {
									id: true,
									name: true,
									substation: {
										select: {
											id: true,
											name: true,
											zone: { select: { id: true, name: true } },
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});

	if (!assignment) {
		throw new AppError(httpStatus.NOT_FOUND, "Assignment not found");
	}

	return assignment;
};

const deleteAssignment = async (id: string, actorId: string) => {
	const assignment = await prisma.assignment.findUnique({
		where: { id },
	});

	if (!assignment) {
		throw new AppError(httpStatus.NOT_FOUND, "Assignment not found");
	}

	return await prisma.$transaction(async (tx) => {
		const deleted = await tx.assignment.delete({
			where: { id },
		});

		await tx.auditLog.create({
			data: {
				actorId,
				action: "OPERATOR_UNASSIGNED",
				entity: "Outage",
				entityId: assignment.outageId,
				previousData: {
					operatorId: assignment.operatorId,
					assignmentId: assignment.id,
				},
				newData: Prisma.JsonNull,
			},
		});

		return deleted;
	});
};

export const AssignmentService = {
	createAssignment,
	getAllAssignments,
	getAssignmentById,
	deleteAssignment,
};
