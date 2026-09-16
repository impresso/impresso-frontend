import {
  SpecialMembershipRequestStatusApproved,
  SpecialMembershipRequestStatusPending
} from '@/constants'
import {
  SpecialMembershipAccess,
  UserSpecialMembershipRequest,
  UserSpecialMembershipRequestChangelogEntry,
  UserSpecialMembershipRequestReview
} from '@/services/types'
import {
  SpecialMembershipRequestStatuses,
  SpecialMembershipRequestStatusRejected,
  SpecialMembershipRequestStatusTemporary
} from '@/constants'

export const MockProviders = [
  'National Library of Scotland',
  'Biblioteca del Senato della Repubblica',
  'British Library',
  'Bibliothèque nationale de France',
  'Austrian National Library',
  'Library of Congress',
  'German National Library',
  'National Library of Spain',
  'National Library of Portugal',
  'Czech National Library',
  'Hungarian National Library',
  'National Library of Wales',
  'National Library of Ireland',
  'National Diet Library (Japan)',
  'Royal Library of Belgium'
]

export const MockSpecialMembershipAccess = MockProviders.map(
  (provider, index) =>
    ({
      id: index + 10,
      reviewerId: null,
      title: 'Data domain Access ' + index,
      bitmapPosition: 1,
      metadata: { provider, note: 'Test subscription ' + index },
      requests: null
    }) as SpecialMembershipAccess
)

export const MockSpecialMembershipAccessWithRequests = MockSpecialMembershipAccess.map(
  (item, index) =>
    ({
      ...item,
      requests:
        index % 3 === 0
          ? [
              {
                id: index + 1,
                reviewerId: null,
                specialMembershipAccessId: item.id,
                userId: 42,
                dateCreated: new Date().toISOString(),
                dateLastModified: new Date().toISOString(),
                status: 'pending',
                changelog: []
              }
            ]
          : null
    }) as SpecialMembershipAccess
)

export const MockUserSpecialMembershipRequests: UserSpecialMembershipRequest[] = Array.from(
  { length: Math.floor(MockProviders.length / 2) },
  (_, i) => {
    const status =
      i % 3 === 0 ? SpecialMembershipRequestStatusApproved : SpecialMembershipRequestStatusPending
    const numOfChangelogs = Math.floor(Math.random() * 1) + 1
    return {
      id: i + 1,
      reviewerId: null,
      specialMembershipAccessId: i + 10,
      userId: 42,
      specialMembershipAccess: MockSpecialMembershipAccess[i],
      dateCreated: new Date().toISOString(),
      dateLastModified: new Date().toISOString(),
      status,
      notes: '',
      changelog: Array.from(
        { length: numOfChangelogs },
        (_, j) =>
          ({
            subscription: 'Data domain Access ' + i,
            date: new Date().toISOString(),
            reviewer: null,
            status: j === numOfChangelogs - 1 ? status : SpecialMembershipRequestStatusPending,
            notes: 'Changelog entry ' + (j + 1)
          }) as UserSpecialMembershipRequestChangelogEntry
      )
    }
  }
)

const MockRequesters = [
  { firstname: 'Ada', lastname: 'Lovelace', affiliation: 'University of Luxembourg' },
  { firstname: 'Alan', lastname: 'Turing', affiliation: 'University of Cambridge' },
  { firstname: 'Grace', lastname: 'Hopper', affiliation: 'Yale University' },
  { firstname: 'Katherine', lastname: 'Johnson', affiliation: '' },
  { firstname: 'Hedy', lastname: 'Lamarr', affiliation: 'Austrian National Library' },
  { firstname: 'Rosalind', lastname: 'Franklin', affiliation: "King's College London" }
]

/**
 * Requests as returned by the `user-special-membership-requests-reviews`
 * service, which embeds the requester so a reviewer can judge a request from
 * the list alone. One fixture per status so every badge is covered.
 */
export const MockUserSpecialMembershipRequestReviews: UserSpecialMembershipRequestReview[] =
  SpecialMembershipRequestStatuses.map((status, index) => {
    const requester = MockRequesters[index % MockRequesters.length]
    const access = MockSpecialMembershipAccess[index % MockSpecialMembershipAccess.length]
    const dateCreated = new Date(Date.UTC(2026, 0, 4 + index, 9, 30)).toISOString()
    const dateLastModified = new Date(Date.UTC(2026, 1, 2 + index, 14, 5)).toISOString()

    return {
      id: index + 1,
      reviewerId: index % 2 === 0 ? 1 : null,
      specialMembershipAccessId: access.id,
      userId: 40 + index,
      specialMembershipAccess: access,
      dateCreated,
      dateLastModified,
      temporaryExpiresAt:
        status === SpecialMembershipRequestStatusTemporary
          ? new Date(Date.UTC(2026, 5, 30)).toISOString()
          : null,
      status,
      notes:
        status === SpecialMembershipRequestStatusRejected
          ? 'The affiliation could not be verified with the institution.'
          : 'Requested for a research project on interwar press coverage.',
      changelog: [
        {
          subscription: access.title,
          date: dateCreated,
          reviewer: '',
          status: 'pending',
          notes: 'This is a message for the reviewer'
        },
        {
          subscription: access.title,
          date: dateLastModified,
          reviewer: 'reviewer@impresso-project.ch',
          status,
          notes: `Status set to ${status}.`
        }
      ],
      requester: {
        id: 40 + index,
        email: `${requester.firstname.toLowerCase()}.${requester.lastname.toLowerCase()}@example.ac.uk`,
        firstname: requester.firstname,
        lastname: requester.lastname,
        groups: [{ id: 3, name: 'plan-educational' }],
        profile: {
          id: index + 2,
          uid: `local-${requester.lastname.toLowerCase()}`,
          provider: 'local',
          displayName: `${requester.firstname} ${requester.lastname}`,
          pattern: '#588c7e,#f2e394,#96ceb4,#677e96,#677e96',
          picture: null,
          user_id: 40 + index,
          emailAccepted: true,
          maxLoopsAllowed: 200,
          maxParallelJobs: 2,
          institutionalUrl: '',
          affiliation: requester.affiliation,
          profileId: index + 1
        },
        bitmap: 'AAAAAAAAAAs'
      }
    } satisfies UserSpecialMembershipRequestReview
  })
