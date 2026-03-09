import type { ClientService } from '@feathersjs/feathers'
import type { AdminPatchRequest } from '@/models/generated/app/requests'
import type { AdminGETResponse as Admin } from '@/models/generated/app/responses'

export type AdminService = Pick<ClientService<Admin, unknown, AdminPatchRequest, Admin>, 'find' | 'patch'>
