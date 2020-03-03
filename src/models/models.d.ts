export interface Entity {
  uid: string
}

export interface Filter {
  q: string[] | string,
  type: string,
  context: string,
  precision: string,

  items: Entity[]
}