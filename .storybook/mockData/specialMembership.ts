import {
  SpecialMembershipAccess,
  UserSpecialMembershipRequest,
  UserSpecialMembershipRequestChangelogEntry
} from '@/services/types'

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
    const status = i % 3 === 0 ? 'approved' : 'pending'
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
      changelog: Array.from(
        { length: numOfChangelogs },
        (_, j) =>
          ({
            subscription: 'Data domain Access ' + i,
            date: new Date().toISOString(),
            reviewer: null,
            status: j === numOfChangelogs - 1 ? status : 'pending',
            notes: 'Changelog entry ' + (j + 1)
          }) as UserSpecialMembershipRequestChangelogEntry
      )
    }
  }
)
