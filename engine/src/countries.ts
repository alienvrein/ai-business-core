// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 GROU LLC

// Every country (ISO 3166-1 alpha-2) and the regions the guided path sorts them into. Pure data with no
// imports, so it runs in the browser and on the server.
// Which countries the knowledge base covers is not decided here: that comes from the taxonomy passed to the engine.

/** ISO 3166-1 alpha-2 codes. */
export const ISO_COUNTRIES: readonly string[] = (
  "AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ " +
  "DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP " +
  "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ " +
  "OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ " +
  "UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
).split(" ");

/** The 27 EU member states. Selecting any of them brings in the EU-level rules. */
export const EU_MEMBERS: readonly string[] = "AT BE BG CY CZ DE DK EE ES FI FR GR HR HU IE IT LT LU LV MT NL PL PT RO SE SI SK".split(" ");

export const COUNTRY_REGION_IDS = ["latam", "north_america", "eu", "europe_other", "asia_pacific", "middle_east", "africa"] as const;
export type CountryRegionId = (typeof COUNTRY_REGION_IDS)[number];

/**
 * Every ISO code in exactly one region. Mexico sits in Latin America only; North America is
 * the UN "Northern America" set (US, CA, BM, GL, PM). TR and the South Caucasus are in Rest of Europe.
 */
export const COUNTRY_REGIONS: Record<CountryRegionId, readonly string[]> = {
  latam: (
    "AG AI AR AW BB BL BO BQ BR BS BZ CL CO CR CU CW DM DO EC FK GD GF GP GT GY HN HT JM KN KY LC MF MQ MS MX NI PA PE PR PY SR SV SX TC TT UY VC VE VG VI"
  ).split(" "),
  north_america: "BM CA GL PM US".split(" "),
  eu: EU_MEMBERS,
  europe_other: "AD AL AM AX AZ BA BY CH FO GB GE GG GI IM IS JE LI MC MD ME MK NO RS RU SM TR UA VA".split(" "),
  asia_pacific: (
    "AF AS AU BD BN BT CC CK CN CX FJ FM GU HK ID IN IO JP KG KH KI KP KR KZ LA LK MH MM MN MO MP MV MY NC NF NP NR NU NZ PF PG PH PK PN PW SB SG TH TJ TK TL TM TO TV TW UM UZ VN VU WF WS"
  ).split(" "),
  middle_east: "AE BH IL IQ IR JO KW LB OM PS QA SA SY YE".split(" "),
  africa: (
    "AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW"
  ).split(" "),
};

const regionByCountry = new Map(COUNTRY_REGION_IDS.flatMap((r) => COUNTRY_REGIONS[r].map((c) => [c, r] as const)));
export const regionOfCountry = (code: string): CountryRegionId | undefined => regionByCountry.get(code);
export const isEuMember = (code: string) => EU_MEMBERS.includes(code);
