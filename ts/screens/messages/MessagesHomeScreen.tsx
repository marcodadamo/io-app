/**
 * A screen that contains all the Tabs related to messages.
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Tab, Tabs } from "native-base";
import * as React from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import {
  NavigationEventSubscription,
  NavigationScreenProps
} from "react-navigation";
import { connect } from "react-redux";
import MessagesArchive from "../../components/messages/MessagesArchive";
import MessagesDeadlines from "../../components/messages/MessagesDeadlines";
import MessagesInbox from "../../components/messages/MessagesInbox";
import MessagesSearch from "../../components/messages/MessagesSearch";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { MIN_CHARACTER_SEARCH_TEXT } from "../../components/search/SearchButton";
import { SearchNoResultMessage } from "../../components/search/SearchNoResultMessage";
import I18n from "../../i18n";
import {
  loadMessages,
  setMessagesArchivedState
} from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { loadService } from "../../store/actions/services";
import { Dispatch } from "../../store/actions/types";
import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import {
  servicesByIdSelector,
  ServicesByIdState
} from "../../store/reducers/entities/services/servicesById";
import {
  isSearchMessagesEnabledSelector,
  searchTextSelector
} from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";
import { HEADER_HEIGHT } from "../../utils/constants";
import { setStatusBarColorAndBackground } from "../../utils/statusBar";

type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  currentTab: number;
};

const styles = StyleSheet.create({
  tabBarContainer: {
    elevation: 0,
    height: 40
  },
  tabBarContent: {
    fontSize: customVariables.fontSizeSmall
  },
  tabBarUnderline: {
    borderBottomColor: customVariables.tabUnderlineColor,
    borderBottomWidth: customVariables.tabUnderlineHeight
  },
  tabBarUnderlineActive: {
    height: customVariables.tabUnderlineHeight,
    // borders do not overlap eachother, but stack naturally
    marginBottom: -customVariables.tabUnderlineHeight,
    backgroundColor: customVariables.contentPrimaryBackground
  },
  searchDisableIcon: {
    color: customVariables.headerFontColor
  },
  activeTextStyle: {
    ...makeFontStyleObject(Platform.select, "600"),
    fontSize: Platform.OS === "android" ? 16 : undefined,
    fontWeight: Platform.OS === "android" ? "normal" : "bold",
    color: customVariables.brandPrimary
  },
  textStyle: {
    color: customVariables.brandDarkGray,
    fontSize: customVariables.fontSizeSmall
  }
});

class MessagesHomeScreen extends React.PureComponent<Props, State> {
  private navListener?: NavigationEventSubscription;
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0
    };
  }

  private animatedTabScrollPositions: ReadonlyArray<Animated.Value> = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ];

  private onRefreshMessages = () => {
    this.props.refreshMessages(
      this.props.lexicallyOrderedMessagesState,
      this.props.servicesById
    );
  };

  public componentDidMount() {
    this.onRefreshMessages();
    this.navListener = this.props.navigation.addListener("didFocus", () => {
      setStatusBarColorAndBackground(
        "dark-content",
        customVariables.colorWhite
      );
    }); // tslint:disable-line no-object-mutation
  }

  public componentWillUnmount() {
    if (this.navListener) {
      this.navListener.remove();
    }
  }

  private getHeaderHeight = (
    currentTab: number
  ): Animated.AnimatedInterpolation =>
    this.animatedTabScrollPositions[currentTab].interpolate({
      inputRange: [0, HEADER_HEIGHT * 3], // The multiplier works as workaround to solve the glitch on Android OS (https://github.com/facebook/react-native/issues/21801)
      outputRange: [HEADER_HEIGHT, 0],
      extrapolate: "clamp"
    });

  public render() {
    const { isSearchEnabled } = this.props;

    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        isSearchAvailable={true}
        searchType={"Messages"}
        appLogo={true}
      >
        {!isSearchEnabled && (
          <React.Fragment>
            <ScreenContentHeader
              title={I18n.t("messages.contentTitle")}
              icon={require("../../../img/icons/message-icon.png")}
              dynamicHeight={this.getHeaderHeight(this.state.currentTab)}
            />
            {this.renderTabs()}
          </React.Fragment>
        )}
        {isSearchEnabled && this.renderSearch()}
      </TopScreenComponent>
    );
  }

  private handleOnChangeTab = (evt: any) => {
    this.setState({ currentTab: evt.i });
  };

  /**
   * Render Inbox, Deadlines and Archive tabs.
   */
  private renderTabs = () => {
    const {
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      navigateToMessageDetail,
      updateMessagesArchivedState
    } = this.props;

    return (
      <Tabs
        tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
        tabBarUnderlineStyle={styles.tabBarUnderlineActive}
        onChangeTab={this.handleOnChangeTab}
        initialPage={0}
      >
        <Tab
          activeTextStyle={styles.activeTextStyle}
          textStyle={styles.textStyle}
          heading={I18n.t("messages.tab.inbox")}
        >
          <MessagesInbox
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            onRefresh={this.onRefreshMessages}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
            animated={{
              onScroll: Animated.event([
                {
                  nativeEvent: {
                    contentOffset: { y: this.animatedTabScrollPositions[0] }
                  }
                }
              ]),
              scrollEventThrottle: 8
            }}
          />
        </Tab>
        <Tab
          activeTextStyle={styles.activeTextStyle}
          textStyle={styles.textStyle}
          heading={I18n.t("messages.tab.deadlines")}
        >
          <MessagesDeadlines
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
          />
        </Tab>

        <Tab
          activeTextStyle={styles.activeTextStyle}
          textStyle={styles.textStyle}
          heading={I18n.t("messages.tab.archive")}
        >
          <MessagesArchive
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            onRefresh={this.onRefreshMessages}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
            animated={{
              onScroll: Animated.event([
                {
                  nativeEvent: {
                    contentOffset: { y: this.animatedTabScrollPositions[2] }
                  }
                }
              ]),
              scrollEventThrottle: 8
            }}
          />
        </Tab>
      </Tabs>
    );
  };

  /**
   * Render MessageSearch component.
   */
  private renderSearch = () => {
    const {
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      navigateToMessageDetail
    } = this.props;

    return this.props.searchText
      .map(
        _ =>
          _.length < MIN_CHARACTER_SEARCH_TEXT ? (
            <SearchNoResultMessage errorType="InvalidSearchBarText" />
          ) : (
            <MessagesSearch
              messagesState={lexicallyOrderedMessagesState}
              servicesById={servicesById}
              paymentsByRptId={paymentsByRptId}
              onRefresh={this.onRefreshMessages}
              navigateToMessageDetail={navigateToMessageDetail}
              searchText={_}
            />
          )
      )
      .getOrElse(<SearchNoResultMessage errorType="InvalidSearchBarText" />);
  };
}

const mapStateToProps = (state: GlobalState) => ({
  lexicallyOrderedMessagesState: lexicallyOrderedMessagesStateSelector(state),
  servicesById: servicesByIdSelector(state),
  paymentsByRptId: paymentsByRptIdSelector(state),
  searchText: searchTextSelector(state),
  isSearchEnabled: isSearchMessagesEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshMessages: (
    lexicallyOrderedMessagesState: ReturnType<
      typeof lexicallyOrderedMessagesStateSelector
    >,
    servicesById: ServicesByIdState
  ) => {
    dispatch(loadMessages.request());
    // Refresh services related to messages received by the user
    if (pot.isSome(lexicallyOrderedMessagesState)) {
      lexicallyOrderedMessagesState.value.forEach(item => {
        if (servicesById[item.meta.sender_service_id] === undefined) {
          dispatch(loadService.request(item.meta.sender_service_id));
        }
      });
    }
  },
  refreshService: (serviceId: string) => {
    dispatch(loadService.request(serviceId));
  },
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageDetailScreenAction({ messageId })),
  updateMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => dispatch(setMessagesArchivedState(ids, archived))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessagesHomeScreen);
