export type GuestLike = {
  companions: number;
  kids: number;
  status: string;
  side: string;
};

export type GuestFull = {
  id: string;
  name: string;
  phone: string;
  companions: number;
  kids: number;
  status: string;
  side: string;
  godparent: boolean;
};

export type GuestFilters = {
  query: string;
  side: string; // ALL | ALICIA | BRUNO | NONE
  status: string; // ALL | TITULAR | BENCH
  noPhone: boolean;
  noKids: boolean;
  godparentOnly: boolean;
};

// Accent- and case-insensitive so "alicia" matches "Alícia".
function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function filterGuests(guests: GuestFull[], f: GuestFilters): GuestFull[] {
  const q = normalizeText(f.query.trim());
  return guests.filter((g) => {
    if (q && !normalizeText(g.name).includes(q) && !normalizeText(g.phone).includes(q)) {
      return false;
    }
    if (f.side === "NONE") {
      if (g.side !== "") return false;
    } else if (f.side !== "ALL" && g.side !== f.side) {
      return false;
    }
    if (f.status !== "ALL" && g.status !== f.status) return false;
    if (f.noPhone && g.phone.trim() !== "") return false;
    if (f.noKids && g.kids !== 0) return false;
    if (f.godparentOnly && !g.godparent) return false;
    return true;
  });
}

export type Headcount = {
  titularCount: number; // number of Titular guests
  titularPeople: number; // titulars + their companions + kids (the "real" total)
  companions: number; // companions among titulars
  kids: number; // kids among titulars
  benchCount: number; // number of reserve guests
  benchPeople: number; // people they represent, if promoted
  bySide: { ALICIA: number; BRUNO: number; NONE: number }; // confirmed people per side
  bySideKids: { ALICIA: number; BRUNO: number; NONE: number }; // kids within each side
};

// Titulars count toward the real headcount; reserve guests are tallied
// separately. Each guest is 1 person plus their companions and kids. Confirmed
// people are also split by wedding side (Alicia / Bruno / not assigned).
export function computeHeadcount(guests: GuestLike[]): Headcount {
  const hc: Headcount = {
    titularCount: 0,
    titularPeople: 0,
    companions: 0,
    kids: 0,
    benchCount: 0,
    benchPeople: 0,
    bySide: { ALICIA: 0, BRUNO: 0, NONE: 0 },
    bySideKids: { ALICIA: 0, BRUNO: 0, NONE: 0 },
  };

  for (const g of guests) {
    const people = 1 + g.companions + g.kids;
    if (g.status === "BENCH") {
      hc.benchCount += 1;
      hc.benchPeople += people;
    } else {
      hc.titularCount += 1;
      hc.titularPeople += people;
      hc.companions += g.companions;
      hc.kids += g.kids;
      const key = g.side === "ALICIA" ? "ALICIA" : g.side === "BRUNO" ? "BRUNO" : "NONE";
      hc.bySide[key] += people;
      hc.bySideKids[key] += g.kids;
    }
  }

  return hc;
}
