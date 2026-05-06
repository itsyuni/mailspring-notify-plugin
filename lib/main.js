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
    _originalDisplayNotification = mailspring_exports_1.NativeNotifications.displayNotification.bind(mailspring_exports_1.NativeNotifications);
    mailspring_exports_1.NativeNotifications.displayNotification = async function (opts) {
        const threadId = opts && opts.threadId;
        if (threadId) {
            const accountId = await _getAccountIdForThread(threadId);
            if (accountId && mute_accounts_preferences_1.loadMuted()[accountId]) {
                return null;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJEQUs0QjtBQUM1QiwyRUFBZ0Y7QUFFaEYsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLElBQUksNEJBQTRCLEdBQUcsSUFBSSxDQUFDO0FBRXhDLEtBQUssVUFBVSxzQkFBc0IsQ0FBQyxRQUFRO0lBQzVDLElBQUk7UUFDRixNQUFNLE9BQU8sR0FBRyxNQUFNLGtDQUFhLENBQUMsT0FBTyxDQUFDLDJCQUFNLEVBQUUsMkJBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQyxPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDO1NBQ3JDO0tBQ0Y7SUFBQyxPQUFPLENBQUMsRUFBRSxHQUFFO0lBQ2QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsU0FBZ0IsUUFBUTtJQUN0QixJQUFJLEdBQUcsa0RBQXNCLEVBQUUsQ0FBQztJQUVoQyw0QkFBNEIsR0FBRyx3Q0FBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsd0NBQW1CLENBQUMsQ0FBQztJQUNqRyx3Q0FBbUIsQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLFdBQVUsSUFBSTtRQUMzRCxNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN2QyxJQUFJLFFBQVEsRUFBRTtZQUNaLE1BQU0sU0FBUyxHQUFHLE1BQU0sc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekQsSUFBSSxTQUFTLElBQUkscUNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN2QyxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFDRCxPQUFPLDRCQUE0QixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFkRCw0QkFjQztBQUVELFNBQWdCLFNBQVMsS0FBSSxDQUFDO0FBQTlCLDhCQUE4QjtBQUU5QixTQUFnQixVQUFVO0lBQ3hCLElBQUksNEJBQTRCLEVBQUU7UUFDaEMsd0NBQW1CLENBQUMsbUJBQW1CLEdBQUcsNEJBQTRCLENBQUM7UUFDdkUsNEJBQTRCLEdBQUcsSUFBSSxDQUFDO0tBQ3JDO0lBQ0QsSUFBSSxJQUFJLEVBQUU7UUFDUix1Q0FBa0IsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEQsSUFBSSxHQUFHLElBQUksQ0FBQztLQUNiO0FBQ0gsQ0FBQztBQVRELGdDQVNDIn0=