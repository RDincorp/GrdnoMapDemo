export type DistrictLevel = 'parliamentary' | 'city' | 'regional';

export interface StreetHouseRule {
  streetName: string;
  aliases: string[];
  houseType: 'all' | 'even' | 'odd' | 'specific' | 'range';
  specificHouses?: (number | string)[];
  range?: [number, number];
  notes?: string;
}

export interface ReceptionScheduleItem {
  id: string;
  dayOfWeek: string;
  frequency: string; // e.g. "Каждая 1-я среда месяца"
  time: string; // "16:00 - 20:00"
  locationName: string; // "ГУО «Гимназия №2 г. Гродно»"
  address: string; // "ул. Болдина, 16"
  room: string; // "каб. 104"
  phone: string; // "+375 (152) 62-11-22"
  appointmentRequired: boolean;
  notes?: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface Deputy {
  id: string;
  fullName: string;
  shortName: string; // "Иванов И.И."
  photoUrl?: string;
  districtId: string;
  level: DistrictLevel;
  levelTitle: string; // "Депутат Гродненского городского Совета депутатов XXIX созыва"
  commission: string; // "Постоянная комиссия по градостроительству, ЖКХ и экологии"
  commissionRole: string; // "Председатель комиссии" | "Член комиссии"
  mainJob: string; // "Главный врач УЗ «Гродненская центральная городская поликлиника»"
  party?: string; // "Белорусская партия «Белая Русь»" | "Беспартийный"
  birthYear: number;
  phone: string;
  email: string;
  assistant?: {
    name: string;
    phone: string;
  };
  receptionSchedules: ReceptionScheduleItem[];
  initiatives: string[];
  bio: string;
}

export interface District {
  id: string;
  number: number;
  name: string; // "Доваторский избирательный округ №3"
  shortName: string; // "Округ №3 (Доваторский)"
  level: DistrictLevel;
  districtAdministration: 'Ленинский район' | 'Октябрьский район';
  color: string;
  strokeColor: string;
  votersCount: number;
  populationEst: number;
  center: [number, number]; // [lat, lng]
  polygonCoordinates: [number, number][]; // [lat, lng][]
  deputyId: string;
  streets: StreetHouseRule[];
  description: string;
  keyObjects: string[];
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  type: 'ispolkom' | 'administration' | 'soviet' | 'party';
  categoryTitle: string;
  address: string;
  coordinates: [number, number];
  phone?: string;
  hotline?: string;
  receptionHours?: string;
  workSchedule?: string;
  headName?: string;
  headPosition?: string;
  siteUrl?: string;
  email?: string;
  competencies?: string[];
  districtCoverage?: string;
}

export interface CitizenProblemRoute {
  id: string;
  category: 'Дороги и транспорт' | 'Благоустройство и среда' | 'Здравоохранение' | 'Образование' | 'Социальная защита и правовые вопросы';
  issueTitle: string;
  description: string;
  recommendedAuthority: string;
  authorityType: 'ispolkom' | 'administration' | 'deputy';
  deputyRole: string;
  actionSteps: string[];
  hotline: string;
}

export type SearchResultType = 'address' | 'deputy' | 'district' | 'institution';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  highlightText?: string;
  districtId?: string;
  deputyId?: string;
  institutionId?: string;
  coordinates?: [number, number];
  matchedStreet?: string;
  matchedHouse?: string;
  deputy?: Deputy;
  district?: District;
  institution?: Institution;
  confidenceScore?: number;
  didYouMean?: string;
  houseStatus?: 'matches' | 'out_of_range' | 'all';
}
