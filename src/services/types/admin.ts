import type { ClientService } from '@feathersjs/feathers'
import type { Admin, AdminPatchRequest } from '@/models/generated/schemasPublic'

export type AdminService = Pick<ClientService<Admin, unknown, AdminPatchRequest, Admin>, 'find' | 'patch'>
