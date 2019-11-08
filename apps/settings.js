Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);

g.clear();
const storage = require('Storage');
let settings;

function debug(msg, arg) {
  if (settings.debug)
    console.log(msg, arg);
}

function updateSettings() {
  debug('updating settings', settings);
  storage.erase('@setting');
  storage.write('@setting', settings);
}

function resetSettings() {
  settings = {
    timeout: 10,
    vibrate: true,
    beep: true,
    timezone: 0,
    HID : false,
    debug: false,
  };
  setLCDTimeout(settings.timeout);
  updateSettings();
}

try {
  settings = storage.readJSON('@setting');
} catch (e) {}
if (!settings) resetSettings();

const boolFormat = (v) => v ? "On" : "Off";

function showMainMenu() {
  const mainmenu = {
    '': { 'title': 'Settings' },
    'LCD Timeout': {
      value: settings.timeout,
      min: 0,
      max: 60,
      step: 5,
      onchange: v => {
        settings.timeout = 0 | v;
        updateSettings();
        Bangle.setLCDTimeout(settings.timeout);
      }
    },
    'Beep': {
      value: settings.beep,
      format: boolFormat,
      onchange: () => {
        settings.beep = !settings.beep;
        updateSettings();
        if (settings.beep) {
          Bangle.beep(1);
        }
      }
    },
    'Vibration': {
      value: settings.vibrate,
      format: boolFormat,
      onchange: () => {
        settings.vibrate = !settings.vibrate;
        updateSettings();
        if (settings.vibrate) {
          VIBRATE.write(1);
          setTimeout(()=>VIBRATE.write(0), 10);
        }
      }
    },
    'Time Zone': {
      value: settings.timezone,
      min: -11,
      max: 12,
      step: 1,
      onchange: v => {
        settings.timezone = 0 | v;
        updateSettings();
      }
    },
    'HID': {
      value: settings.HID,
      format: boolFormat,
      onchange: () => {
        settings.HID = !settings.HID;
        updateSettings();
      }
    },
    'Debug': {
      value: settings.debug,
      format: boolFormat,
      onchange: () => {
        settings.debug = !settings.debug;
        updateSettings();
      }
    },
    'Set Time': showSetTimeMenu,
    'Reset': showResetMenu,
    'Turn Off': Bangle.off,
    '< Back': load
  };
  return Bangle.menu(mainmenu);
}

function showResetMenu() {
  const resetmenu = {
    '': { 'title': 'Reset' },
    '< Back': showMainMenu,
    'Reset Settings': () => {
      E.showPrompt('Reset Settings?').then((v) => {
        if (v) {
          E.showMessage('Resetting');
          resetSettings();
        }
        setTimeout(showMainMenu, 50);
      });
    },
    // this is include for debugging. remove for production
    /*'Erase': () => {
      storage.erase('=setting');
      storage.erase('-setting');
      storage.erase('@setting');
      storage.erase('*setting');
      storage.erase('+setting');
      E.reboot();
    }*/
  };
  return Bangle.menu(resetmenu);
}

function showSetTimeMenu() {
  d = new Date();
  const timemenu = {
    '': {
      'title': 'Set Time',
      'predraw': function() {
        d = new Date();
        timemenu.Hour.value = d.getHours();
        timemenu.Minute.value = d.getMinutes();
        timemenu.Second.value = d.getSeconds();
        timemenu.Date.value = d.getDate();
        timemenu.Month.value = d.getMonth() + 1;
        timemenu.Year.value = d.getFullYear();
      }
    },
    '< Back': showMainMenu,
    'Hour': {
      value: d.getHours(),
      min: 0,
      max: 23,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setHours(v);
        setTime(d.getTime()/1000);
      }
    },
    'Minute': {
      value: d.getMinutes(),
      min: 0,
      max: 59,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setMinutes(v);
        setTime(d.getTime()/1000);
      }
    },
    'Second': {
      value: d.getSeconds(),
      min: 0,
      max: 59,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setSeconds(v);
        setTime(d.getTime()/1000);
      }
    },
    'Date': {
      value: d.getDate(),
      min: 1,
      max: 31,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setDate(v);
        setTime(d.getTime()/1000);
      }
    },
    'Month': {
      value: d.getMonth() + 1,
      min: 1,
      max: 12,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setMonth(v - 1);
        setTime(d.getTime()/1000);
      }
    },
    'Year': {
      value: d.getFullYear(),
      min: d.getFullYear() - 10,
      max: d.getFullYear() + 10,
      step: 1,
      onchange: v => {
        d = new Date();
        d.setFullYear(v);
        setTime(d.getTime()/1000);
      }
    }
  };
  return Bangle.menu(timemenu);
}

showMainMenu();
