<template>
  <b-dropdown class="UserDropdown" right>
    <template #button-content>
      <div class="d-flex px-2 py-1 align-items-center">
        <div
          class="user-picture position-relative mr-2 me-2"
          :style="{
            width: props.avatarSize * 2 + 'px',
            height: props.avatarSize * 2 + 'px'
          }"
        >
          <Sunset
            :radius="props.avatarSize"
            :colors="user.pattern"
            class="position-absolute left-0 top-0 m-0"
          />
        </div>
        <div>
          <div class="user-fullname small mb-0 text-left">{{ userFullName }}</div>
          <div class="user-role small-caps text-left">{{ userPlanLabel }}</div>
        </div>
      </div>
    </template>
    <template v-slot:button-icon>
      <Icon name="chevron" :scale="0.75" :strokeWidth="2" />
    </template>
    <template #default>
      <slot :user="user" :userPlan="userPlan"></slot>
      <b-dropdown-item target="_blank" :href="discussionChannelLink">
        <Icon name="discord" :scale="0.5" :strokeWidth="1" />&nbsp;
        <span v-html="$t('joinDiscussionChannel')"></span>
      </b-dropdown-item>
      <b-dropdown-item v-on:click="$emit('logout')">{{ $t('logout') }}</b-dropdown-item>

      <li class="mx-3">
        <hr class="dropdown-divider" />
      </li>
      <li class="mx-3">
        <span class="small text-muted" v-html="$t('currentVersion', { version })"></span>
      </li>
    </template>
  </b-dropdown>
</template>
<i18n lang="json">
{
  "en": {
    "currentVersion": "Version: {version}",
    "logout": "Logout"
  }
}
</i18n>
<style>
.UserDropdown {
  --bs-dropdown-min-width: 250px;
  --user-dropdown-bg-color: var(--impresso-color-white, #fff);
  --user-dropdown-bg-active-color: var(--impresso-color-white, #fff);
  --user-dropdown-border-color: var(--clr-grey-300, #ccc);
  --user-dropdown-border-radius: var(--impresso-border-radius-xs, 10px);
  --user-dropdown-border-width: 1px;
  --user-dropdown-menu-margin-top: -1.5px;
  --user-dropdown-menu-box-shadow: var(--bs-box-shadow-sm);
}

.UserDropdown a {
  text-decoration-color: transparent;
}
.UserDropdown .btn.dropdown-toggle {
  display: flex;
  align-items: center;
}
.UserDropdown .btn.dropdown-toggle:focus {
  outline: none;
  box-shadow: none;
}
.UserDropdown .btn.dropdown-toggle[aria-expanded='true'] {
  background: var(--user-dropdown-bg-color);
  border-width: var(--user-dropdown-border-width);
  border-color: var(--user-dropdown-border-color);
  border-top-left-radius: var(--user-dropdown-border-radius);
  border-top-right-radius: var(--user-dropdown-border-radius);
}
/** disable background on hover */
.UserDropdown.dropdown .btn.dropdown-toggle:not(.disabled):hover,
.UserDropdown.dropdown .btn.dropdown-toggle:not(.disabled):focus {
  background-color: var(--user-dropdown-bg-active-color);
  border-color: var(--user-dropdown-border-color);
  border-radius: var(--user-dropdown-border-radius);
}
.UserDropdown.dropdown.show .btn.dropdown-toggle:not(.disabled):hover,
.UserDropdown.dropdown.show .btn.dropdown-toggle:not(.disabled):focus {
  background-color: var(--user-dropdown-bg-active-color);

  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
.UserDropdown.dropdown .dropdown-menu {
  min-width: var(--bs-dropdown-min-width);
}
.UserDropdown.dropdown .dropdown-menu {
  background-color: var(--user-dropdown-bg-color);
  border-color: var(--user-dropdown-border-color);
  border-top-left-radius: var(--user-dropdown-border-radius);

  margin-top: var(--user-dropdown-menu-margin-top);
  box-shadow: var(--user-dropdown-menu-box-shadow, 0 0.5rem 1rem rgba(0, 0, 0, 0.15));
}
</style>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import Sunset from 'impresso-ui-components/components/Sunset.vue'
import type User from '@/models/User'
import Icon from 'impresso-ui-components/components/Icon.vue'
import { PlanLabels } from '@/constants'
import { ImpressoGlobalMetadata } from '@/models/ImpressoMetadata'
export interface UserDropdown {
  user: User
  userPlan: string
  avatarSize?: number
}
const props = withDefaults(defineProps<UserDropdown>(), {
  avatarSize: 16
})

const discussionChannelLink = ref(import.meta.env.VITE_DISCUSSION_CHANNEL_URL || '')

const emit = defineEmits<{
  (e: 'logout'): void
}>()

const userFullName = computed(() => {
  const name = `${props.user.firstname} ${props.user.lastname}`.trim()
  if (name === '') {
    console.warn('User has no name', props.user)
    return props.user.username ?? '-'
  }
  return name
})

const userPlanLabel = computed(() => {
  return PlanLabels[props.userPlan] || props.userPlan
})
const version = computed(() => {
  const glob = window as any as ImpressoGlobalMetadata
  return `${glob?.impressoFrontendVersion ?? 'unknown'} (${glob?.impressoFrontendRevision ?? 'unknown'})`
})
</script>
<i18n lang="json">
{
  "en": {
    "reviewer": "Reviewer",
    "institutionAccess": "Institution Access",
    "joinDiscussionChannel": "Join our Discord channel"
  }
}
</i18n>
