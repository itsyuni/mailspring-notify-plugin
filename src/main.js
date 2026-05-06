import {
  NativeNotifications,
  PreferencesUIStore,
  DatabaseStore,
  AccountStore,
  SoundRegistry,
  Thread,
  Message,
} from "mailspring-exports";
import { loadMuted, registerPreferencesTab } from "./mute-accounts-preferences";

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
    const threads = await DatabaseStore.findAll(Thread, Thread.attributes.id.in([threadId]));
    if (threads && threads.length > 0) {
      return threads[0].accountId || null;
    }
  } catch (e) {}
  return null;
}

function _isMuted(accountId) {
  return !!loadMuted()[accountId];
}

// Mirror the same filtering logic as unread-notifications so we know
// which accounts have "notif-worthy" messages coming in.
function _onDBChanged({ objectClass, objects, objectsRawJSON }) {
  if (objectClass !== Message.name) return;

  const activationTime = _activationTime;
  const newIds = new Set();
  for (const json of (objectsRawJSON || [])) {
    if (json.headersSyncComplete) newIds.add(json.id);
  }
  if (!newIds.size) return;

  for (const msg of objects) {
    if (!msg.unread) continue;
    if (!newIds.has(msg.id)) continue;
    if (!msg.date || msg.date.valueOf() < activationTime) continue;

    const accountId = msg.accountId;
    if (!accountId) continue;

    if (!_isMuted(accountId)) {
      _pendingNonMutedAccounts.add(accountId);
      // Clear after 10s (enough time for sound + notification cycle)
      setTimeout(() => _pendingNonMutedAccounts.delete(accountId), 10000);
    }
  }
}

let _activationTime = Date.now();

export function activate() {
  _activationTime = Date.now();
  _tab = registerPreferencesTab();

  // Watch DB for incoming messages to know which accounts are non-muted
  _unlistenDB = DatabaseStore.listen(_onDBChanged);

  // Patch displayNotification
  _originalDisplayNotification = NativeNotifications.displayNotification.bind(NativeNotifications);
  NativeNotifications.displayNotification = async function(opts) {
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
  _originalPlaySound = SoundRegistry.playSound.bind(SoundRegistry);
  SoundRegistry.playSound = function(soundName) {
    if (soundName === "new-mail") {
      // If there are no non-muted accounts with pending messages, suppress
      if (_pendingNonMutedAccounts.size === 0) {
        return;
      }
    }
    return _originalPlaySound(soundName);
  };
}

export function serialize() {}

export function deactivate() {
  if (_unlistenDB) {
    _unlistenDB();
    _unlistenDB = null;
  }
  if (_originalDisplayNotification) {
    NativeNotifications.displayNotification = _originalDisplayNotification;
    _originalDisplayNotification = null;
  }
  if (_originalPlaySound) {
    SoundRegistry.playSound = _originalPlaySound;
    _originalPlaySound = null;
  }
  if (_tab) {
    PreferencesUIStore.unregisterPreferencesTab(_tab.tabId);
    _tab = null;
  }
  _pendingNonMutedAccounts.clear();
}
