import { ITW_ROUTES } from "./routes";

export type ItwParamsList = {
  // DISCOVERY
  [ITW_ROUTES.DISCOVERY.INFO]: undefined;
  // IDENTIFICATION
  [ITW_ROUTES.IDENTIFICATION.MODE_SELECTION]: undefined;
  [ITW_ROUTES.IDENTIFICATION.NFC_INSTRUCTIONS]: undefined;
  [ITW_ROUTES.IDENTIFICATION.IDP_SELECTION]: undefined;
  // ISSUANCE
  [ITW_ROUTES.ISSUANCE.EID_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_AUTH]: undefined;
  [ITW_ROUTES.ISSUANCE.CREDENTIAL_PREVIEW]: undefined;
  [ITW_ROUTES.ISSUANCE.RESULT]: undefined;
  // PRESENTATION
  [ITW_ROUTES.PRESENTATION.EID_DETAIL]: undefined;
};
