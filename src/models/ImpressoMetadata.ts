/**
 * Type definitions for the global window object extensions used in impresso
 */

/**
 * Represents API version information
 */
export interface ApiVersion {
  /** Version string */
  version: string
  /** Git branch name */
  branch: string
  /** Git revision hash */
  revision: string
}

/**
 * Represents the date span of available documents
 */
export interface DocumentsDateSpan {
  /** ISO date string for the first available document */
  firstDate: string
  /** ISO date string for the last available document */
  lastDate: string
}

/**
 * Represents the year span of available documents
 */
export interface DocumentsYearSpan {
  /** First year of available documents */
  firstYear: number
  /** Last year of available documents */
  lastYear: number
}

/**
 * Represents feature flags for the application
 */
export interface ImpressoFeatures {
  /** Text reuse feature configuration */
  textReuse?: {
    enabled: boolean
  }
  /** View plans feature configuration */
  viewPlans?: {
    enabled: boolean
  }
  /** Barista feature configuration */
  barista?: {
    enabled: boolean
  }
}

/**
 * Git repository information
 */
export interface GitRepoInfo {
  /** Version tag */
  version: string
  /** Git revision hash */
  revision: string
  /** Git branch name */
  branch: string
  /** Git repository URL */
  gitRepoUrl: string
  /** URL to specific commit */
  gitCommitUrl: string
  /** Label for git commit URL */
  gitCommitUrlLabel: string
}

/**
 * Overall project information
 */
export interface ProjectInfo {
  /** Repository URL */
  repoUrl: string
  /** Repository URL label */
  repoUrlLabel: string
}

/**
 * Complete impresso information including frontend, middleware and project info
 */
export interface ImpressoInfo {
  /** Frontend repository information */
  frontend: GitRepoInfo
  /** Middle layer repository information */
  middleLayer: GitRepoInfo
  /** Overall project information */
  project: ProjectInfo
}

/**
 * Data providers mapping
 */
export interface ImpressoDataProviders {
  [key: string]: string
}

/**
 * Global metadata for Impresso
 */
export interface ImpressoGlobalMetadata extends Window {
  /** Frontend version tag */
  impressoFrontendVersion?: string
  /** Frontend revision hash */
  impressoFrontendRevision?: string
  /** Frontend branch name */
  impressoFrontendBranch?: string
  /** Impresso version */
  impressoVersion?: string
  /** API version information */
  impressoApiVersion?: ApiVersion
  /** Documents date span */
  impressoDocumentsDateSpan?: DocumentsDateSpan
  /** Documents year span */
  impressoDocumentsYearSpan?: DocumentsYearSpan
  /** Available newspapers */
  impressoNewspapers?: Record<string, unknown>
  /** Data providers mapping */
  impressoDataProviders?: ImpressoDataProviders
  /** Feature flags */
  impressoFeatures?: ImpressoFeatures
  /** Complete impresso information */
  impressoInfo?: ImpressoInfo
}

/**
 * Safely access the global impresso metadata
 */
export const getImpressoMetadata = (): ImpressoGlobalMetadata => {
  return window as unknown as ImpressoGlobalMetadata
}
