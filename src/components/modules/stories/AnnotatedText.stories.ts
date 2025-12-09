import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AnnotatedText, { RenderProps } from '@/components/modules/AnnotatedText.vue'
import { fn } from 'storybook/test'
import { ref } from 'vue'

const testChildren = [
  {
    entity: { kind: 'line', offset: { start: 27, end: 61 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          ' QG ',
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: ['allié, 27 septembre. (Reuter.)'],
            isContinuation: false
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 61, end: 108 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' Les troupes de la première division aéroportée'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 108, end: 161 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [" britannique, qui ont subi, à l'ouest d'Amhem de très"],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 161, end: 214 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' violents assauts, se sont retirées sur les rives sud'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 214, end: 227 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' du bas Rhin.'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 227, end: 274 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' La retraite des forces aéroportées sur la rive'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 274, end: 322 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [" sud du bas Rhin s'est faite principalement dans"],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 322, end: 370 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' la nuit de mercredi et est maintenant terminée.'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 370, end: 423 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [" Une partie des blessés a dû être Laissée sur l'autre"],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 423, end: 473 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' rive, où elle est tombée aux mains des Allemands.'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 473, end: 522 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' Bien que ce repli ait été nécessaire, l’attitude'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 522, end: 567 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [" courageuse de ces troupes a permis d'occuper"],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 567, end: 615 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [
              " l'important › pont de ",
              {
                entity: {
                  id: 'location-0',
                  kind: 'namedEntity',
                  type: 'location',
                  offset: { start: 590, end: 597 }
                },
                children: ['Nimègue'],
                isContinuation: false,
                isLast: true
              },
              '. Le mauvais temps'
            ],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 615, end: 664 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [" a empêché l'envoi par les airs de renforts et de"],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 664, end: 713 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' ravitaillement en quantité suffisante. Aussi les'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 713, end: 761 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' Allemands surent-ils en profiter. Ils mirent en'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 761, end: 812 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [" action surtout des troupes d'élite, principalement"],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 812, end: 861 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' des SS, Leurs pertes fuirent lourdes. On ne peut'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 861, end: 909 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' encore évaluer définitivement celles des forces'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 909, end: 959 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' aéroportées, Les troupes qui se sont repliées ont'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 959, end: 1006 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' opéré leur jonction avec celles opérant sur la'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 1006, end: 1024 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' rive sud du Rhin,'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 1024, end: 1069 } },
    children: [
      {
        entity: {
          id: 'c25770015534-LSE-1944-09-28-a-i0032@0:1025',
          clusterId: 'tr-nobp-all-v01-c25770015534',
          kind: 'passage',
          type: 'passage',
          offset: { start: 0, end: 1025 }
        },
        children: [
          {
            entity: {
              id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
              clusterId: 'tr-nobp-all-v01-c68719566437',
              kind: 'passage',
              type: 'passage',
              offset: { start: 31, end: 1239 }
            },
            children: [' '],
            isContinuation: true
          }
        ],
        isContinuation: true,
        isLast: true
      },
      {
        entity: {
          id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
          clusterId: 'tr-nobp-all-v01-c68719566437',
          kind: 'passage',
          type: 'passage',
          offset: { start: 31, end: 1239 }
        },
        children: [
          {
            entity: {
              id: 'c68719497779-LSE-1944-09-28-a-i0032@1025:1239',
              clusterId: 'tr-nobp-all-v01-c68719497779',
              kind: 'passage',
              type: 'passage',
              offset: { start: 1025, end: 1239 }
            },
            children: ['6000 à 7000 hommes avaient été lâchés il y a'],
            isContinuation: false
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 1069, end: 1118 } },
    children: [
      {
        entity: {
          id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
          clusterId: 'tr-nobp-all-v01-c68719566437',
          kind: 'passage',
          type: 'passage',
          offset: { start: 31, end: 1239 }
        },
        children: [
          {
            entity: {
              id: 'c68719497779-LSE-1944-09-28-a-i0032@1025:1239',
              clusterId: 'tr-nobp-all-v01-c68719497779',
              kind: 'passage',
              type: 'passage',
              offset: { start: 1025, end: 1239 }
            },
            children: [" dix jours dans le secteur d'Arnhem. Plus de 2000"],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 1118, end: 1164 } },
    children: [
      {
        entity: {
          id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
          clusterId: 'tr-nobp-all-v01-c68719566437',
          kind: 'passage',
          type: 'passage',
          offset: { start: 31, end: 1239 }
        },
        children: [
          {
            entity: {
              id: 'c68719497779-LSE-1944-09-28-a-i0032@1025:1239',
              clusterId: 'tr-nobp-all-v01-c68719497779',
              kind: 'passage',
              type: 'passage',
              offset: { start: 1025, end: 1239 }
            },
            children: [' survivants ont réussi à rejoindre la deuxième'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 1164, end: 1217 } },
    children: [
      {
        entity: {
          id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
          clusterId: 'tr-nobp-all-v01-c68719566437',
          kind: 'passage',
          type: 'passage',
          offset: { start: 31, end: 1239 }
        },
        children: [
          {
            entity: {
              id: 'c68719497779-LSE-1944-09-28-a-i0032@1025:1239',
              clusterId: 'tr-nobp-all-v01-c68719497779',
              kind: 'passage',
              type: 'passage',
              offset: { start: 1025, end: 1239 }
            },
            children: [' armée britannique ; 1200 blessés ont été laissés aux'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 1217, end: 1238 } },
    children: [
      {
        entity: {
          id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
          clusterId: 'tr-nobp-all-v01-c68719566437',
          kind: 'passage',
          type: 'passage',
          offset: { start: 31, end: 1239 }
        },
        children: [
          {
            entity: {
              id: 'c68719497779-LSE-1944-09-28-a-i0032@1025:1239',
              clusterId: 'tr-nobp-all-v01-c68719497779',
              kind: 'passage',
              type: 'passage',
              offset: { start: 1025, end: 1239 }
            },
            children: [' mains des Allemands.'],
            isContinuation: true
          }
        ],
        isContinuation: true
      }
    ],
    isContinuation: false,
    isLast: true
  },
  {
    entity: { kind: 'line', offset: { start: 1238, end: 1239 } },
    children: [
      {
        entity: {
          id: 'c68719566437-LSE-1944-09-28-a-i0032@31:1239',
          clusterId: 'tr-nobp-all-v01-c68719566437',
          kind: 'passage',
          type: 'passage',
          offset: { start: 31, end: 1239 }
        },
        children: [
          {
            entity: {
              id: 'c68719497779-LSE-1944-09-28-a-i0032@1025:1239',
              clusterId: 'tr-nobp-all-v01-c68719497779',
              kind: 'passage',
              type: 'passage',
              offset: { start: 1025, end: 1239 }
            },
            children: [' '],
            isContinuation: true,
            isLast: true
          }
        ],
        isContinuation: true,
        isLast: true
      }
    ],
    isContinuation: false,
    isLast: true
  }
]

const testClusterColours = {
  'tr-nobp-all-v01-c25770015534': '#8dd3c7',
  'tr-nobp-all-v01-c68719497779': '#bebada',
  'tr-nobp-all-v01-c68719566437': '#fb8072'
}

const meta: Meta = {
  title: 'Components/Modules/AnnotatedText',
  component: AnnotatedText,
  tags: ['autodocs'],
  argTypes: {},
  args: {
    children: testChildren,
    clusterColours: testClusterColours,
    selectedClusterId: 'tr-nobp-all-v01-c68719566437',
    onClusterSelected: fn(),
    onPassageClicked: fn(),
    onPassageMouseenter: fn(),
    onPassageMouseleave: fn()
  } as RenderProps, // default value
  render: (args: RenderProps) => ({
    components: { AnnotatedText },
    template: '<AnnotatedText v-bind="args" :selectedClusterId="selectedClusterId" />',
    setup() {
      const selectedClusterId = ref(Object.keys(args.clusterColours)[0])
      const onClusterSelected = (clusterId, entityId) => {
        selectedClusterId.value = clusterId
        args.onClusterSelected?.(clusterId, entityId)
      }
      return { args: { ...args, onClusterSelected }, selectedClusterId }
    }
  }),
  decorators: [
    () => ({ template: '<div style="width: 800px; height:600px; display: block;"><story/></div>' })
  ]
} satisfies Meta<typeof AnnotatedText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
