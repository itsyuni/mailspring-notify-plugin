"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.serialize = exports.activate = void 0;
const mailspring_exports_1 = require("mailspring-exports");
const mute_accounts_preferences_1 = require("./mute-accounts-preferences");
let _tab = null;
let _originalDisplayNotification = null;
async function _getAccountIdForThread(threadId) {
    try {
        const threads = await mailspring_exports_1.DatabaseStore.findAll(mailspring_exports_1.Thread, mailspring_exports_1.Thread.attributes.id.in([threadId]));
        if (threads && threads.length > 0) {
            return threads[0].accountId || null;
        }
    }
    catch (e) { }
    return null;
}
function activate() {
    _tab = mute_accounts_preferences_1.registerPreferencesTab();
    // NativeNotifications is a singleton object — patching its method directly
    // works regardless of module load order because unread-notifications calls
    // it as NativeNotifications.displayNotification(...) every time, not via
    // a cached function reference.
    _originalDisplayNotification = mailspring_exports_1.NativeNotifications.displayNotification.bind(mailspring_exports_1.NativeNotifications);
    mailspring_exports_1.NativeNotifications.displayNotification = async function (opts) {
        const threadId = opts && opts.threadId;
        if (threadId) {
            const accountId = await _getAccountIdForThread(threadId);
            if (accountId && mute_accounts_preferences_1.loadMuted()[accountId]) {
                return null;
            }
        }
        // Also check accountId if passed directly in opts (future-proof)
        const directAccountId = opts && opts.accountId;
        if (directAccountId && mute_accounts_preferences_1.loadMuted()[directAccountId]) {
            return null;
        }
        return _originalDisplayNotification(opts);
    };
}
exports.activate = activate;
function serialize() { }
exports.serialize = serialize;
function deactivate() {
    if (_originalDisplayNotification) {
        mailspring_exports_1.NativeNotifications.displayNotification = _originalDisplayNotification;
        _originalDisplayNotification = null;
    }
    if (_tab) {
        mailspring_exports_1.PreferencesUIStore.unregisterPreferencesTab(_tab.tabId);
        _tab = null;
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJEQUs0QjtBQUM1QiwyRUFBZ0Y7QUFFaEYsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLElBQUksNEJBQTRCLEdBQUcsSUFBSSxDQUFDO0FBRXhDLEtBQUssVUFBVSxzQkFBc0IsQ0FBQyxRQUFRO0lBQzVDLElBQUk7UUFDRixNQUFNLE9BQU8sR0FBRyxNQUFNLGtDQUFhLENBQUMsT0FBTyxDQUFDLDJCQUFNLEVBQUUsMkJBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDO1NBQ3JDO0tBQ0Y7SUFBQyxPQUFPLENBQUMsRUFBRSxHQUFFO0lBQ2QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsU0FBZ0IsUUFBUTtJQUN0QixJQUFJLEdBQUcsa0RBQXNCLEVBQUUsQ0FBQztJQUVoQywyRUFBMkU7SUFDM0UsMkVBQTJFO0lBQzNFLHlFQUF5RTtJQUN6RSwrQkFBK0I7SUFDL0IsNEJBQTRCLEdBQUcsd0NBQW1CLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLHdDQUFtQixDQUFDLENBQUM7SUFFakcsd0NBQW1CLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxXQUFVLElBQUk7UUFDM0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdkMsSUFBSSxRQUFRLEVBQUU7WUFDWixNQUFNLFNBQVMsR0FBRyxNQUFNLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pELElBQUksU0FBUyxJQUFJLHFDQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDdkMsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBQ0QsaUVBQWlFO1FBQ2pFLE1BQU0sZUFBZSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQy9DLElBQUksZUFBZSxJQUFJLHFDQUFTLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUNuRCxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUM7QUFDSixDQUFDO0FBeEJELDRCQXdCQztBQUVELFNBQWdCLFNBQVMsS0FBSSxDQUFDO0FBQTlCLDhCQUE4QjtBQUU5QixTQUFnQixVQUFVO0lBQ3hCLElBQUksNEJBQTRCLEVBQUU7UUFDaEMsd0NBQW1CLENBQUMsbUJBQW1CLEdBQUcsNEJBQTRCLENBQUM7UUFDdkUsNEJBQTRCLEdBQUcsSUFBSSxDQUFDO0tBQ3JDO0lBQ0QsSUFBSSxJQUFJLEVBQUU7UUFDUix1Q0FBa0IsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEQsSUFBSSxHQUFHLElBQUksQ0FBQztLQUNiO0FBQ0gsQ0FBQztBQVRELGdDQVNDIn0=