import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../store/reducers/types";
import { loadCoBadgeAbiConfiguration } from "../actions";
import { StatusEnum } from "../../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeService";

export type AbiConfigurationState = pot.Pot<IndexedById<StatusEnum>, Error>;

const abiConfigurationReducer = (
  state: AbiConfigurationState = pot.none,
  action: Action
): AbiConfigurationState => {
  switch (action.type) {
    case getType(loadCoBadgeAbiConfiguration.request):
      return pot.toLoading(state);
    case getType(loadCoBadgeAbiConfiguration.success):
      // TODO: check for performance and compare with immutable-js if needed
      // First layer: key: serviceid, values: abi list and activation state
      const abiConfiguration = Object.keys(action.payload).reduce<
        IndexedById<StatusEnum>
      >((acc, val) => {
        // foreach service, generate the mapping abi: state
        const serviceState = action.payload[val].status;
        const serviceAbiWithConfiguration = action.payload[val].issuers.reduce<
          IndexedById<StatusEnum>
        >(
          (acc, val) => ({
            ...acc,
            [val.abi]: serviceState
          }),
          {}
        );
        // return a flat IndexedById<AbiConfiguration>
        return { ...acc, ...serviceAbiWithConfiguration };
      }, {});
      return pot.some(abiConfiguration);
    case getType(loadCoBadgeAbiConfiguration.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

/**
 * Return the co-badge configuration for a specific AbiId
 * @param state
 * @param abiId
 */
export const getCoBadgeAbiConfiguration = (
  state: GlobalState,
  abiId: string
): pot.Pot<StatusEnum, Error> =>
  pot.map(
    state.wallet.onboarding.coBadge.abiConfiguration,
    abiConfigById => abiConfigById[abiId] ?? StatusEnum.disabled
  );

export default abiConfigurationReducer;