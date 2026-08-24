function computeEasterDate(year: number){
  // Anonymous Gregorian algorithm (Meeus/Jones/Butcher)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number){
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date){
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((b.setHours(0,0,0,0) - a.setHours(0,0,0,0)) / MS);
}

function nearestSunday(date: Date, direction = -1){
  // direction -1 = on/before, +1 = on/after
  const d = new Date(date);
  const dow = d.getDay(); // 0 = Sunday
  if (dow === 0) return d;
  const offset = direction < 0 ? -dow : (7 - dow);
  return addDays(d, offset);
}

// Advent 1 = the 4th Sunday before Christmas (i.e. Sunday on/before Dec 25,
// then back 3 more full weeks). This matches the actual liturgical calendar.
function getAdventStart(year: number){
  const christmas = new Date(year, 11, 25);
  const sundayOnOrBeforeChristmas = nearestSunday(christmas, -1);
  return addDays(sundayOnOrBeforeChristmas, -21);
}

// Returns the full set of key dates for a given calendar year's Easter cycle
function getLiturgicalDates(year: number){
  const easter = computeEasterDate(year);
  const ashWednesday = addDays(easter, -46); // Lent = 46 days incl. Sundays, 40 fasting days
  const palmSunday = addDays(easter, -7);
  const holyThursday = addDays(easter, -3);
  const goodFriday = addDays(easter, -2);
  const holySaturday = addDays(easter, -1);
  const pentecost = addDays(easter, 49); // 7 weeks after Easter
  const eastertideEnd = pentecost;

  // Advent: the 4th Sunday before Christmas (real liturgical rule)
  const christmas = new Date(year, 11, 25);
  const adventStart = getAdventStart(year);

  return {
    easter, ashWednesday, palmSunday, holyThursday, goodFriday, holySaturday,
    pentecost, eastertideEnd, christmas, adventStart,
  };
}

// The core function: given "now", determine which season we're in,
// how many days into it, how many days remain, and what % complete.
export function getCurrentLiturgicalSeason(now = new Date()){
  const year = now.getFullYear();
  const thisYear = getLiturgicalDates(year);

  const inRange = (start: Date, end: Date) => now >= start && now < end;

  // Advent can span Nov/Dec of "this year" OR carry from late Nov of prior year
  // into early Dec — but adventStart is always computed per-year correctly,
  // so we just check this year's Advent window (Nov 27–Dec 24ish → Dec 25).
  if (inRange(thisYear.adventStart, thisYear.christmas)) {
    const totalDays = daysBetween(new Date(thisYear.adventStart), new Date(thisYear.christmas));
    const dayNum = daysBetween(new Date(thisYear.adventStart), new Date(now)) + 1;
    return {
      id: "advent", label: "Advent", isSpecial: true,
      dayNumber: dayNum, totalDays,
      startDate: thisYear.adventStart, endDate: thisYear.christmas,
      percentComplete: Math.min(100, Math.round((dayNum / totalDays) * 100)),
    };
  }

  if (inRange(thisYear.ashWednesday, thisYear.easter)) {
    const totalDays = daysBetween(new Date(thisYear.ashWednesday), new Date(thisYear.easter));
    const dayNum = daysBetween(new Date(thisYear.ashWednesday), new Date(now)) + 1;
    // Distinguish Holy Week as a sub-phase for UI emphasis
    const isHolyWeek = now >= thisYear.palmSunday && now < thisYear.easter;
    return {
      id: "lent", label: isHolyWeek ? "Holy Week" : "Lent", isSpecial: true,
      dayNumber: dayNum, totalDays,
      startDate: thisYear.ashWednesday, endDate: thisYear.easter,
      isHolyWeek,
      percentComplete: Math.min(100, Math.round((dayNum / totalDays) * 100)),
    };
  }

  if (inRange(thisYear.easter, thisYear.eastertideEnd)) {
    const totalDays = daysBetween(new Date(thisYear.easter), new Date(thisYear.eastertideEnd));
    const dayNum = daysBetween(new Date(thisYear.easter), new Date(now)) + 1;
    return {
      id: "eastertide", label: "Eastertide", isSpecial: true,
      dayNumber: dayNum, totalDays,
      startDate: thisYear.easter, endDate: thisYear.eastertideEnd,
      percentComplete: Math.min(100, Math.round((dayNum / totalDays) * 100)),
    };
  }

  // Everything else is Ordinary Time — always accessible, no countdown framing
  return {
    id: "ordinary", label: "Ordinary Time", isSpecial: false,
    dayNumber: null, totalDays: null,
    startDate: null, endDate: null,
    percentComplete: null,
  };
}

// Convenience: how many days until the next special season begins (for
// a "coming soon" teaser during Ordinary Time — a Netflix-style trailer).
export function getNextSpecialSeason(now = new Date()){
  const year = now.getFullYear();
  const thisYear = getLiturgicalDates(year);
  const nextYear = getLiturgicalDates(year + 1);

  const candidates = [
    { id: "advent", label: "Advent", start: thisYear.adventStart },
    { id: "lent", label: "Lent", start: thisYear.ashWednesday },
    { id: "advent", label: "Advent", start: nextYear.adventStart },
  ].filter(c => c.start > now).sort((a,b) => a.start.getTime() - b.start.getTime());

  if (candidates.length === 0) return null;
  const next = candidates[0];
  const daysUntil = daysBetween(new Date(now), new Date(next.start));
  return { ...next, daysUntil };
}



