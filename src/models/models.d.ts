export interface Entity {
  uid: string,

  start?: Number,
  end?: Number
}

export interface Filter {
  q: string[] | string,
  type: string,
  context: string,
  precision: string,

  items: Entity[]
}