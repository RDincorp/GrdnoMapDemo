import { District, Deputy, Institution, SearchResult, StreetHouseRule } from '../types';

/**
 * Ray-casting algorithm to test if a point is inside a polygon
 * @param point [latitude, longitude]
 * @param polygon array of [latitude, longitude]
 */
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [lat, lng] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = ((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Finds which electoral district contains the given [lat, lng] point
 */
export function findDistrictByCoordinates(point: [number, number], districts: District[]): District | undefined {
  return districts.find((d) => isPointInPolygon(point, d.polygonCoordinates));
}

/**
 * Normalizes text for typo-tolerant, casing-neutral matching
 */
export function normalizeText(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[\.,\-\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts street component and house number from user input
 * Examples:
 * - "ул. Пушкина 18" -> street: "пушкина", house: 18
 * - "БЛК 25" -> street: "блк", house: 25
 * - "улица Горького дом 88а" -> street: "горького", house: 88
 * - "Советская" -> street: "советская", house: undefined
 */
export function parseAddressQuery(query: string | undefined | null): { streetPart: string; houseNumber?: number; rawHouse?: string; isAllHouses?: boolean } {
  if (!query) return { streetPart: '', isAllHouses: false };
  let cleaned = String(query).toLowerCase().replace(/ё/g, 'е').trim();

  // Strip prefix words like "гродно", "г.", "город", "улица", "ул", "проспект", "пр", "бульвар", "б-р", "пер", "переулок"
  const prefixRegex = /^(гродно|г|город|ул|улица|проспект|пр|пр-т|бульвар|б-р|бул|пер|переулок)\s+/i;
  while (prefixRegex.test(cleaned)) {
    cleaned = cleaned.replace(prefixRegex, '');
  }

  // Check if query contains "all", "(all)", "все дома", "все", "весь"
  const allMatch = cleaned.match(/\s*(?:\(?all\)?|все\s*дома|все|весь)\s*$/i);
  let isAllHouses = false;
  if (allMatch) {
    isAllHouses = true;
    cleaned = cleaned.slice(0, allMatch.index).trim();
  }

  // Extract house number if present at the end or marked with "д.", "дом", "кв"
  const houseMatch = cleaned.match(/(?:(?:д|дом|корп|строение|к)\.?\s*)?(\d+)\s*([а-яa-z]|\/\d+)?$/i);
  
  if (houseMatch) {
    const houseNumber = parseInt(houseMatch[1], 10);
    const rawHouse = houseMatch[0].trim();
    // Remove the house part from the street part
    const streetPart = cleaned.slice(0, houseMatch.index).trim();
    return {
      streetPart: streetPart.length > 0 ? streetPart : cleaned,
      houseNumber: isNaN(houseNumber) ? undefined : houseNumber,
      rawHouse,
      isAllHouses: false,
    };
  }

  return {
    streetPart: cleaned,
    isAllHouses,
  };
}

/**
 * Evaluates whether a house number satisfies the street rule
 */
export function checkHouseMatchesRule(houseNumber: number | undefined, rule: StreetHouseRule): boolean {
  if (houseNumber === undefined) return true; // Matches entire street
  
  if (rule.houseType === 'all') return true;

  if (rule.houseType === 'range' && rule.range) {
    return houseNumber >= rule.range[0] && houseNumber <= rule.range[1];
  }

  if (rule.houseType === 'even') {
    return houseNumber % 2 === 0;
  }

  if (rule.houseType === 'odd') {
    return houseNumber % 2 !== 0;
  }

  if (rule.houseType === 'specific' && rule.specificHouses) {
    return rule.specificHouses.some((h) => {
      if (typeof h === 'number') return h === houseNumber;
      return parseInt(h, 10) === houseNumber || String(h).toLowerCase() === String(houseNumber).toLowerCase();
    });
  }

  return true;
}

/**
 * Computes Levenshtein edit distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row: number[] = [];
  for (let i = 0; i <= a.length; i++) {
    row[i] = i;
  }

  for (let i = 1; i <= b.length; i++) {
    let prev = i;
    for (let j = 1; j <= a.length; j++) {
      let val;
      if (b[i - 1] === a[j - 1]) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
  }

  return row[a.length];
}

/**
 * Accurate real-world Grodno street and landmark coordinate database
 */
export const GRODNO_STREET_COORDINATES: Record<string, [number, number]> = {
  'улица доватора': [53.6948, 23.8265],
  'переулок доватора': [53.6965, 23.8275],
  'улица пушкина': [53.6965, 23.8315],
  'бульвар ленинского комсомола': [53.6945, 23.8155],
  'блк': [53.6945, 23.8155],
  'улица сухомбаева': [53.6940, 23.8135],
  'улица дзержинского': [53.6995, 23.8385],
  'улица болдина': [53.6980, 23.8075],
  'улица островского': [53.6920, 23.8290],
  'улица 1 мая': [53.6870, 23.8365],
  'улица академическая': [53.6875, 23.8380],
  'улица волковича': [53.6885, 23.8360],
  'улица советская': [53.6815, 23.8312],
  'улица элизы ожешко': [53.6845, 23.8380],
  'улица замковая': [53.6775, 23.8235],
  'улица карла маркса': [53.6785, 23.8365],
  'улица ленина': [53.6820, 23.8410],
  'улица социалистическая': [53.6800, 23.8350],
  'улица большая троицкая': [53.6795, 23.8260],
  'улица малая троицкая': [53.6790, 23.8245],
  'улица найдуса': [53.6808, 23.8290],
  'улица доминиканская': [53.6812, 23.8285],
  'улица кирова': [53.6780, 23.8335],
  'улица свердлова': [53.6765, 23.8375],
  'улица парижской коммуны': [53.6778, 23.8315],
  'улица тельмана': [53.6805, 23.8340],
  'улица городничанская': [53.6820, 23.8345],
  'улица калючинская': [53.6800, 23.8305],
  'улица урицкого': [53.6795, 23.8360],
  'площадь ленина': [53.683839, 23.833462],
  'площадь советская': [53.6780, 23.8300],
  'улица будённого': [53.6825, 23.8445],
  'улица врублевского': [53.7025, 23.8110],
  'улица комарова': [53.7060, 23.8170],
  'улица серафимовича': [53.7085, 23.8210],
  'улица докучаева': [53.7095, 23.8190],
  'улица курчатова': [53.7080, 23.8250],
  'улица богуцкого': [53.7145, 23.8120],
  'улица домбровского': [53.7090, 23.8050],
  'улица максима горького': [53.7040, 23.8235],
  'улица поповича': [53.6710, 23.7960],
  'переулок поповича': [53.6700, 23.7940],
  'улица лизы чайкиной': [53.6635, 23.7840],
  'улица фолюш': [53.6590, 23.7740],
  'улица репина': [53.6660, 23.7770],
  'улица ольги соломовой': [53.6610, 23.7780],
  'улица советских пограничников': [53.6730, 23.8080],
  'улица дарвина': [53.6765, 23.8190],
  'улица краснопартизанская': [53.6750, 23.8140],
  'улица лермонтова': [53.686425, 23.829466],
  'улица гагарина': [53.672356, 23.813646],
  'проспект клецкова': [53.6520, 23.8550],
  'улица кабяка': [53.6535, 23.8680],
  'улица пестрака': [53.6530, 23.8450],
  'переулок пестрака': [53.6540, 23.8470],
  'проспект янки купалы': [53.6580, 23.8390],
  'индурское шоссе': [53.6440, 23.8580],
  'улица томина': [53.6610, 23.8580],
};

export function getExactStreetCoordinates(streetName: string, fallbackCenter: [number, number]): [number, number] {
  const norm = normalizeText(streetName);
  if (GRODNO_STREET_COORDINATES[norm]) {
    return GRODNO_STREET_COORDINATES[norm];
  }
  for (const [key, coords] of Object.entries(GRODNO_STREET_COORDINATES)) {
    if (key.includes(norm) || norm.includes(key)) {
      return coords;
    }
  }
  return fallbackCenter;
}

/**
 * Common Grodno street name phonetic & colloquial mapping for live Russian typing
 */
const COMMON_STREET_TYPOS: Record<string, string[]> = {
  'доватора': ['довлатова', 'довлатов', 'доватор', 'даватора', 'даватор', 'доваторов', 'довлатовой'],
  'элизы ожешко': ['ожешко', 'ажешко', 'ожешка', 'элиза', 'элизы', 'ожешки', 'ожешки ул'],
  'максима горького': ['горького', 'горький', 'горьково', 'максим горький', 'м горького', 'горькова'],
  'дзержинского': ['дзержинского', 'дзержинск', 'зержинского', 'дзержинского ул', 'держинского'],
  'пушкина': ['пушкин', 'пушкино', 'пушкина ул', 'александра пушкина'],
  'советская': ['советск', 'савецкая', 'совецкая', 'советская ул'],
  'ольги соломовой': ['соломовой', 'соломова', 'саломовой', 'саломова', 'ольги соломова'],
  'лизы чайкиной': ['чайкиной', 'чайкина', 'лизы чайкина', 'чайкино'],
  'проспект клецкова': ['клецкова', 'клецков', 'клецкава', 'клецова', 'клецкова пр'],
  'проспект янки купалы': ['янки купалы', 'янки купала', 'купалы', 'куполы', 'купала', 'янка купала'],
  'поповича': ['попович', 'паповича', 'папович', 'поповича ул', 'космонавта поповича'],
  'врублевского': ['врублевского', 'врублевск', 'рублевского', 'врублевскаго', 'врублевский'],
  'курчатова': ['курчатова', 'курчатов', 'курчатава'],
  'болдина': ['болдина', 'болдин', 'балдина', 'балдин'],
  'будённого': ['буденного', 'буденого', 'буденный', 'буденнова'],
  'сухомбаева': ['сухомбаева', 'сухомбаев', 'сухамбаева', 'сухамбаев'],
  'пестрака': ['пестрака', 'пестрак', 'пестряка', 'пестряк'],
  'кабяка': ['кабяка', 'кабяк', 'кобяка', 'кобяк'],
  'фолюш': ['фолюш', 'фолюша', 'фалюш', 'фалюша'],
  'репина': ['репина', 'репин', 'ряпина'],
  'большая троицкая': ['троицкая', 'б троицкая', 'большая троицкая', 'траицкая'],
  'советских пограничников': ['пограничников', 'советских пограничников', 'сов пограничников', 'паграничников'],
  'томина': ['томина', 'томин', 'тамина'],
  'комарова': ['комарова', 'комаров', 'камарова'],
  'серафимовича': ['серафимовича', 'серафимович'],
  'докучаева': ['докучаева', 'докучаев'],
  'богуцкого': ['богуцкого', 'богуцкий'],
  'домбровского': ['домбровского', 'домбровский'],
  'дарвина': ['дарвина', 'дарвин'],
  'краснопартизанская': ['краснопартизанская', 'краснопартизанск'],
  'индурское шоссе': ['индурское', 'индурское шоссе', 'индурская'],
  'карла маркса': ['карла маркса', 'маркса', 'к маркса'],
  'ленина': ['ленина', 'ленин'],
  'замковая': ['замковая', 'замкова'],
  'социалистическая': ['социалистическая', 'социалистическ', 'соц'],
};

/**
 * Computes match score and typo correction for a street given a user's input
 */
function scoreStreetMatch(queryStreet: string, streetName: string, aliases: string[]): { score: number; typoCorrection?: string } {
  const normQuery = normalizeText(queryStreet);
  if (!normQuery || normQuery.length < 3) return { score: 0 };

  const normStreet = normalizeText(streetName);
  const normAliases = aliases.map((a) => normalizeText(a));
  const allNames = [normStreet, ...normAliases];

  // 1. Exact match with street name or aliases
  if (allNames.some((n) => n === normQuery)) {
    return { score: 100 };
  }

  // 2. Starts with query (prefix match from 3 letters)
  if (allNames.some((n) => n.startsWith(normQuery) || normQuery.startsWith(n))) {
    return { score: 95 };
  }

  // 3. Check known Russian typo/habit dictionaries (e.g. "довлатова" -> "доватора")
  for (const [canonical, typoList] of Object.entries(COMMON_STREET_TYPOS)) {
    if (normStreet.includes(canonical) || canonical.includes(normStreet)) {
      if (typoList.some((t) => t === normQuery || normQuery.startsWith(t) || t.startsWith(normQuery))) {
        return {
          score: 90,
          typoCorrection: `«${queryStreet}» → ${streetName}`,
        };
      }
    }
  }

  // 4. Substring inclusion
  if (allNames.some((n) => n.includes(normQuery) || normQuery.includes(n))) {
    return { score: 85 };
  }

  // 5. Word stem / token matching (e.g. "довлатов" / "доватор", "пушкин" / "пушкина")
  const queryTokens = normQuery.split(/\s+/).filter((t) => t.length >= 3);
  for (const name of allNames) {
    const nameTokens = name.split(/\s+/).filter((t) => t.length >= 3);
    for (const qToken of queryTokens) {
      for (const nToken of nameTokens) {
        // Stem prefix (first 4-5 chars)
        const minLen = Math.min(qToken.length, nToken.length);
        if (minLen >= 4 && qToken.slice(0, 4) === nToken.slice(0, 4)) {
          return { score: 80, typoCorrection: `«${queryStreet}» → ${streetName}` };
        }

        // Levenshtein distance on words with 5+ letters
        if (qToken.length >= 5 && nToken.length >= 5) {
          const dist = levenshteinDistance(qToken, nToken);
          if (dist <= 2) {
            return {
              score: 75,
              typoCorrection: `«${queryStreet}» → ${streetName}`,
            };
          }
        }
      }
    }
  }

  // 6. Direct Levenshtein on entire normalized streetPart
  if (normQuery.length >= 5) {
    for (const name of allNames) {
      const dist = levenshteinDistance(normQuery, name);
      if (dist <= 2) {
        return {
          score: 70,
          typoCorrection: `«${queryStreet}» → ${streetName}`,
        };
      }
    }
  }

  return { score: 0 };
}

/**
 * Comprehensive Smart Search for the GIS Portal
 */
export function searchEverything(
  rawQuery: string | undefined | null,
  districts: District[],
  deputies: Deputy[],
  institutions: Institution[]
): SearchResult[] {
  if (!rawQuery) return [];
  const query = String(rawQuery).trim();
  // Starts smart suggestion from the first 3 characters!
  if (query.length < 3) return [];

  const normQuery = normalizeText(query);
  const { streetPart, houseNumber, rawHouse } = parseAddressQuery(query);

  const results: SearchResult[] = [];
  const seenKeys = new Set<string>();

  // 1. Street / Address Matching (With live Russian language typo-tolerance & instant Deputy pairing)
  districts.forEach((district) => {
    const deputy = deputies.find((d) => d.id === district.deputyId);

    district.streets.forEach((streetRule) => {
      const match = scoreStreetMatch(streetPart, streetRule.streetName, streetRule.aliases);

      if (match.score > 0) {
        const matchesHouse = checkHouseMatchesRule(houseNumber, streetRule);
        const houseSuffix = houseNumber ? `, д. ${houseNumber}` : '';
        const resKey = `addr-${district.id}-${streetRule.streetName}-${houseNumber || 'all'}`;

        if (!seenKeys.has(resKey)) {
          seenKeys.add(resKey);

          const isAllHouses = streetRule.houseType === 'all';
          let highlightText = '';
          let houseStatus: SearchResult['houseStatus'] = isAllHouses ? 'all' : 'matches';

          if (houseNumber !== undefined) {
            if (matchesHouse) {
              houseStatus = 'matches';
              highlightText = `✅ Дом ${houseNumber} входит в ${district.shortName}. Депутат: ${deputy?.fullName || '—'}.`;
            } else {
              houseStatus = 'out_of_range';
              highlightText = `⚠️ Дом ${houseNumber} не входит в этот округ. В округ №${district.number} входят: ${streetRule.notes || ''}.`;
            }
          } else {
            if (isAllHouses) {
              houseStatus = 'all';
              highlightText = `👤 Депутат округа: ${deputy?.fullName || '—'}. Все дома улицы (all) входят в ${district.shortName}.`;
            } else {
              highlightText = `👤 Депутат округа: ${deputy?.fullName || '—'} (${streetRule.notes || 'Частичный охват'}).`;
            }
          }

          if (match.typoCorrection) {
            highlightText = `💡 По запросу ${match.typoCorrection}: ${highlightText}`;
          }

          const streetCoords = getExactStreetCoordinates(streetRule.streetName, district.center);

          results.push({
            id: resKey,
            type: 'address',
            title: `${streetRule.streetName}${houseSuffix}`,
            subtitle: `Депутат: ${deputy?.fullName || '—'} • ${district.shortName}`,
            highlightText,
            districtId: district.id,
            deputyId: deputy?.id,
            coordinates: streetCoords,
            matchedStreet: streetRule.streetName,
            matchedHouse: houseNumber ? String(houseNumber) : undefined,
            deputy,
            district,
            confidenceScore: match.score,
            didYouMean: match.typoCorrection,
            houseStatus,
          });
        }
      }
    });
  });

  // 2. Deputy Direct Matching (Full name, job, commission)
  deputies.forEach((deputy) => {
    const normDeputyName = normalizeText(deputy.fullName);
    const normShortName = normalizeText(deputy.shortName);
    const normCommission = normalizeText(deputy.commission);
    const normJob = normalizeText(deputy.mainJob);
    const district = districts.find((d) => d.id === deputy.districtId);

    const isNameMatch =
      normDeputyName.includes(normQuery) ||
      normShortName.includes(normQuery) ||
      normQuery.split(/\s+/).some((token) => token.length >= 3 && normDeputyName.includes(token));

    const isJobMatch = normCommission.includes(normQuery) || normJob.includes(normQuery);

    if (isNameMatch || isJobMatch) {
      const resKey = `dep-${deputy.id}`;
      if (!seenKeys.has(resKey)) {
        seenKeys.add(resKey);
        results.push({
          id: resKey,
          type: 'deputy',
          title: deputy.fullName,
          subtitle: `${deputy.levelTitle} • ${district?.shortName || ''}`,
          highlightText: `👤 ${deputy.commissionRole}: ${deputy.commission} • Прием: ${deputy.receptionSchedules[0]?.frequency || ''}, ${deputy.receptionSchedules[0]?.time || ''}`,
          districtId: district?.id,
          deputyId: deputy.id,
          coordinates: district?.center,
          deputy,
          district,
          confidenceScore: isNameMatch ? 98 : 70,
        });
      }
    }
  });

  // 3. District Matches (Name, Number, Key Objects)
  districts.forEach((district) => {
    const normDistName = normalizeText(district.name);
    const numMatch = query.match(/\d+/);
    const isNumMatch = numMatch && parseInt(numMatch[0], 10) === district.number;
    const deputy = deputies.find((d) => d.id === district.deputyId);

    const matchesKeyObjects = district.keyObjects.some((obj) =>
      normalizeText(obj).includes(normQuery)
    );

    if (
      normDistName.includes(normQuery) ||
      (normQuery.includes('округ') && normDistName.length > 0) ||
      isNumMatch ||
      matchesKeyObjects
    ) {
      const resKey = `dist-${district.id}`;
      if (!seenKeys.has(resKey)) {
        seenKeys.add(resKey);
        results.push({
          id: resKey,
          type: 'district',
          title: district.name,
          subtitle: `${district.districtAdministration} • Избирателей: ${district.votersCount.toLocaleString('ru-RU')}`,
          highlightText: `Депутат: ${deputy?.fullName || '—'}. ${district.description}`,
          districtId: district.id,
          deputyId: deputy?.id,
          coordinates: district.center,
          deputy,
          district,
          confidenceScore: 85,
        });
      }
    }
  });

  // 4. Institutions Matches
  institutions.forEach((inst) => {
    const normInstName = normalizeText(inst.name);
    const normShort = normalizeText(inst.shortName);
    const normHead = normalizeText(inst.headName);
    const normAddress = normalizeText(inst.address);
    const matchesCompetency = inst.competencies.some((c) =>
      normalizeText(c).includes(normQuery)
    );

    if (
      normInstName.includes(normQuery) ||
      normShort.includes(normQuery) ||
      normHead.includes(normQuery) ||
      normAddress.includes(normQuery) ||
      matchesCompetency ||
      (normQuery.includes('исполком') && inst.type === 'ispolkom') ||
      (normQuery.includes('администрация') && inst.type === 'administration') ||
      (normQuery.includes('совет') && inst.type === 'soviet')
    ) {
      const resKey = `inst-${inst.id}`;
      if (!seenKeys.has(resKey)) {
        seenKeys.add(resKey);
        results.push({
          id: resKey,
          type: 'institution',
          title: inst.name,
          subtitle: `${inst.categoryTitle} • ${inst.address}`,
          highlightText: `Руководитель: ${inst.headName} (${inst.headPosition})`,
          institutionId: inst.id,
          coordinates: inst.coordinates,
          institution: inst,
          confidenceScore: 75,
        });
      }
    }
  });

  // Sort by confidenceScore descending
  return results
    .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
    .slice(0, 10);
}
