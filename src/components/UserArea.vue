<template>
  <b-dropdown class="UserArea px-0 bg-dark" right>
    <template v-slot:button-content>
      <div class="d-flex px-2 py-1 align-items-center">
        <div class="user-picture position-relative mr-2 me-2" :style="userPicture"></div>
        <div class="UserArea__userLabel">
          <div class="user-fullname small mb-1">{{ userFullName }}</div>
          <div class="user-role small-caps">{{ userRole }}</div>
        </div>
      </div>
    </template>
    <template v-slot:button-icon>
      <Icon name="chevron" :scale="0.75" :strokeWidth="2" />
    </template>
    <b-dropdown-item :to="{ name: 'user' }">{{ $t('profile') }}</b-dropdown-item>
    <!-- <b-dropdown-item :to="{ name: 'termsOfUse' }" active-class="active">
      {{ $t('label_terms_of_use') }}
    </b-dropdown-item> -->

    <LinkToModal class="dropdown-item" :view="ViewChangePlanRequest">
      {{ $t('label_change_plan_request') }}
    </LinkToModal>

    <LinkToModal class="dropdown-item" :view="ViewTermsOfUse">
      {{ $t('label_terms_of_use') }}
    </LinkToModal>
    <LinkToModal class="dropdown-item" :view="ViewPlans">
      {{ $t('label_plans') }}
    </LinkToModal>
    <b-dropdown-item v-on:click="logout">{{ $t('logout') }}</b-dropdown-item>
    <b-dropdown-item v-if="user && user.isStaff" v-on:click="test()">{{
      $t('send_test_job')
    }}</b-dropdown-item>
    <LinkToModal v-if="user && user.isStaff" class="dropdown-item" :view="ViewUserRequests">
      {{ $t('label_user_requests') }}
    </LinkToModal>
    <LinkToModal v-if="user && user.isStaff" class="dropdown-item" :view="ViewInfoModal">
      {{ $t('label_verbose_info') }}
    </LinkToModal>
    <b-dropdown-item v-if="user && user.isStaff" v-on:click="send_update_bitmap()">{{
      $t('send_update_bitmap')
    }}</b-dropdown-item>
    <b-dropdown-item
      target="_blank"
      href="https://join.slack.com/t/impresso-community/shared_invite/enQtNTg5MzY2NDg2NTAyLTdiMmI2ZWU5ZjliNGNjN2M4NTgxM2UzOTQyYTkxYWU4MTgwN2I1MzQxMzg3N2Y0NGU3OGFjMzFmMGIyNGRlZmQ"
    >
      <Icon name="slack" :scale="0.5" :strokeWidth="0.5" />&nbsp;
      <span v-html="$t('join_slack_channel')"></span>
    </b-dropdown-item>

    <b-dropdown-item>
      <span class="small text-muted" v-html="$t('current_version', { version })"></span>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LinkToModal from './LinkToModal.vue'
import {
  ViewTermsOfUse,
  ViewChangePlanRequest,
  ViewInfoModal,
  ViewUserRequests,
  ViewPlans
} from '@/constants'
import Icon from './base/Icon.vue'
import { jobs as jobsService, termsOfUse as termsOfUseService } from '@/services'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})
const version = computed(() => {
  return (window as any).impressoFrontendVersion
})

const logout = () => {
  console.info('logging out..')
  userStore.logout()
}
const userFullName = computed(() => {
  const name = `${props.user.firstname} ${props.user.lastname}`.trim()
  if (name === '') {
    console.warn('User has no name', props.user)
    return props.user.username
  }
  return name
})

const userRole = computed(() => {
  return props.user.isStaff ? 'staff' : 'researcher'
})
const test = () => {
  return jobsService.create({})
}
const send_update_bitmap = async () => {
  return termsOfUseService.patch(0, {}).then(() => {
    console.debug('[UserArea] request to update bitmap...')
  })
}

const userPicture = computed(() => {
  const style: {
    backgroundImage?: string
    backgroundColor: string
  } = {
    backgroundColor: 'black'
  }

  if (props.user.pattern) {
    const gradient = []

    props.user.pattern.forEach((color: string, i: number) => {
      const start = Math.round((100 * i) / props.user.pattern.length)
      const stop = Math.round((100 * (i + 1)) / props.user.pattern.length)
      gradient.push(`${color} ${start}%, ${color} ${stop}%`)
    })

    style.backgroundImage = `linear-gradient(180deg,${gradient.join(',')})`
  }
  return style
})
</script>
<i18n>
{
  "en": {
    "profile": "Profile",
    "label_terms_of_use": "Terms of Use",
    "label_change_plan_request": "Change Plan Request",
    "label_user_requests": "Your requests for data domains",
    "label_verbose_info": "[staff only] Verbose Info",
    "label_plans": "Plans",
    "logout": "Logout",
    "join_slack_channel": "Join Slack Channel",
    "current_version": "Current version: {version}",
    "send_test_job": "[staff only] Send test job",
    "send_update_bitmap":
      "[staff only] Test update bitmap"
    
  }
}
</i18n>
<style>
.UserArea.bg-dark .btn.dropdown-toggle {
  display: flex;
  align-items: center;
  color: var(--impresso-color-paper);
  border-color: transparent;
  padding: 0;
}
.UserArea.bg-dark .btn.dropdown-toggle:focus-visible {
  outline: none;
  box-shadow: none;
}

.UserArea.bg-dark .btn.dropdown-toggle:hover {
  color: var(--impresso-color-paper);
  background-color: var(--clr-grey-100);
  border-color: var(--clr-grey-100);
}
.UserArea.bg-dark .dropdown-menu {
  background-color: var(--impresso-color-black);
  color: var(--impresso-color-paper);
}
.UserArea.bg-dark .dropdown-item {
  color: var(--impresso-color-paper);
}
.UserArea.bg-dark .dropdown-menu.show {
  background-color: var(--clr-grey-100);
  border-color: var(--clr-grey-100);
  /* border radius top left should be rounded */
  border-top-left-radius: var(--impresso-border-radius-sm);
}
.UserArea.bg-dark.dropdown .btn.dropdown-toggle:not(.disabled):hover,
.UserArea.bg-dark.dropdown .btn.dropdown-toggle:not(.disabled):focus {
  /* background-color: var(--clr-grey-100); */
  border-radius: var(--impresso-border-radius-sm);
  /* box-shadow: none; */
}
.UserArea.bg-dark.dropdown.show .btn.dropdown-toggle {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.UserArea__userLabel,
.UserArea__userLabel .user-fullname,
.UserArea__userLabel .user-role {
  text-align: start;
  line-height: 1;
}
.UserArea .user-picture {
  width: 30px;
  height: 30px;
  border-radius: 30px;
  border: 1px solid var(--clr-grey-100);
}
</style>
