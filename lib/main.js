"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.serialize = exports.activate = void 0;
const mailspring_exports_1 = require("mailspring-exports");
const mute_accounts_preferences_1 = require("./mute-accounts-preferences");
let _tab = null;
let _originalDisplayNotification = null;
let _originalPlaySound = null;
let _unlistenDB = null;
// Track accountIds of recently arrived non-muted messages.
// SoundRegistry.playSound is called before displayNotification,
// so we maintain a set that our own DB listener populates.
const _pendingNonMutedAccounts = new Set();
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
function _isMuted(accountId) {
    return !!mute_accounts_preferences_1.loadMuted()[accountId];
}
// Mirror the same filtering logic as unread-notifications so we know
// which accounts have "notif-worthy" messages coming in.
function _onDBChanged({ objectClass, objects, objectsRawJSON }) {
    if (objectClass !== mailspring_exports_1.Message.name)
        return;
    const activationTime = _activationTime;
    const newIds = new Set();
    for (const json of (objectsRawJSON || [])) {
        if (json.headersSyncComplete)
            newIds.add(json.id);
    }
    if (!newIds.size)
        return;
    for (const msg of objects) {
        if (!msg.unread)
            continue;
        if (!newIds.has(msg.id))
            continue;
        if (!msg.date || msg.date.valueOf() < activationTime)
            continue;
        const accountId = msg.accountId;
        if (!accountId)
            continue;
        if (!_isMuted(accountId)) {
            _pendingNonMutedAccounts.add(accountId);
            // Clear after 10s (enough time for sound + notification cycle)
            setTimeout(() => _pendingNonMutedAccounts.delete(accountId), 10000);
        }
    }
}
let _activationTime = Date.now();
function activate() {
    _activationTime = Date.now();
    _tab = mute_accounts_preferences_1.registerPreferencesTab();
    // Watch DB for incoming messages to know which accounts are non-muted
    _unlistenDB = mailspring_exports_1.DatabaseStore.listen(_onDBChanged);
    // Patch displayNotification
    _originalDisplayNotification = mailspring_exports_1.NativeNotifications.displayNotification.bind(mailspring_exports_1.NativeNotifications);
    mailspring_exports_1.NativeNotifications.displayNotification = async function (opts) {
        const threadId = opts && opts.threadId;
        if (threadId) {
            const accountId = await _getAccountIdForThread(threadId);
            if (accountId && _isMuted(accountId)) {
                return null;
            }
        }
        return _originalDisplayNotification(opts);
    };
    // Patch SoundRegistry.playSound — suppress 'new-mail' if ALL
    // recently arrived messages are from muted accounts
    _originalPlaySound = mailspring_exports_1.SoundRegistry.playSound.bind(mailspring_exports_1.SoundRegistry);
    mailspring_exports_1.SoundRegistry.playSound = function (soundName) {
        if (soundName === "new-mail") {
            // If there are no non-muted accounts with pending messages, suppress
            if (_pendingNonMutedAccounts.size === 0) {
                return;
            }
        }
        return _originalPlaySound(soundName);
    };
}
exports.activate = activate;
function serialize() { }
exports.serialize = serialize;
function deactivate() {
    if (_unlistenDB) {
        _unlistenDB();
        _unlistenDB = null;
    }
    if (_originalDisplayNotification) {
        mailspring_exports_1.NativeNotifications.displayNotification = _originalDisplayNotification;
        _originalDisplayNotification = null;
    }
    if (_originalPlaySound) {
        mailspring_exports_1.SoundRegistry.playSound = _originalPlaySound;
        _originalPlaySound = null;
    }
    if (_tab) {
        mailspring_exports_1.PreferencesUIStore.unregisterPreferencesTab(_tab.tabId);
        _tab = null;
    }
    _pendingNonMutedAccounts.clear();
}
exports.deactivate = deactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJEQVE0QjtBQUM1QiwyRUFBZ0Y7QUFFaEYsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLElBQUksNEJBQTRCLEdBQUcsSUFBSSxDQUFDO0FBQ3hDLElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQzlCLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztBQUV2QiwyREFBMkQ7QUFDM0QsZ0VBQWdFO0FBQ2hFLDJEQUEyRDtBQUMzRCxNQUFNLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFFM0MsS0FBSyxVQUFVLHNCQUFzQixDQUFDLFFBQVE7SUFDNUMsSUFBSTtRQUNGLE1BQU0sT0FBTyxHQUFHLE1BQU0sa0NBQWEsQ0FBQyxPQUFPLENBQUMsMkJBQU0sRUFBRSwyQkFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUM7U0FDckM7S0FDRjtJQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUU7SUFDZCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxTQUFTLFFBQVEsQ0FBQyxTQUFTO0lBQ3pCLE9BQU8sQ0FBQyxDQUFDLHFDQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRUQscUVBQXFFO0FBQ3JFLHlEQUF5RDtBQUN6RCxTQUFTLFlBQVksQ0FBQyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFO0lBQzVELElBQUksV0FBVyxLQUFLLDRCQUFPLENBQUMsSUFBSTtRQUFFLE9BQU87SUFF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