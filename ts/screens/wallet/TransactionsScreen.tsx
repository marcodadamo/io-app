/**
 * This screen dispalys a list of transactions
 * from a specific credit card
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Content, Text, View , Button } from "native-base";
import * as React from "react";
import { RefreshControl, StyleSheet, Alert } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../components/ItemSeparatorComponent";

import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import H5 from "../../components/ui/H5";
import CardComponent from "../../components/wallet/card/CardComponent";
import TransactionsList from "../../components/wallet/TransactionsList";
import WalletLayout from "../../components/wallet/WalletLayout";
import PaymentMethodCapabilities from "../../features/wallet/component/PaymentMethodCapabilities";
import I18n from "../../i18n";
import {
  navigateToTransactionDetailsScreen,
  navigateToWalletHome,
  navigateToWalletList
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import {
  fetchTransactionsRequest,
  readTransaction
} from "../../store/actions/wallet/transactions";
import {
  deleteWalletRequest,
  setFavouriteWalletRequest
} from "../../store/actions/wallet/wallets";
import { paymentsHistorySelector } from "../../store/reducers/payments/history";
import { GlobalState } from "../../store/reducers/types";
import {
  areMoreTransactionsAvailable,
  getTransactions,
  getTransactionsLoadedLength
} from "../../store/reducers/wallet/transactions";
import {
  getFavoriteWalletId,
  paymentMethodsSelector
} from "../../store/reducers/wallet/wallets";
import variables from "../../theme/variables";
import { Transaction, Wallet } from "../../types/pagopa";
import { showToast } from "../../utils/showToast";
import { handleSetFavourite } from "../../utils/wallet";
import { IOColors } from "../../components/core/variables/IOColors";
import { Label } from "../../components/core/typography/Label";
// import pagoBancomatImage from "../../../../../img/wallet/cards-icons/pagobancomat.png";

//my import
import { BottomSheetContent } from "../../components/bottomSheet/BottomSheetContent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { PaymentMethodRepresentationComponent } from "../../features/bonus/bpd/components/paymentMethodActivationToggle/base/PaymentMethodRepresentationComponent";
import { Body } from "../../components/core/typography/Body";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import pagoBancomatImage from "../../img/wallet/cards-icons/pagobancomat.png";
import { useRemovePaymentMethodBottomSheet } from "../../features/wallet/component/RemovePaymentMethod";

type NavigationParams = Readonly<{
  selectedWallet: Wallet;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  walletBannerText: {
    alignItems: "flex-end",
    flexDirection: "row"
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 30
  },

  whiteBg: {
    backgroundColor: variables.colorWhite
  },

  brandDarkGray: {
    color: variables.brandDarkGray
  },

  cardContainer: {
    height: 235,
    width: "100%",
    position: "absolute",
    top: 16,
    zIndex: 7,
    elevation: 7,
    alignItems: "center"
  },
  headerSpacer: {
    height: 172
  },
  cancelButton: {
    borderColor: IOColors.red,
    width: '90%',
    marginHorizontal: variables.contentPadding,
    marginBottom:30,
  }
});


const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.walletCardTransaction.contextualHelpTitle",
  body: "wallet.walletCardTransaction.contextualHelpContent"
};

const UnsubscribeButton = (props: { onPress?: () => void }) => (
  <Button bordered={true} style={styles.cancelButton} onPress={props.onPress}>
    <Label color={"red"}>{I18n.t("wallet.bancomat.details.removeCta")}</Label>
  </Button>
);

const ListEmptyComponent = (
  <Content
    scrollEnabled={false}
    style={[styles.noBottomPadding, styles.whiteBg]}
  >
    <H5 style={styles.brandDarkGray}>{I18n.t("wallet.noneTransactions")}</H5>
    <View spacer={true} />
    <Text>{I18n.t("wallet.noTransactionsInTransactionsScreen")}</Text>
    <View spacer={true} large={true} />
    <EdgeBorderComponent />
  </Content>
);

const HEADER_HEIGHT = 250;

class TransactionsScreen extends React.Component<Props> {
  
  private headerContent(
    selectedWallet: Wallet,
    isFavorite: pot.Pot<boolean, Error>
  ) {
    return (
      <React.Fragment>
        <CardComponent
          type={"Header"}
          wallet={selectedWallet}
          hideFavoriteIcon={false}
          hideMenu={false}
          isFavorite={isFavorite}
          onSetFavorite={(willBeFavorite: boolean) =>
            handleSetFavourite(willBeFavorite, () =>
              this.props.setFavoriteWallet(selectedWallet.idWallet)
            )
          }
          onDelete={() => this.props.deleteWallet(selectedWallet.idWallet)}
        />
      </React.Fragment>
    );
  }

  private handleLoadMoreTransactions = () => {
    this.props.loadTransactions(this.props.transactionsLoadedLength);
  };
  

  public render(): React.ReactNode {
    const selectedWallet = this.props.navigation.getParam("selectedWallet");

    const transactions = pot.map(this.props.transactions, tsx =>
      tsx
        .filter(t => t.idWallet === selectedWallet.idWallet)
        .sort((a, b) => b.created.getTime() - a.created.getTime())
    );

    const isFavorite = pot.map(
      this.props.favoriteWallet,
      _ => _ === selectedWallet.idWallet
    );

    // to retro-compatibility purpose
    const pm = pot.getOrElse(
      pot.map(this.props.paymentMethods, pms =>
        pms.find(pm => pm.idWallet === selectedWallet.idWallet)
      ),
      undefined
    );

    const transactionsRefreshControl = (
      <RefreshControl
        onRefresh={() => {
          this.props.loadTransactions(this.props.transactionsLoadedLength);
        }}
        // The refresh control spinner is displayed only at pull-to-refresh
        // while, during the transactions reload, it is displayed the custom transaction
        // list spinner
        refreshing={false}
        tintColor={"transparent"}
      />
    );

    return (
      <WalletLayout
        title={I18n.t("wallet.paymentMethod")}
        allowGoBack={true}
        topContent={this.headerContent(selectedWallet, isFavorite)}
        hideHeader={true}
        hasDynamicSubHeader={true}
        topContentHeight={HEADER_HEIGHT}
        refreshControl={transactionsRefreshControl}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet_transaction"]}
      >
        {pm && (
          <View style={IOStyles.horizontalContentPadding}>
            <View spacer={true} extralarge={true} />
            <PaymentMethodCapabilities paymentMethod={pm} />
            <View spacer={true} />
            <ItemSeparatorComponent noPadded={true} />
          </View>
        )}
        <TransactionsList
          title={I18n.t("wallet.transactions")}
          amount={I18n.t("wallet.amount")}
          transactions={transactions}
          areMoreTransactionsAvailable={this.props.areMoreTransactionsAvailable}
          onLoadMoreTransactions={this.handleLoadMoreTransactions}
          navigateToTransactionDetails={
            this.props.navigateToTransactionDetailsScreen
          }
          readTransactions={this.props.readTransactions}
          ListEmptyComponent={ListEmptyComponent}
        />
        <UnsubscribeButton
          //we need to call custom hooks here
          // onPress={() => this.props.deleteWallet(selectedWallet.idWallet)}
          //for now we handle it with an alert
          onPress={
            () => {
              Alert.alert(
                I18n.t("cardComponent.deleteTitle"),
                I18n.t("cardComponent.deleteMsg"),
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  },
                  { text: "Delete", onPress: () => this.props.deleteWallet(selectedWallet.idWallet) }
                ],
                { cancelable: false }
              );
            }
          }
        />
      </WalletLayout>
    );
  }
}

const show_bottom = (id) => {
  alert(id)

}


const mapStateToProps = (state: GlobalState) => ({
  transactions: getTransactions(state),
  potPayments: paymentsHistorySelector(state),
  transactionsLoadedLength: getTransactionsLoadedLength(state),
  favoriteWallet: getFavoriteWalletId(state),
  readTransactions: state.entities.transactionsRead,
  areMoreTransactionsAvailable: areMoreTransactionsAvailable(state),
  paymentMethods: paymentMethodsSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadTransactions: (start: number) =>
    dispatch(fetchTransactionsRequest({ start })),
  navigateToTransactionDetailsScreen: (transaction: Transaction) => {
    dispatch(readTransaction(transaction));
    dispatch(
      navigateToTransactionDetailsScreen({
        transaction,
        isPaymentCompletedTransaction: false
      })
    );
  },
  setFavoriteWallet: (walletId?: number) =>
    dispatch(setFavouriteWalletRequest(walletId)),
  deleteWallet: (walletId: number) =>
    dispatch(
      deleteWalletRequest({
        walletId,
        onSuccess: action => {
          showToast(I18n.t("wallet.delete.successful"), "success");
          if (action.payload.length > 0) {
            dispatch(navigateToWalletList());
          } else {
            dispatch(navigateToWalletHome());
          }
        },
        onFailure: _ => {
          showToast(I18n.t("wallet.delete.failed"), "danger");
        }
      })
    )
});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionsScreen);
