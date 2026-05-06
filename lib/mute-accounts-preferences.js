"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPreferencesTab = exports.loadMuted = void 0;
const mailspring_exports_1 = require("mailspring-exports");
const STORAGE_KEY = "mailspring-mute-accounts-muted";
const STRINGS = {
    ru: {
        "Mute Accounts": "Уведомления",
        "Choose which accounts send desktop notifications.": "Выберите аккаунты, для которых включены уведомления.",
    },
};
const _lang = (typeof window !== "undefined" ? window.navigator.language : "en").split("-")[0].toLowerCase();
const _s = STRINGS[_lang] || {};
const t = (str) => _s[str] || str;
function loadMuted() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    }
    catch (e) {
        return {};
    }
}
exports.loadMuted = loadMuted;
function saveMuted(muted) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(muted));
}
class MuteAccountsPreferences extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this._toggle = (accountId) => {
            const muted = Object.assign({}, this.state.muted);
            if (muted[accountId]) {
                delete muted[accountId];
            }
            else {
                muted[accountId] = true;
            }
            saveMuted(muted);
            this.setState({ muted });
        };
        this.state = {
            muted: loadMuted(),
            accounts: mailspring_exports_1.AccountStore.accounts(),
        };
    }
    componentDidMount() {
        this._unsub = mailspring_exports_1.AccountStore.listen(() => {
            this.setState({ accounts: mailspring_exports_1.AccountStore.accounts() });
        });
    }
    componentWillUnmount() {
        if (this._unsub)
            this._unsub();
    }
    render() {
        const { accounts, muted } = this.state;
        return (mailspring_exports_1.React.createElement("div", { className: "mute-accounts-preferences" },
            mailspring_exports_1.React.createElement("section", null,
                mailspring_exports_1.React.createElement("h2", null, t("Mute Accounts")),
                mailspring_exports_1.React.createElement("p", { className: "mute-accounts-description" }, t("Choose which accounts send desktop notifications.")),
                mailspring_exports_1.React.createElement("div", { className: "mute-accounts-list" }, accounts.map(account => {
                    const isMuted = !!muted[account.id];
                    return (mailspring_exports_1.React.createElement("div", { key: account.id, className: "mute-accounts-row" },
                        mailspring_exports_1.React.createElement("div", { className: "mute-accounts-info" },
                            mailspring_exports_1.React.createElement("span", { className: "mute-accounts-email" }, account.emailAddress),
                            account.label && account.label !== account.emailAddress && (mailspring_exports_1.React.createElement("span", { className: "mute-accounts-label" }, account.label))),
                        mailspring_exports_1.React.createElement("label", { className: "mute-accounts-toggle" },
                            mailspring_exports_1.React.createElement("input", { type: "checkbox", checked: !isMuted, onChange: () => this._toggle(account.id) }),
                            mailspring_exports_1.React.createElement("span", { className: "mute-accounts-toggle-slider" }))));
                })))));
    }
}
function registerPreferencesTab() {
    const tab = new mailspring_exports_1.PreferencesUIStoreTab({
        tabId: "MuteAccounts",
        displayName: t("Mute Accounts"),
        componentClassFn: () => MuteAccountsPreferences,
        order: 999,
    });
    mailspring_exports_1.PreferencesUIStore.registerPreferencesTab(tab);
    return tab;
}
exports.registerPreferencesTab = registerPreferencesTab;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXV0ZS1hY2NvdW50cy1wcmVmZXJlbmNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tdXRlLWFjY291bnRzLXByZWZlcmVuY2VzLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyREFLNEI7QUFFNUIsTUFBTSxXQUFXLEdBQUcsZ0NBQWdDLENBQUM7QUFFckQsTUFBTSxPQUFPLEdBQUc7SUFDZCxFQUFFLEVBQUU7UUFDRixlQUFlLEVBQUUsYUFBYTtRQUM5QixtREFBbUQsRUFBRSxzREFBc0Q7S0FDNUc7Q0FDRixDQUFDO0FBQ0YsTUFBTSxLQUFLLEdBQUcsQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDN0csTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNoQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUVsQyxTQUFnQixTQUFTO0lBQ3ZCLElBQUk7UUFDRixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztLQUM5RDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxFQUFFLENBQUM7S0FDWDtBQUNILENBQUM7QUFORCw4QkFNQztBQUVELFNBQVMsU0FBUyxDQUFDLEtBQUs7SUFDdEIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRCxNQUFNLHVCQUF3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