import {
  PlanEducational,
  PlanGuest,
  PlanImpressoUser,
  PlanLabels,
  PlanNone,
  PlanResearcher
} from '@/constants'
import { Group } from '@/services/types'

export const PasswordRegex = /^(?=.*?[A-Z])(?=.*[a-z])(?=.*[\d])(?=.*[\W_])(?!.*\s).{8,}$/
export const UserRegex = /^[a-z0-9-]+$/
export const SortedAvailablePlans = [PlanResearcher, PlanEducational, PlanImpressoUser]

export const getUserPlan = (groups: Group[] = []): { plan: string; label: string } => {
  let userPlan = groups.length ? PlanNone : PlanGuest
  for (const planName of SortedAvailablePlans) {
    if (groups.some(g => g.name === planName)) {
      userPlan = planName
      break
    }
  }

  return { plan: userPlan, label: PlanLabels[userPlan] }
}

export const getUserBitmapAsString = (
  bitmap: string
): {
  hex: string
  binary: string
  bigint: bigint
} => {
  const bigint = BigInt(bitmap)
  if (bigint === BigInt(0)) {
    return {
      hex: '0x0',
      binary: '0',
      bigint: BigInt(0)
    }
  }
  const binaryString = bigint.toString(2)
  const hexString = '0x' + bigint.toString(16).toUpperCase()

  return {
    hex: hexString,
    binary: binaryString,
    bigint
  }
}

export const hasAnySpecialMembershipAccess = (bitmap: string): boolean => {
  const getUserBitmapAsStringResult = getUserBitmapAsString(bitmap)

  console.debug(`[user.ts] hasAnySpecialMembershipAccess`, getUserBitmapAsStringResult)
  return false
}
