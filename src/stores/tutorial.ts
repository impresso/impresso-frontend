import { defineStore } from 'pinia'

export interface State {
  tutorial: string[]
}

export const useTutorialStore = defineStore('tutorial', {
  