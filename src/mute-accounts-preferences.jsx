import {
  React,
  AccountStore,
  PreferencesUIStore,
} from "mailspring-exports";

const STORAGE_KEY = "mailspring-notify-plugin-muted";

const STRINGS = {
  ru: {
    "Notifications": "Уведомления",
    "Choose which accounts send desktop notifications.": "Выберите аккаунты, для которых включены уведомления.",
  },
};
const _lang = (typeof window !== "undefined" ? window.navigator.language : "en").split("-")[0].toLowerCase();
const _s = STRINGS[_lang] || {};
const t = (str) => _s[str] || str;

export function loadMuted() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function saveMuted(muted) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(muted));
}

class MuteAccountsPreferences extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      muted: loadMuted(),
      accounts: AccountStore.accounts(),
    };
  }

  componentDidMount() {
    this._unsub = AccountStore.listen(() => {
      this.setState({ accounts: AccountStore.accounts() });
    });
  }

  componentWillUnmount() {
    if (this._unsub) this._unsub();
  }

  _toggle = (accountId) => {
    const muted = { ...this.state.muted };
    if (muted[accountId]) {
      delete muted[accountId];
    } else {
      muted[accountId] = true;
    }
    saveMuted(muted);
    this.setState({ muted });
  };

  render() {
    const { accounts, muted } = this.state;
    return (
      <div className="mute-accounts-preferences">
        <section>
          <h2>{t("Notifications")}</h2>
          <p className="mute-accounts-description">{t("Choose which accounts send desktop notifications.")}</p>
          <div className="mute-accounts-list">
            {accounts.map(account => {
              const isMuted = !!muted[account.id];
              return (
                <div key={account.id} className="mute-accounts-row">
                  <div className="mute-accounts-info">
                    <span className="mute-accounts-email">{account.emailAddress}</span>
                    {account.label && account.label !== account.emailAddress && (
                      <span className="mute-accounts-label">{account.label}</span>
                    )}
                  </div>
                  <label className="mute-accounts-toggle">
                    <input
                      type="checkbox"
                      checked={!isMuted}
                      onChange={() => this._toggle(account.id)}
                    />
                    <span className="mute-accounts-toggle-slider" />
                  </label>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }
}

export default MuteAccountsPreferences;

export function registerPreferencesTab() {
  const tab = new PreferencesUIStore.TabItem({
    tabId: "NotifyPlugin",
    displayName: t("Notifications"),
    componentClassFn: () => MuteAccountsPreferences,
    order: 999,
  });
  PreferencesUIStore.registerPreferencesTab(tab);
  return tab;
}
