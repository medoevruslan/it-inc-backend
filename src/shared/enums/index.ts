export enum HttpStatuses {
  Success = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  TooManyRequests = 429,
  ServerError = 500,
}

export enum ResultStatus {
  Success = HttpStatuses.Success,
  BadRequest = HttpStatuses.BadRequest,
  ServerError = HttpStatuses.ServerError,
  NotFound = HttpStatuses.NotFound,
}

export enum LikeType {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None'
}
