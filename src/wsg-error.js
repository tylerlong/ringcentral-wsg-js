class WSGError extends Error {
  constructor (response) {
    super()
    this.response = response
  }
}

export default WSGError
