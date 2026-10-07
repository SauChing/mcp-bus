export interface SingaporeBusStop {
  code: string;
  name: string;
  road: string;
  zone: string;
  popularServices: string[];
}

export const SINGAPORE_BUS_STOPS: SingaporeBusStop[] = [
  {
    code: '04121',
    name: 'Old Parliament Hse / Victoria Concert Hall',
    road: 'Empress Pl',
    zone: 'Downtown Core / Civic District',
    popularServices: ['195', '961', '961M', '7', '14'],
  },
  {
    code: '01012',
    name: 'Hotel Rendezvous / SMU',
    road: 'Bras Basah Rd',
    zone: 'Museum / Bras Basah',
    popularServices: ['7', '14', '16', '36', '77', '106', '111', '167', '174', '175', '502', '857'],
  },
  {
    code: '03211',
    name: 'Opp Suntec City / Promenade MRT',
    road: 'Temasek Ave',
    zone: 'Marina Centre',
    popularServices: ['36', '70M', '97', '106', '111', '133', '502', '518', '857'],
  },
  {
    code: '09048',
    name: 'Lucky Plaza / Orchard MRT',
    road: 'Orchard Rd',
    zone: 'Orchard Shopping Belt',
    popularServices: ['7', '14', '16', '65', '106', '111', '123', '175', '502'],
  },
  {
    code: '01112',
    name: 'Opp Stamford Primary School',
    road: 'Victoria St',
    zone: 'Bugis / Rochor',
    popularServices: ['2', '12', '33', '130', '133', '960', '980'],
  },
  {
    code: '03019',
    name: 'Opp Fullerton Sq / Raffles Place MRT',
    road: 'Fullerton Rd',
    zone: 'Financial District',
    popularServices: ['10', '70', '100', '107', '130', '131', '167', '196'],
  },
  {
    code: '05013',
    name: 'Chinatown Stn Exit E',
    road: 'New Bridge Rd',
    zone: 'Chinatown / Outram',
    popularServices: ['2', '12', '33', '54', '143', '147', '190', 'CT8'],
  },
  {
    code: '10018',
    name: 'HarbourFront Stn / VivoCity',
    road: 'Telok Blangah Rd',
    zone: 'HarbourFront / Sentosa Gateway',
    popularServices: ['10', '30', '57', '61', '97', '100', '131', '143', '166'],
  },
  {
    code: '84009',
    name: 'Bedok Bus Interchange',
    road: 'Bedok North Ave 1',
    zone: 'East / Bedok Central',
    popularServices: ['7', '9', '14', '16', '18', '25', '30', '60', '66', '69', '87', '168', '196', '197', '222'],
  },
  {
    code: '54009',
    name: 'Bishan Bus Interchange',
    road: 'Bishan St 13',
    zone: 'Central / Bishan',
    popularServices: ['50', '52', '53', '54', '55', '56', '57', '58', '59', '410G', '410W'],
  },
  {
    code: '28009',
    name: 'Jurong East Bus Interchange',
    road: 'Jurong Gateway Rd',
    zone: 'West / Jurong Lake District',
    popularServices: ['41', '49', '51', '52', '66', '78', '79', '97', '98', '105', '143', '160', '183', '197', '333'],
  },
  {
    code: '43009',
    name: 'Woodlands Temporary Bus Interchange',
    road: 'Woodlands Sq',
    zone: 'North / Woodlands Regional Centre',
    popularServices: ['161', '168', '169', '178', '187', '856', '900', '901', '903', '911', '912', '913', '925', '960', '969'],
  },
];

export const LTA_OPERATORS: Record<string, { name: string; color: string; badgeBg: string }> = {
  SBST: {
    name: 'SBS Transit',
    color: '#ba1a1a', // SBS Transit red/purple
    badgeBg: '#ba1a1a',
  },
  SMRT: {
    name: 'SMRT Buses',
    color: '#ba1a1a',
    badgeBg: '#ba1a1a',
  },
  TTS: {
    name: 'Tower Transit Singapore',
    color: '#006948', // Lush green
    badgeBg: '#006948',
  },
  GAS: {
    name: 'Go-Ahead Singapore',
    color: '#fea619',
    badgeBg: '#855300',
  },
};
