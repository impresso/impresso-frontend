export default class NamesService {
  async getNewspaperLabel(newspaperId) {
    if (!window.impressoNewspapers) return newspaperId
    const newspaper = window.impressoNewspapers[newspaperId]
    return newspaper ? newspaper.name : newspaperId
  }
}