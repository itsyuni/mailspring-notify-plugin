import {
  NativeNotifications,
  PreferencesUIStore,
  DatabaseStore,
  Thread,
} from "mailspring-exports";
import { loadMuted, registerPreferencesTab } from "./mute-accounts-preferences";

let _tab = null;
let _originalDisplayNotification = null;

async function _getAccountIdForThread(threadId) {
  try {
    const threads = await DatabaseStore.findAll(Thread, Thread.attributes.id.in([threadId]));
    if (threads && threads.length > 0) {
      return threads[0].accountId || null;
    }
  } catch (e) {}
  return null;
}

export function activate() {
  _tab = registerPreferencesTab();

  // NativeNotifications is a singleton object — patching its method directly
  // works regardless of module load order because unread-notifications calls
  // it as NativeNotifications.displayNotification(...) every time, not via
  // a cached function reference.
  _originalDisplayNotification = NativeNotifications.displayNotification.bind(NativeNotifications);

  NativeNotifications.displayNotification = async function(opts) {
    const threadId = opts && opts.threadId;
    if (threadId) {
      const accountId = await _getAccountIdForThread(threadId);
      if (accountId && loadMuted()[accountId]) {
        return null;
      }
    }
    // Also check accountId if passed directly in opts (future-proof)
    const directAccountId = opts && opts.accountId;
    if (directAccountId && loadMuted()[directAccountId]) {
      return null;
    }
    return _originalDisplayNotification(opts);
  };
}

export function serialize() {}

export function deactivate() {
  if (_originalDisplayNotification) {
    NativeNotifications.displayNotification = _originalDisplayNotification;
    _originalDisplayNotification = null;
  }
  if (_tab) {
    PreferencesUIStore.unregisterPreferencesTab(_tab.tabId);
    _tab = null;
  }
}
