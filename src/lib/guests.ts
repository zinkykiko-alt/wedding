export type GuestLike = {
  companions: number;
  kids: number;
  status: string;
};

export type Headcount = {
  titularCount: number; // number of Titular guests
  titularPeople: number; // titulars + their companions + kids (the "real" total)
  companions: number; // companions among titulars
  kids: number; // kids among titulars
  benchCount: number; // number of reserve guests
  benchPeople: number; // people they represent, if promoted
};

// Titulars count toward the real headcount; reserve guests are tallied
// separately. Each guest is 1 person plus their companions and kids.
export function computeHeadcount(guests: GuestLike[]): Headcount {
  const hc: Headcount = {
    titularCount: 0,
    titularPeople: 0,
    companions: 0,
    kids: 0,
    benchCount: 0,
    benchPeople: 0,
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
    }
  }

  return hc;
}
