export enum IssuanceFailureType {
  GENERIC = "GENERIC",
  UNSUPPORTED_DEVICE = "UNSUPPORTED_DEVICE",
  NOT_MATCHING_IDENTITY = "NOT_MATCHING_IDENTITY"
}

export type IssuanceFailure = {
  type: IssuanceFailureType;
  reason?: unknown;
};