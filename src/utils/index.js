// Format unixtime to Date for display on webpage
export function formatDate(unixtime) {
  var units = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000,
  };
  var rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  var d1 = new Date(unixtime * 1000);
  var getRelativeTime = (d1, d2 = new Date()) => {
    var elapsed = d1 - d2;

    // "Math.abs" accounts for both "past" & "future" scenarios
    for (var u in units)
      if (Math.abs(elapsed) > units[u] || u === 'second')
        return rtf.format(Math.round(elapsed / units[u]), u);
  };
  return getRelativeTime(d1);
}

export function hideWord(w) {
  if (w.length < 3) return w;
  return (
    w.substring(0, 2) +
    '*'.repeat(w.length - 5) +
    w.substring(w.length - 5, w.length)
  );
}
